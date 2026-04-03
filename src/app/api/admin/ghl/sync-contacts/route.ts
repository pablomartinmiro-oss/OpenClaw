export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { apiError } from "@/lib/api-response";
import { fullSync } from "@/lib/ghl/sync";
import { logger } from "@/lib/logger";

/**
 * Legacy sync endpoint — redirects to full-sync.
 * Kept for backward compatibility.
 */
export async function POST() {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const log = logger.child({ tenantId, path: "/api/admin/ghl/sync-contacts" });

  try {
    const result = await fullSync(tenantId);
    log.info({ totalSynced: result.contacts }, "Contact sync complete");
    return NextResponse.json({ ok: true, totalSynced: result.contacts });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to sync contacts",
      code: "ADMIN_ERROR",
      logContext: { tenantId },
    });
  }
}
