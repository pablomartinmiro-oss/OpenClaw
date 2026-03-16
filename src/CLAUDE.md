# Code Patterns & Conventions

## Imports

- Database: `import { prisma } from "@/lib/db"` — Prisma v7 with `@prisma/adapter-pg`
- Types: `import { ... } from "@/generated/prisma/client"` (NOT `@/generated/prisma`)
- Environment: `import { env } from "@/lib/env"` — Zod-validated at startup
- Logger: `import { logger } from "@/lib/logger"` — Pino structured logging
- Cache: `import { redis, getCachedOrFetch } from "@/lib/cache/redis"`
- Encryption: `import { encrypt, decrypt } from "@/lib/encryption"` — AES-256-GCM
- Auth: `import { auth } from "@/lib/auth/config"` — NextAuth v5
- Permissions: `import { hasPermission } from "@/lib/auth/permissions"`
- GHL (live): `import { getGHLClient } from "@/lib/ghl/api"` — typed methods
- GHL (mock): `import { createGHLClient } from "@/lib/ghl/client"` — axios-style
- Data mode: `import { getDataMode } from "@/lib/data/getDataMode"`

## Database

- Every query MUST include `tenantId` scope
- JSON fields: `JSON.parse(JSON.stringify(obj)) as Prisma.InputJsonValue`
- Never edit `prisma/schema.prisma` without creating a migration
- Generated client at `src/generated/prisma/client` (do not edit)

## Auth

- NextAuth v5 with credentials provider + JWT strategy
- Session: `{ id, email, name, tenantId, roleId, roleName, permissions, onboardingComplete }`
- Edge middleware uses `getToken()` from `next-auth/jwt` — NOT `auth()` (Prisma → edge crash)
- Cookie: `__Secure-authjs.session-token` (HTTPS) or `authjs.session-token` (HTTP)
- 4 roles: Owner (all), Manager (all), Sales Rep (view+create), VA/Admin (view only)

## GHL Integration

- **Two clients**: `MockGHLClient` (mock mode) and `GHLClient` class (live mode) — never mixed
- **Live reads from cache tables**, not GHL directly. Webhooks + cron keep cache fresh
- **Write-through**: GHL first → cache update → on failure, queue to SyncQueue
- GHL tokens always encrypted — AES-256-GCM via `lib/encryption.ts`

## Pricing Engine

- **Client/Server split is critical**: `src/lib/pricing/client.ts` (pure, no Prisma) vs `calculator.ts` (server-side, uses Prisma)
- Client hooks MUST import from `client.ts`, never `calculator.ts` (avoids node:module crash)
- Season detection: server uses `getSeason()` (DB query), client uses `getSeasonFromCalendar()` (pre-fetched)
- Matrices: day-based `{ media: { "1": 36 } }` or private lessons `{ media: { "1h": { "1p": 70 } } }`

## React Query Hooks

All in `src/hooks/` — use `fetchJSON<T>()` helper that throws on non-ok:
- `useGHL.ts` — GHL data (conversations, contacts, pipelines)
- `useReservations.ts` — reservation CRUD + stats + capacity
- `useSettings.ts` — tenant, team, data mode, invites, sync status
- `useProducts.ts` — product catalog CRUD
- `usePricing.ts` — price calculation + season detection
- `useSeasonCalendar.ts` — season calendar CRUD
- `useVoucher.ts` — voucher AI reader

## Deployment (Railway)

- **Build:** `npm install` → postinstall (`prisma generate`) → `npm run build`
- **Start:** `npm start` → `prisma migrate deploy` → `prisma db seed` → `next start`
- Migrations at start time (not build) — DATABASE_URL injected at runtime
- Seed uses `@prisma/adapter-pg` + `pg` Pool
- `prisma.config.ts` defines seed command (Prisma v7 ignores package.json)
