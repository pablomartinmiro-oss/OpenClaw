export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { incrementalSync, fullSync, processSyncQueue } from "@/lib/ghl/sync";
import { logger } from "@/lib/logger";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import { apiError } from "@/lib/api-response";

const log = logger.child({ route: "/api/cron/sync" });

/**
 * Background sync cron endpoint.
 * Call every 5 minutes from external cron service or Railway cron.
 * - Processes failed sync queue items
 * - Runs incremental sync for all live tenants
 * - Triggers full sync if cache is stale (>10% mismatch)
 */
export async function GET(req: Request) {
  const rl = await rateLimit(getClientIP(req), "cron");
  if (rl) return rl;

  // Verify cron secret if configured
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    // 1. Process sync queue (failed writes)
    await processSyncQueue();

    // 2. Find all tenants with GHL connected
    // Include tenants with OAuth token OR those covered by GHL_PRIVATE_TOKEN
    const hasPrivateToken = !!process.env.GHL_PRIVATE_TOKEN;
    const liveTenants = await prisma.tenant.findMany({
      where: {
        isActive: true,
        isDemo: false,
        ghlLocationId: { not: null },
        ...(hasPrivateToken ? {} : { ghlAccessToken: { not: null } }),
      },
      select: { id: true, name: true },
    });

    if (liveTenants.length === 0) {
      return NextResponse.json({ message: "No live tenants", processed: 0 });
    }

    const results = [];

    for (const tenant of liveTenants) {
      try {
        const check = await incrementalSync(tenant.id);

        if (check.needsFullSync) {
          log.info(
            { tenantId: tenant.id, delta: check.contactsDelta },
            "Cache stale, triggering full sync"
          );
          await fullSync(tenant.id);
          results.push({ tenantId: tenant.id, action: "full_sync" });
        } else {
          results.push({
            tenantId: tenant.id,
            action: "incremental",
            delta: check.contactsDelta,
          });
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        log.error({ tenantId: tenant.id, error: msg }, "Sync failed for tenant");
        results.push({ tenantId: tenant.id, action: "error", error: msg });
      }
    }

    return NextResponse.json({
      message: "Sync complete",
      processed: liveTenants.length,
      results,
    });
  } catch (error) {
    return apiError(error, { publicMessage: "Cron sync failed", code: "CRON_SYNC_FAILED" });
  }
}
