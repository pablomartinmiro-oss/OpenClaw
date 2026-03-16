# GHL Dashboard — Architecture Patterns

## System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        RAILWAY PLATFORM                         │
│                                                                 │
│  ┌─────────────┐    ┌──────────────┐    ┌──────────────────┐   │
│  │  Next.js 16  │───▶│  PostgreSQL   │    │      Redis       │   │
│  │  App Router  │    │  (Prisma v7)  │    │  (Cache-aside)   │   │
│  │              │───▶│              │    │                  │   │
│  └──────┬───────┘    └──────────────┘    └──────────────────┘   │
│         │                                                       │
└─────────┼───────────────────────────────────────────────────────┘
          │
          │ HTTPS
          │
    ┌─────┴──────────────────────────────────┐
    │           EXTERNAL SERVICES             │
    │                                         │
    │  ┌───────────────┐  ┌───────────────┐  │
    │  │  GoHighLevel   │  │  Claude API   │  │
    │  │  API v2        │  │  (Anthropic)  │  │
    │  │  - Contacts    │  │  - Voucher    │  │
    │  │  - Convos      │  │    image OCR  │  │
    │  │  - Pipelines   │  │              │  │
    │  │  - OAuth       │  │              │  │
    │  └───────────────┘  └───────────────┘  │
    └─────────────────────────────────────────┘
```

## Request Flow

```
Browser → Middleware (JWT check) → Next.js Route
  │
  ├── (auth) routes: /login, /register — no auth required
  │
  ├── (dashboard) routes: /, /reservas, /settings, etc.
  │   └── Layout wraps with SessionProvider + QueryClientProvider
  │
  └── API routes:
      ├── /api/auth/*           — NextAuth handlers
      ├── /api/crm/*            — GHL bridge (auth + permissions + cache-aside + GHL client)
      ├── /api/reservations/*   — Local DB CRUD (auth + tenant scope)
      ├── /api/voucher/read     — Claude API (auth + image → structured JSON)
      ├── /api/settings/*       — Tenant + team + mappings (auth + permissions)
      └── /api/health           — Public health check
```

## Multi-Tenant Architecture

```
Tenant (company)
  ├── Users (team members, each with Role)
  ├── Roles (Owner, Manager, Sales Rep, VA/Admin — with permissions array)
  ├── ModuleConfigs (per-module settings)
  ├── Reservations (with voucher tracking fields)
  ├── Quotes + QuoteItems
  ├── Products (catalog)
  ├── GrouponProductMappings (regex → services mapping)
  ├── StationCapacity (per station/date)
  ├── Notifications
  └── GHL Connection (encrypted OAuth tokens, locationId)
```

**Every query includes `WHERE tenantId = ?`** — enforced at the API route level.

## Database Access
- Import `prisma` from `@/lib/db`
- Uses Prisma v7 with `@prisma/adapter-pg` (not direct URL)
- Generated client at `src/generated/prisma/client`
- Every query MUST include `tenantId` scope

## Caching
- Import `redis`, `getCachedOrFetch`, `invalidateCache` from `@/lib/cache/redis`
- Cache keys defined in `@/lib/cache/keys.ts`
- TTLs defined in `CacheTTL` constant
- All GHL reads go through `getCachedOrFetch()`
- Webhook-triggered invalidation via `@/lib/cache/invalidation.ts`

## Encryption
- Import `encrypt`/`decrypt` from `@/lib/encryption`
- Uses AES-256-GCM with random IV
- Format: `iv:tag:ciphertext` (all hex-encoded)
- Used for GHL access/refresh tokens

## Logging
- Import `logger`, `createRequestLogger`, `createGHLLogger` from `@/lib/logger`
- Never use `console.log` — use structured pino logger
- Child loggers carry `tenantId` and `userId` context

## Environment
- Bootstrap modules (logger, db, redis, encryption) read `process.env` directly
- All application code imports `env` from `@/lib/env` for validated access
- Exception: `ANTHROPIC_API_KEY` read via `process.env` (per spec requirement)

## Testing
- Tests in `__tests__/` directory, mirroring `src/` structure
- Prisma and Redis mocked in `__tests__/setup.ts`
- Run with `npx vitest run`

## Authentication

### NextAuth v5 Setup
- Config in `src/lib/auth/config.ts` — exports `handlers`, `auth`, `signIn`, `signOut`, `SESSION_COOKIE_NAME`
- Credentials provider with bcrypt password verification
- JWT strategy — session data embedded in token
- Session includes: `id`, `email`, `name`, `tenantId`, `roleId`, `roleName`, `permissions`, `onboardingComplete`

### Registration Flow
- `POST /api/auth/register` — two paths:
  - **New tenant**: creates Tenant + 4 Roles + User (Owner) + ModuleConfigs in transaction
  - **Invite join**: validates invite token, updates placeholder user, assigns Sales Rep role
- After registration: auto-login via `signIn("credentials")` → redirect

### Cookie Configuration
- Explicit `cookies.sessionToken` with name derived from AUTH_URL protocol
- `__Secure-authjs.session-token` for HTTPS, `authjs.session-token` for HTTP
- Critical for deployments behind TLS-terminating proxies (Railway)

## RBAC
- 15 permission keys defined in `src/lib/auth/permissions.ts`
- 4 default roles: Owner/Manager (all), Sales Rep, Marketing, VA/Admin
- `hasPermission(perms, key)`, `hasAnyPermission()`, `hasAllPermissions()` — pure functions
- `RoleGate` component (`src/components/shared/RoleGate.tsx`) — client-side UI gating
- `usePermissions()` hook (`src/hooks/usePermissions.ts`) — returns `can()`, `canAny()`, `canAll()`
- Permission type: `PermissionKey` from `src/types/auth.ts`

## Middleware
- `src/middleware.ts` — uses `getToken()` from `next-auth/jwt` (edge-compatible)
- Does NOT import `@/lib/auth/config` (would pull in Prisma → node:path → edge crash)
- Public routes: `/login`, `/register`, `/api/auth`, `/api/health`, `/api/crm/webhooks`, `/api/crm/oauth`
- Unauthenticated users redirected to `/login`
- Onboarding redirect: if `token.onboardingComplete === false`, redirects to `/onboarding`

## GHL Integration
- Client factory: `createGHLClient(tenantId)` from `@/lib/ghl/client.ts`
- Returns mock client when `ENABLE_MOCK_GHL=true`
- Real client: axios with rate limiting (80/10s), token refresh on 401, retry with backoff on 429/5xx
- Mock server: `src/lib/ghl/mock-server.ts` — 20 contacts, 10 conversations, 15 opportunities
- OAuth: `src/lib/ghl/oauth.ts` — `getAuthorizeUrl()` and `exchangeCodeForTokens()`
- OAuth routes: `/api/crm/oauth/authorize` (requires auth) and `/api/crm/oauth/callback` (public)

## Mock/Real Data Mode
- Tenant model has `dataMode` field: "mock" (default) or "live"
- `getDataMode(tenantId)` utility in `src/lib/data/getDataMode.ts`
- Toggle in Settings UI → DataModeCard component
- Cannot switch to live without valid GHL OAuth tokens
- Mock = local DB queries. Live = GHL API calls via bridge routes.

## Voucher System (AI-Powered)

### Reader Flow
```
Image upload → POST /api/voucher/read → Claude API (claude-sonnet-4-20250514)
  → Structured JSON extraction → Auto-fill form fields
```

### Data Flow
```
VoucherSection (drop zone / manual) → ReservationForm state → POST /api/reservations
  → Reservation record with voucher fields in DB
```

### Tracking
- VoucherStats component queries `/api/reservations/voucher-stats`
- Aggregates: pendientes, canjeados, ingresos, caducan semana/mes
- Yellow alert banner for vouchers expiring within 7 days

### Groupon Product Mapping
- GrouponProductMapping model in DB (tenantId, grouponDesc, regex pattern, services JSON)
- CRUD API at `/api/settings/groupon-mappings`
- Editor UI in Settings page (GrouponMappingCard component)

## UI Components
- shadcn/ui components in `src/components/ui/`
- Uses `sonner` for toast notifications (not deprecated toast)
- Tailwind v4 with `tw-animate-css`
- shadcn/ui v4 uses base-ui (not Radix) — `render` prop instead of `asChild`

## Layout
- Route groups: `(dashboard)` for authenticated pages, `(auth)` for login/register/onboarding
- Dashboard layout (`src/app/(dashboard)/layout.tsx`) wraps with `SessionProvider` + `QueryClientProvider`
- Sidebar, Topbar, MobileNav in `src/components/layout/`

## React Query Hooks
- `src/hooks/useGHL.ts` — GHL data fetching (conversations, contacts, pipelines)
- `src/hooks/useReservations.ts` — reservation CRUD + stats + capacity
- `src/hooks/useSettings.ts` — tenant settings, team, data mode, invites
- `src/hooks/useVoucher.ts` — voucher AI reader mutation
- All use `fetchJSON<T>()` helper that throws on non-ok responses

## Reservations Module
- Two-panel layout: ReservationList (35%) + ReservationForm (65%)
- Source selection: Groupon / Caja / Presupuesto
- Groupon source shows VoucherSection (image reader + manual fields + Groupon validation)
- VoucherStats widget above main layout (collapsible)
- Keyboard shortcuts: F1=New, F2=Confirm, F3=No availability, F4=Duplicate, Ctrl+Enter=Confirm

## Settings Module
- DataModeCard — mock/live toggle (requires Owner + GHL connected for live)
- TenantInfoCard — company name, slug, created date
- GHLConnectionCard — connection status, reconnect button
- GrouponMappingCard — CRUD table for Groupon product → Skicenter service mappings
- TeamInviteCard — email input + invite button, shows invite URL with copy
- TeamTable — role dropdown per user (permission-gated)

## GHL Webhooks
- Endpoint: `POST /api/crm/webhooks` (public, verified via HMAC-SHA256)
- Events trigger cache invalidation by type
- All webhooks logged to `WebhookLog` table

## Optimistic Updates
- `useSendMessage`: appends outbound message immediately, rolls back on error
- `useAddNote`: prepends note immediately, rolls back on error
- Pattern: `onMutate` (cancel + snapshot + optimistic set) → `onError` (rollback) → `onSettled` (refetch)

## Railway Deployment
- **Build:** `npm install` → postinstall (`prisma generate`) → `npm run build` (`next build`)
- **Start:** `npm start` → `prisma migrate deploy` → `prisma db seed` → `next start`
- **Key constraint:** `prisma migrate deploy` must run at start (not build) because Railway injects DATABASE_URL at runtime
- **Seed script** (`prisma/seed.ts`): uses `@prisma/adapter-pg` + `pg` Pool
- **Prisma config** (`prisma.config.ts`): defines seed command — Prisma v7 ignores `package.json` seed config
