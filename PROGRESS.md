# GHL Dashboard — Build Progress

## Current Status
- **Phase:** PHASE 2 DEPLOYED & LIVE
- **Step:** Phase 1 (25/25) + Phase 2 (6/6 features) — All complete
- **Live URL:** https://crm-dash-prod.up.railway.app
- **Next:** Design system overhaul (warm/premium aesthetic inspired by kinso.ai), then connect real GHL sub-account
- **Date:** 2026-03-16

## Completed Steps

### Phase A: Foundation (Steps 1-8) ✅
1. ✅ Scaffold — Next.js 16, TypeScript, Tailwind v4, App Router
2. ✅ Dependencies — all production + dev deps installed, shadcn/ui initialized with 13 components (sonner instead of deprecated toast)
3. ✅ Environment validation — `src/lib/env.ts` with Zod schema, `.env.example`, `.env.test`, `.env`
4. ✅ Logger — `src/lib/logger.ts` with pino + child loggers
5. ✅ Prisma setup — schema with all 6 models, Prisma v7 with `@prisma/adapter-pg`, seed.ts ready
6. ✅ Encryption — `src/lib/encryption.ts` AES-256-GCM encrypt/decrypt
7. ✅ Redis client — `src/lib/cache/redis.ts` with cache-aside pattern, keys.ts, invalidation.ts
8. ✅ Testing setup — vitest config, test setup with mocks, 17 tests passing (encryption + env validation)

### Phase B: Auth & GHL Integration (Steps 9-13) ✅
9. ✅ NextAuth v5 beta — credentials provider, JWT strategy, session with tenantId/roleId/permissions
10. ✅ RBAC — permissions.ts with hasPermission/hasAny/hasAll, RoleGate component, usePermissions hook
11. ✅ Middleware — edge-compatible JWT check via `next-auth/jwt` (not full auth config to avoid Prisma edge issues)
12. ✅ GHL client — axios with token refresh + retry + rate limiting, mock server with 20 contacts/10 convos/15 opps
13. ✅ GHL OAuth — authorize redirect route + callback with encrypted token storage

### Phase C: Layout & Onboarding (Steps 14-15) ✅
14. ✅ Layout shell — Sidebar (role-aware, collapsible, unread badge), Topbar (search, notification bell, user menu), MobileNav (Sheet-based), ErrorBoundary (class component with retry), GHLStatusBanner, EmptyState, LoadingSkeleton (Page/Card/Table/ConversationList/Kanban variants), Login page, Dashboard layout with SessionProvider + QueryClientProvider
15. ✅ Onboarding wizard — 4-step flow (Connect GHL → Invite Team → Assign Roles → Done), StepIndicator component, onboardingComplete added to JWT/session, middleware redirects, API routes for invite/roles/complete

### Phase D: Modules (Steps 16-19) ✅
16. ✅ Comms module — three-panel layout, conversation list/thread/sidebar, message send, assign dropdown
17. ✅ Contacts module — searchable table with source/tag filters, contact detail page with notes, add note form
    - Components: ContactsTable, ContactsSearch, SourceFilter, ContactInfo, NotesList, AddNoteForm
    - Added `useAddNote` mutation hook
18. ✅ Pipeline module — Kanban board with stage columns, opportunity cards, pipeline selector, value totals
    - Components: KanbanCard, KanbanColumn, PipelineSelector
    - Fixed: derived state instead of useEffect setState, stable useMemo deps
19. ✅ Dashboard home — stat cards (unread messages, contacts, deals, pipeline value), recent conversations, top opportunities

## Key Decisions
- **Prisma v7** requires adapter pattern — using `@prisma/adapter-pg` instead of direct URL
- **shadcn/ui v4** uses `sonner` instead of deprecated `toast` component
- **Next.js 16** with Tailwind v4 (not v3)
- **Zod v4** installed (API compatible with v3 for basic schemas)
- Infrastructure modules (logger, encryption, db, redis) use `process.env` directly since they bootstrap before env.ts
- DB migration deferred until Postgres is available (use `docker-compose up db` first)
- **Middleware uses `getToken()` from `next-auth/jwt`** — NOT the full `auth()` wrapper, because importing auth config pulls in Prisma which uses `node:path` (not edge-compatible)
- **GHL OAuth callback is public** — it receives redirects from GHL with authorization code, uses state param (tenantId) to map back
- **Route groups**: `(dashboard)` for authenticated layout (sidebar+topbar), `(auth)` for login/onboarding (no shell)
- **Root page.tsx deleted** — dashboard home lives at `(dashboard)/page.tsx` which renders at `/`
- **Inter font** as specified in design direction, applied via `--font-sans` CSS variable
- **base-ui Sheet** uses `render` prop instead of `asChild` — shadcn/ui v4 on base-ui, not Radix
- **Login page**: `useSearchParams` must be wrapped in `<Suspense>` for Next.js 16 static generation
- **Onboarding state in JWT**: `onboardingComplete` boolean added to JWT/Session so middleware can redirect without DB access
- **base-ui Select `onValueChange`** passes `string | null` — must null-check before setting state
- **ESLint `react-hooks/set-state-in-effect`**: Next.js 16 lint rule; use `useSearchParams` instead of reading `window.location.search` in useEffect

### Railway Deployment Decisions
- **Prisma generate in postinstall** — Railway runs `npm install` then `npm run build`; Prisma client must be generated before build
- **Migrations in start, not build** — `prisma migrate deploy` needs DATABASE_URL at runtime; Railway injects it at start time, not build time
- **tsx as production dep** — seed runs via `npx tsx prisma/seed.ts`; must be available in production node_modules
- **Seed in prisma.config.ts** — Prisma v7 ignores `package.json` seed config; must export `seed()` from `prisma.config.ts`
- **Explicit cookie config for Auth.js behind proxy** — when deploying Auth.js v5 behind TLS-terminating proxies (Railway, Vercel, etc.), always explicitly set `cookies.sessionToken.name` and pass matching `cookieName`/`secureCookie` to `getToken()` in middleware; the auto-detection logic checks different sources (AUTH_URL vs request protocol) and they disagree behind proxies
- **All GHL routes under `/api/crm/`** — cleaner than `/api/ghl/`, matches the product domain language

### Phase E: Polish (Steps 20-25) ✅
20. ✅ Settings page — tenant info card, GHL connection status/reconnect, team table with role management
    - API routes: `/api/settings/tenant` (GET), `/api/settings/team` (GET), `/api/settings/team/[userId]/role` (PATCH)
    - Hook: `useSettings.ts` — useTenantSettings, useTeam, useUpdateUserRole
21. ✅ Team management — team table with role dropdown (permission-gated), member list
22. ✅ GHL webhooks — `/api/crm/webhooks` POST receiver with HMAC-SHA256 signature verification, cache invalidation by event type, WebhookLog persistence
23. ✅ Error boundaries — `error.tsx` files for comms, contacts, pipeline, settings (per-route error UI with retry)
24. ✅ Loading states — `loading.tsx` files with route-specific skeletons, optimistic updates for sendMessage and addNote
25. ✅ Final audit — all checks pass, PROGRESS.md + ARCHITECTURE.md updated

### Phase F: Railway Deployment (2026-03-13) ✅
26. ✅ Prisma postinstall — added `prisma generate` to postinstall script so Railway generates the Prisma client during `npm install`
27. ✅ Route rename `/api/ghl/*` → `/api/crm/*` — all GHL API routes moved under `/api/crm/` for cleaner naming; updated all frontend hooks to match
28. ✅ Auth.js v5 trustHost — added `trustHost: true` to NextAuth config to resolve `UntrustedHost` error behind Railway's reverse proxy
29. ✅ AUTH_URL + AUTH_SECRET env vars — Auth.js v5 requires `AUTH_URL` (not `NEXTAUTH_URL`) and `AUTH_SECRET`; added both to Railway env vars and Zod validation
30. ✅ Prisma migrate in start script — moved `prisma migrate deploy` from build to start script so it runs with DATABASE_URL available at runtime
31. ✅ PrismaPg adapter in seed — seed script was failing because it used bare `PrismaClient` instead of the adapter pattern; added `@prisma/adapter-pg` + `pg` Pool to seed.ts
32. ✅ tsx production dependency — moved `tsx` from devDependencies to dependencies so `prisma db seed` works in Railway's production build (seed runs via `tsx prisma/seed.ts`)
33. ✅ prisma.config.ts seed location — Prisma v7 requires seed command in `prisma.config.ts` (not `package.json`); added `seed: () => execSync('npx tsx prisma/seed.ts')` to config
34. ✅ Session cookie fix — Auth.js v5 uses `__Secure-` prefixed cookie names when AUTH_URL is HTTPS, but `getToken()` in middleware inferred cookie name from internal HTTP request (behind Railway's TLS proxy), causing a name mismatch; explicitly configured cookie names in NextAuth config and passed matching `cookieName`/`secureCookie` to `getToken()`

### Phase G: Phase 2 Features (2026-03-16) ✅

#### Feature 1: Real Authentication & Multi-Tenant Signup ✅
- **`/register` page** (`src/app/(auth)/register/page.tsx`) — Spanish UI, two flows:
  - **New tenant**: nombre, email, contraseña (with show/hide), confirmar contraseña, nombre empresa → creates Tenant + 4 Roles + User (Owner) + ModuleConfigs in transaction → auto-login → redirect `/onboarding`
  - **Invite flow** (`?invite={token}`): hides empresa field, updates placeholder user, assigns Sales Rep → redirect `/`
- **`/login` page** updated to Spanish — "Iniciar sesión", "¿No tienes cuenta? Regístrate" link, demo creds shown
- **Registration API** (`src/app/api/auth/register/route.ts`) — bcrypt hashing, slug generation, email uniqueness check, invite token validation
- **Team invite API** (`src/app/api/settings/team/invite/route.ts`) — generates 32-byte hex token, creates placeholder user, 7-day expiry
- **Middleware** updated — `/register` added to PUBLIC_ROUTES
- **DB migration** — User: `emailVerified`, `inviteToken` (unique), `inviteExpires`

#### Feature 2: Mock/Real Data Toggle ✅
- **`DataModeCard` component** (`src/app/(dashboard)/settings/_components/DataModeCard.tsx`) — green badge "Modo demo activo" / blue badge "Conectado a GHL", toggle button
- **`getDataMode()` utility** (`src/lib/data/getDataMode.ts`) — checks tenant's dataMode
- **Tenant API updated** (`src/app/api/settings/tenant/route.ts`) — PATCH handler for dataMode, prevents switching to "live" without GHL OAuth tokens
- **Settings hooks** (`src/hooks/useSettings.ts`) — `useUpdateDataMode()`, `useInviteTeamMember()`
- **DB migration** — Tenant: `dataMode` String @default("mock")

#### Feature 3: AI-Powered Voucher Image Reader ✅
- **Voucher API** (`src/app/api/voucher/read/route.ts`) — POST, receives base64 image, sends to Claude API (`claude-sonnet-4-20250514`), returns structured JSON with: producto, codigoSeguridad, codigoCupon, precioOriginal, precioGroupon, descuento, cantidadPagada, caduca, cantidad, serviciosDetectados
- **Hook** (`src/hooks/useVoucher.ts`) — `useReadVoucher()` mutation
- Uses `process.env.ANTHROPIC_API_KEY` (not env.ts — per spec requirement)
- Strips markdown code fences from Claude response before parsing

#### Feature 4: Reservation Form Voucher Section ✅
- **`VoucherSection` component** (`src/app/(dashboard)/reservas/_components/VoucherSection.tsx`):
  - Image drop zone with drag & drop + click to select
  - Loading spinner during AI processing
  - Manual input fields: código seguridad, código cupón, producto, precio pagado, caduca
  - Green highlights on AI-filled fields
  - Copy buttons next to security code and coupon code
  - "VALIDAR EN GROUPON" button (opens merchant.groupon.es in new tab)
  - "Cupón canjeado en Groupon" checkbox (required before confirming)
- **ReservationForm** updated — voucher fields added to FormData, VoucherSection shown when source === "groupon", submit blocked if Groupon source and not redeemed
- **Reservations API** updated — accepts and saves all voucher fields (voucherSecurityCode, voucherCouponCode, voucherProduct, voucherPricePaid, voucherExpiry, voucherRedeemed, voucherRedeemedAt)

#### Feature 5: Voucher Tracking ✅
- **`VoucherStats` component** (`src/app/(dashboard)/reservas/_components/VoucherStats.tsx`) — collapsible widget showing:
  - Pendientes de canjear count
  - Canjeados este mes count
  - Ingresos Groupon este mes (EUR)
  - Caducan esta semana / este mes counts
  - Yellow alert banner for expiring vouchers with client details table
- **Voucher stats API** (`src/app/api/reservations/voucher-stats/route.ts`) — aggregation queries for all voucher metrics
- **Reservas page** — VoucherStats widget added between StatsBar and main layout
- **DB migration** — Reservation: `voucherImageUrl`, `voucherSecurityCode`, `voucherCouponCode`, `voucherProduct`, `voucherPricePaid`, `voucherExpiry`, `voucherRedeemedAt`, `voucherRedeemed`

#### Feature 6: Groupon Product Mapping Editor ✅
- **`GrouponMappingCard` component** (`src/app/(dashboard)/settings/_components/GrouponMappingCard.tsx`) — CRUD table:
  - Shows all mappings with Groupon description, regex pattern, mapped Skicenter services
  - "Añadir mapeo" form with description, regex pattern, and multi-service selector
  - Delete button per mapping
- **Groupon mappings API** (`src/app/api/settings/groupon-mappings/route.ts`) — GET/POST/DELETE, auth + permission protected, regex validation
- **Settings page** — GrouponMappingCard added in RoleGate settings:tenant section
- **DB migration** — new `GrouponProductMapping` model (id, tenantId, grouponDesc, pattern, services Json, isActive)
- **`TeamInviteCard` component** (`src/app/(dashboard)/settings/_components/TeamInviteCard.tsx`) — email input + invite button, shows invite URL with copy button

#### Phase 2 DB Migration
- Single migration: `prisma/migrations/20260316100000_phase2_auth_voucher_datamode/migration.sql`
- All ALTER TABLE and CREATE TABLE statements consolidated

## Known Issues
- No Postgres running locally — need `docker-compose up db redis` before running migrations
- `prisma migrate dev --name init` needs to be run before seed works
- ANTHROPIC_API_KEY must be set on Railway for voucher reader to work
- Voucher section only visible when "CUPÓN GROUPON" source is selected in reservation form

## Pending Work
- **Design system overhaul** — warm/premium aesthetic inspired by kinso.ai (colors, fonts, spacing defined, not yet applied)
- **Connect real GHL sub-account** via OAuth flow
- **Live mode** for contacts and conversations (mock mode fully works)

## Deployment Info
- **Platform:** Railway (Docker)
- **Live URL:** https://crm-dash-prod.up.railway.app
- **Services:** Next.js app + Postgres + Redis (all on Railway)
- **Env vars:** AUTH_URL, AUTH_SECRET, DATABASE_URL, REDIS_URL, ENCRYPTION_KEY, GHL_CLIENT_ID, GHL_CLIENT_SECRET, GHL_REDIRECT_URI, ENABLE_MOCK_GHL, ANTHROPIC_API_KEY
- **Build:** `npm install` (triggers postinstall → prisma generate) → `npm run build` (next build)
- **Start:** `npm start` (runs prisma migrate deploy → prisma db seed → next start)
- **Demo login:** admin@demo.com / demo1234 (Owner), sales@demo.com / demo1234 (Sales Rep)

## Auto-Audit Results
### Phase A Final Audit
- ✅ Tests: 17 passed, 0 failed
- ✅ Type Check: 0 errors
- ✅ Lint: 0 errors
- ✅ Build: compiled successfully
- ✅ Smoke Test: /api/health returned 200
- ✅ Security: no violations found

### Phase B Final Audit
- ✅ Tests: 34 passed, 0 failed
- ✅ Type Check: 0 errors
- ✅ Lint: 0 errors
- ✅ Build: compiled successfully (middleware deprecation warning only)
- ✅ Smoke Test: /api/health returned 200
- ✅ Security: no hardcoded secrets, auth checks on protected routes

### Step 14 Audit (Layout Shell)
- ✅ Tests: 34 passed, 0 failed
- ✅ Type Check: 0 errors
- ✅ Lint: 0 errors
- ✅ Build: compiled successfully
- ✅ Smoke Test: /api/health returned 200
- ✅ Security: no issues

### Phase C Final Audit (Step 15)
- ✅ Tests: 34 passed, 0 failed
- ✅ Type Check: 0 errors
- ✅ Lint: 0 errors
- ✅ Build: compiled successfully
- ✅ Smoke Test: /api/health returned 200
- ✅ Security: all onboarding API routes check auth, tenant-scoped queries

### Step 16 Audit (Comms Module)
- ✅ Tests: 34 passed, 0 failed
- ✅ Type Check: 0 errors (fixed asChild → render prop)
- ✅ Lint: 0 errors (fixed useMemo deps, unused param)
- ✅ Build: compiled successfully (23 routes)
- ✅ Smoke Test: /api/health returned 200
- ✅ Security: all 9 GHL API routes have auth + permissions + tenant scoping, tokens encrypted

### Phase D Final Audit (Steps 17-19)
- ✅ Tests: 34 passed, 0 failed
- ✅ Type Check: 0 errors
- ✅ Lint: 0 errors
- ✅ Build: compiled successfully (26 routes including /contacts, /contacts/[id], /pipeline)
- ✅ Smoke Test: /api/health returned 200
- ✅ Security: all new pages use existing auth-protected API routes, no new API surfaces

### Phase E Final Audit (Steps 20-25)
- ✅ Tests: 34 passed, 0 failed
- ✅ Type Check: 0 errors
- ✅ Lint: 0 errors
- ✅ Build: compiled successfully (30 routes, 8 static pages)
- ✅ Smoke Test: /api/health returned 200
- ✅ Security: settings routes have auth + permissions + tenant scoping, webhook HMAC verification added

### Phase G Final Audit (Phase 2)
- ✅ Type Check: 0 errors (after Prisma client regeneration)
- ✅ Lint: 0 errors
- ✅ Build: compiled clean (40+ routes, 14 static pages)
- ✅ Smoke Test: /api/health returned 200 on production
- ✅ Security: all new API routes have auth + permissions + tenant scoping, voucher API auth-protected
- ✅ Deployed: commit ce6f718 live on Railway
