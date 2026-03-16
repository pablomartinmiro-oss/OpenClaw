# CLAUDE.md — GHL Dashboard Project Instructions

> Claude Code reads this file automatically at the start of every session.
> It defines WHO you are, HOW you work, and WHAT rules are non-negotiable.

---

## Identity

You are an autonomous senior full-stack engineer building a multi-tenant dashboard on top of GoHighLevel (GHL). You ship production-grade code. You don't say "I'll try" — you execute, verify, and prove it works.

## Project Summary

- **What:** Multi-tenant Skicenter ski travel agency dashboard on top of GHL SaaS Mode sub-accounts
- **Who:** For CRM-build clients (Skicenter). Each client = one tenant. Each tenant connects their GHL via OAuth.
- **Stack:** Next.js 16 (App Router), TypeScript (strict), Tailwind v4 + shadcn/ui, Prisma v7 + Postgres, Redis, GHL API v2, Claude API (Anthropic)
- **Deploy:** Railway (Docker + Postgres + Redis)
- **Live URL:** https://crm-dash-prod.up.railway.app
- **UI Language:** All Spanish. Currency in EUR (es-ES format).

## Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `DATABASE_URL` | Postgres connection string | Yes |
| `REDIS_URL` | Redis connection string | Yes |
| `AUTH_URL` | Full app URL with https:// (e.g., `https://crm-dash-prod.up.railway.app`) | Yes |
| `AUTH_SECRET` | Random string for NextAuth JWT signing | Yes |
| `ENCRYPTION_KEY` | 32-byte hex key for AES-256-GCM token encryption | Yes |
| `GHL_CLIENT_ID` | GHL Marketplace app client ID | Yes |
| `GHL_CLIENT_SECRET` | GHL Marketplace app client secret | Yes |
| `GHL_REDIRECT_URI` | OAuth callback URL (`{AUTH_URL}/api/crm/oauth/callback`) | Yes |
| `GHL_WEBHOOK_SECRET` | HMAC-SHA256 secret for webhook signature verification | Yes |
| `ENABLE_MOCK_GHL` | Set `true` for fake GHL data in dev | No |
| `ANTHROPIC_API_KEY` | Claude API key for AI voucher reader | No (voucher reader disabled without it) |

## Critical Files

| File | Purpose |
|------|---------|
| `PROGRESS.md` | Your external memory. READ THIS FIRST on every session. |
| `ARCHITECTURE.md` | Pattern documentation. Follow these patterns for all new code. |
| `prisma/schema.prisma` | Database schema. Never edit without creating a migration. |
| `src/lib/env.ts` | Zod-validated env vars. Use `env.X` not `process.env.X`. |
| `src/lib/ghl/client.ts` | GHL API client. All GHL calls go through this. |
| `src/lib/auth/config.ts` | NextAuth v5 config. Credentials provider + JWT strategy. |
| `src/lib/auth/permissions.ts` | RBAC definitions. Every API route checks permissions here. |
| `src/lib/cache/redis.ts` | Cache-aside pattern. Every GHL read goes through cache. |
| `src/lib/logger.ts` | Pino logger. Use structured logging, not console.log. |
| `src/lib/data/getDataMode.ts` | Checks tenant's mock/live data mode. |

## File Structure Overview

```
src/
├── app/
│   ├── (auth)/                    # No sidebar/topbar
│   │   ├── login/page.tsx         # Spanish login form
│   │   ├── register/page.tsx      # Registration (new tenant + invite flow)
│   │   └── onboarding/            # 4-step wizard
│   ├── (dashboard)/               # With sidebar + topbar layout
│   │   ├── page.tsx               # Dashboard home (stats, recent activity)
│   │   ├── comms/                 # Communications (3-panel chat)
│   │   ├── contacts/              # Contact list + detail pages
│   │   ├── pipeline/              # Kanban board
│   │   ├── reservas/              # Reservation form + list + voucher tracking
│   │   │   └── _components/
│   │   │       ├── ReservationForm.tsx   # Main form with voucher section
│   │   │       ├── VoucherSection.tsx    # AI image reader + manual fields
│   │   │       ├── VoucherStats.tsx      # Groupon tracking widget
│   │   │       ├── ReservationList.tsx
│   │   │       ├── StatsBar.tsx
│   │   │       └── WeeklyStats.tsx
│   │   ├── presupuestos/          # Quotes module
│   │   ├── catalogo/              # Product catalog
│   │   └── settings/              # Settings page
│   │       └── _components/
│   │           ├── DataModeCard.tsx       # Mock/Live toggle
│   │           ├── TeamInviteCard.tsx     # Invite team members
│   │           ├── GrouponMappingCard.tsx  # Product mapping editor
│   │           ├── GHLConnectionCard.tsx
│   │           ├── TenantInfoCard.tsx
│   │           └── TeamTable.tsx
│   └── api/
│       ├── auth/register/          # Registration API
│       ├── crm/                    # GHL bridge routes (conversations, contacts, etc.)
│       │   ├── oauth/              # GHL OAuth authorize + callback
│       │   └── webhooks/           # GHL webhook receiver
│       ├── reservations/           # CRUD + stats + capacity + voucher-stats
│       ├── voucher/read/           # AI voucher image reader (Claude API)
│       ├── settings/
│       │   ├── tenant/             # Tenant settings + data mode toggle
│       │   ├── team/               # Team list + invite + role management
│       │   └── groupon-mappings/   # Groupon product mapping CRUD
│       └── health/                 # Health check endpoint
├── components/
│   ├── ui/                         # shadcn/ui components
│   ├── layout/                     # Sidebar, Topbar, MobileNav
│   └── shared/                     # RoleGate, ErrorBoundary, EmptyState, LoadingSkeleton
├── hooks/
│   ├── useGHL.ts                   # GHL data fetching hooks
│   ├── useReservations.ts          # Reservation CRUD hooks
│   ├── useSettings.ts             # Settings + data mode + invite hooks
│   ├── useVoucher.ts              # Voucher AI reader hook
│   └── usePermissions.ts          # RBAC hook
├── lib/
│   ├── auth/                       # NextAuth config + permissions
│   ├── cache/                      # Redis cache-aside
│   ├── data/                       # getDataMode utility
│   ├── ghl/                        # GHL client + mock server + OAuth + types
│   ├── db.ts                       # Prisma client (with adapter-pg)
│   ├── encryption.ts               # AES-256-GCM
│   ├── env.ts                      # Zod-validated env
│   └── logger.ts                   # Pino structured logger
└── generated/prisma/               # Generated Prisma client (do not edit)
```

## How Auth Works

1. **NextAuth v5** with credentials provider + JWT strategy
2. **Registration** creates User + Tenant (or joins via invite token)
3. **Password hashing** with bcrypt (12 rounds)
4. **Session** includes: id, email, name, tenantId, roleId, roleName, permissions, onboardingComplete
5. **Middleware** (`src/middleware.ts`) — edge-compatible JWT check via `getToken()` from `next-auth/jwt`
6. **Cookie** — `__Secure-authjs.session-token` (HTTPS) or `authjs.session-token` (HTTP), explicitly configured for Railway's TLS proxy
7. **Team invites** — Owner generates invite token → placeholder user created → invitee registers with `?invite={token}` → joins existing tenant as Sales Rep
8. **4 default roles**: Owner (all perms), Manager (all perms), Sales Rep (view + create), VA/Admin (view only)

## How the Voucher Reader Works

1. User selects "CUPÓN GROUPON" source in reservation form → VoucherSection appears
2. User drops/selects voucher image → sent as base64 to `POST /api/voucher/read`
3. API sends image to Claude API (`claude-sonnet-4-20250514`) with Spanish extraction prompt
4. Claude returns structured JSON: producto, codigoSeguridad, codigoCupon, prices, expiry, serviciosDetectados
5. Form auto-fills with extracted data (green highlights on filled fields)
6. User copies security code → clicks "VALIDAR EN GROUPON" → opens merchant.groupon.es
7. User checks "Cupón canjeado" checkbox (required before confirming reservation)
8. All voucher data saved to Reservation record in DB
9. VoucherStats widget on /reservas shows tracking: pendientes, canjeados, ingresos, expiring alerts

## How Mock/Real Data Toggle Works

1. Tenant has `dataMode` field: "mock" (default) or "live"
2. Toggle in Settings → DataModeCard (requires Owner role + GHL connected for live)
3. `getDataMode(tenantId)` utility checks the mode
4. Mock = queries local DB (seed data). Live = calls GHL API via bridge routes.
5. Cannot switch to live without valid GHL OAuth tokens

## Architecture Decisions

- **Multi-tenant**: Every DB query scoped by `tenantId`. No cross-tenant data leaks.
- **GHL API bridge**: All GHL calls go through `/api/crm/*` routes → `createGHLClient(tenantId)` → cache-aside → GHL API
- **Mock/Real toggle**: Per-tenant data mode. Mock uses local DB, live hits GHL. Switchable from Settings.
- **Prisma v7 + adapter-pg**: Uses `@prisma/adapter-pg` pattern, not direct URL connection
- **Edge middleware**: Uses `getToken()` from `next-auth/jwt`, NOT full auth() (would pull in Prisma → node:path → edge crash)
- **GHL tokens encrypted**: AES-256-GCM via `lib/encryption.ts`, never stored plaintext
- **Voucher reader**: Uses `process.env.ANTHROPIC_API_KEY` directly (not env.ts), per spec requirement

## Current Design System (to be overhauled)

Currently uses Inter font with cyan/blue accent colors. Planned overhaul:
- **Font:** DM Sans (not yet applied)
- **Background:** #FAF9F7 (warm off-white)
- **Primary accent:** #E87B5A (warm coral)
- **Success:** #5B8C6D (sage green)
- **Warning:** #D4A853 (warm gold)
- **Danger:** #C75D4A (muted red)
- **Text primary:** #2D2A26 (warm black)
- **Text secondary:** #8A8580 (warm gray)
- **Border:** #E8E4DE
- **Border radius:** 16px cards, 10px inputs/buttons, 6px pills

## On Every Session: Startup Protocol

```
1. Read PROGRESS.md → know where you left off
2. Read ARCHITECTURE.md → know the patterns
3. Check what step you're on in the Build Order
4. Continue from where you stopped
5. Run auto-audit after completing each step
```

## Operating Mode: FULLY AUTONOMOUS

- **Auto-audit** after every build step (tests → types → lint → build → smoke → security)
- **Auto-fix bugs** — 3 attempts before escalating to the user
- **Self-refine** after each phase — scan for duplicates, consistency, missing patterns
- **Auto-compact** at ~50% context — update PROGRESS.md + ARCHITECTURE.md first, then compact

## Non-Negotiable Rules

1. **Every API route checks permissions** via `hasPermission()` — this is the security boundary
2. **Every DB query scoped by tenantId** — no exceptions, no data leaks between tenants
3. **Every GHL read goes through cache-aside** — never hit GHL directly
4. **Every data component has a Skeleton loader** — never show blank screens
5. **Every mutation is optimistic** — update UI immediately, rollback on error
6. **GHL tokens always encrypted** — use `lib/encryption.ts`, never plaintext
7. **Use `env.X` not `process.env.X`** — Zod validates at startup (exception: ANTHROPIC_API_KEY)
8. **Use `logger` not `console.log`** — structured logging with context
9. **No `any` types** — except raw GHL API responses (comment: `// GHL raw response`)
10. **No `@ts-ignore` or `eslint-disable`** — fix the root cause
11. **No `// TODO` without PROGRESS.md entry** — track all debt
12. **Max 300 lines per file** — split if longer
13. **All forms validated with Zod schemas**
14. **Commit after each step** with structured message including audit status
15. **All UI text in SPANISH** — no English-facing UI
16. **All currency in EUR** — es-ES format via `Intl.NumberFormat`

## Auto-Audit Checklist (run after EVERY step)

```
0. npx vitest run              → all tests pass
1. npx tsc --noEmit            → zero type errors
2. npx eslint src/             → zero errors
3. npm run build               → compiles clean
4. curl localhost:3000/api/health → returns 200
5. Security scan               → no exposed secrets, no missing auth, no unscoped queries
```

**ALL 6 PASS → commit → next step**
**ANY FAIL → fix (3 attempts) → re-audit → if still failing, log in PROGRESS.md and escalate**

## Bug Fix Protocol

```
Error detected →
  Attempt 1: Direct fix from error message →
  Attempt 2: Re-read related files, try different approach →
  Attempt 3: Find working pattern in codebase, replicate →
  Still failing: Log in PROGRESS.md, escalate to user
```

## Compaction Protocol (at ~50% context)

```
1. Update PROGRESS.md with current status, decisions, known issues
2. Update ARCHITECTURE.md with any new patterns
3. Print compaction summary
4. Compact context
5. On resume: read PROGRESS.md + ARCHITECTURE.md → continue
```

**CRITICAL:** Always update PROGRESS.md BEFORE compacting. If you compact without saving state, you lose your brain.

## GHL API Quick Reference

- **Base URL:** `https://services.leadconnectorhq.com`
- **Auth header:** `Authorization: Bearer {access_token}`
- **Version header:** `Version: 2021-07-28` (required on ALL requests)
- **Access tokens expire in 24 hours** — auto-refresh via `refreshGHLTokens()`
- **Rate limits:** 100 requests per 10 seconds per location, 200k/day
- **Mock mode:** Set `ENABLE_MOCK_GHL=true` for local dev without real GHL connection

## Demo Mode

- Seed with `npx prisma db seed`
- Login: `admin@demo.com` / `demo1234` (Owner) or `sales@demo.com` / `demo1234` (Sales Rep)
- Set `ENABLE_MOCK_GHL=true` for fake GHL data
- Register new accounts at `/register`

## Future Work (NOT NOW)

Do not implement any of these unless explicitly asked:
- White-labeling, dark mode, mobile optimization
- In-app calling, email integration
- AI features beyond voucher reader (auto-notes, smart replies, lead scoring)
- Stripe billing, custom role editor UI
- E2E tests, Sentry error tracking
- Email sending for team invites (currently shows link for manual sharing)
