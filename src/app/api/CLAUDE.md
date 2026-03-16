# API Route Patterns

## Standard Route Template

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { hasPermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db";
import { getDataMode } from "@/lib/data/getDataMode";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(session.user.permissions, "required:permission")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const tenantId = session.user.tenantId;
  // Always scope queries by tenantId
}
```

## Mock/Live Branching

```typescript
const mode = await getDataMode(tenantId);
if (mode === "live") {
  // READ: query CachedXxx table (fast, local)
  // WRITE: ghl.updateXxx() → upsert cache → on error, queue SyncQueue
} else {
  // Use MockGHLClient (existing mock flow)
}
```

## Route Map

- `/api/crm/*` — GHL bridge (auth + permissions + mode branch)
- `/api/admin/ghl/*` — Admin sync tools
- `/api/cron/sync` — Background sync (PUBLIC route, for external cron)
- `/api/pricing` — POST price calculation (season-aware matrix lookup)
- `/api/season-calendar/*` — Season period CRUD
- `/api/products/*` — Product catalog CRUD
- `/api/reservations/*` — Local DB CRUD
- `/api/voucher/read` — Claude API (image → structured JSON)
- `/api/settings/*` — Tenant + team + mappings
- `/api/health` — Public health check

## Public Routes (no auth)

`/api/auth/*`, `/api/health`, `/api/crm/webhooks`, `/api/crm/oauth/*`, `/api/cron/sync`

## GHL Sync

- Full sync: `fullSync(tenantId)` — paginated fetch → bulk upsert
- Webhook sync: real-time cache upserts (12 event types, HMAC verified)
- Incremental sync: cron safety net every 5 min
- Write-through: GHL first → cache → SyncQueue on failure
- Cache tables: CachedContact, CachedConversation, CachedOpportunity, CachedPipeline
- Sync metadata: SyncStatus (per-tenant), SyncQueue (retry with backoff)

## GHL API

- Base URL: `https://services.leadconnectorhq.com`
- Headers: `Authorization: Bearer {token}`, `Version: 2021-07-28`
- Tokens expire in 24h — auto-refresh in GHLClient
- Rate limits: 100 req/10sec/location, 200k/day
