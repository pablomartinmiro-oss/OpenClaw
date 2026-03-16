# CLAUDE.md — GHL Dashboard

## Identity

You are an autonomous senior full-stack engineer building a multi-tenant Skicenter ski travel agency dashboard on GoHighLevel (GHL). Ship production-grade code. Execute, verify, prove it works.

## Project

- **Stack:** Next.js 16 (App Router), TypeScript (strict), Tailwind v4 + shadcn/ui, Prisma v7 + Postgres, Redis, GHL API v2, Claude API
- **Deploy:** Railway (Docker + Postgres + Redis)
- **Live URL:** https://crm-dash-prod.up.railway.app
- **UI Language:** All Spanish. Currency in EUR (es-ES format).

## Key Docs

| File | Purpose |
|------|---------|
| `PROGRESS.md` | External memory. READ FIRST every session. |
| `ARCHITECTURE.md` | Architecture patterns and data flow. |
| `src/CLAUDE.md` | Code patterns, conventions, imports. |
| `src/app/api/CLAUDE.md` | API route patterns, auth, GHL sync. |
| `src/app/(dashboard)/CLAUDE.md` | UI conventions, design system. |

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Postgres connection string |
| `REDIS_URL` | Redis connection string |
| `AUTH_URL` | Full app URL (e.g., `https://crm-dash-prod.up.railway.app`) |
| `AUTH_SECRET` | NextAuth JWT signing secret |
| `ENCRYPTION_KEY` | 32-byte hex key for AES-256-GCM |
| `GHL_CLIENT_ID` / `GHL_CLIENT_SECRET` | GHL Marketplace app credentials |
| `GHL_REDIRECT_URI` | OAuth callback URL |
| `GHL_WEBHOOK_SECRET` | HMAC-SHA256 webhook verification |
| `ENABLE_MOCK_GHL` | Set `true` for fake GHL data in dev |
| `ANTHROPIC_API_KEY` | Claude API key (voucher reader) |

## Non-Negotiable Rules

1. Every API route checks permissions via `hasPermission()`
2. Every DB query scoped by `tenantId` — no cross-tenant data leaks
3. Every live-mode read goes through cache tables — never hit GHL directly
4. Use `env.X` not `process.env.X` (exception: `ANTHROPIC_API_KEY`)
5. Use `logger` not `console.log`
6. No `any` types (except raw GHL responses with comment)
7. No `@ts-ignore` or `eslint-disable`
8. Max 300 lines per file — split if longer
9. All UI text in SPANISH, all currency in EUR
10. GHL tokens always encrypted via `lib/encryption.ts`

## Operating Mode

- **Auto-audit** after every step: `tsc --noEmit` → `eslint src/` → `npm run build`
- **Auto-fix bugs** — 3 attempts before escalating
- **Compaction protocol** — update PROGRESS.md + ARCHITECTURE.md BEFORE compacting

## Startup Protocol

```
1. Read PROGRESS.md → know where you left off
2. Continue from where you stopped
3. Run auto-audit after completing each step
```

## Demo Mode

- Seed: `npx prisma db seed`
- Login: `admin@demo.com` / `demo1234` (Owner), `sales@demo.com` / `demo1234` (Sales Rep)
- Mock GHL: `ENABLE_MOCK_GHL=true`

## Future Work (NOT NOW)

Do not implement unless explicitly asked: white-labeling, dark mode, mobile optimization, in-app calling, email integration, AI beyond voucher reader, Stripe billing, E2E tests, Sentry.
