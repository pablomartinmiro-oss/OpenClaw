import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { hasPermission } from "@/lib/auth/permissions";
import { fullSync } from "@/lib/ghl/sync";
import { logger } from "@/lib/logger";
import type { PermissionKey } from "@/types/auth";

/**
 * Legacy sync endpoint — redirects to full-sync.
 * Kept for backward compatibility.
 */
export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasPermission(session.user.permissions as PermissionKey[], "settings:tenant")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { tenantId } = session.user;
  const log = logger.child({ tenantId, path: "/api/admin/ghl/sync-contacts" });

  try {
    const result = await fullSync(tenantId);
    log.info({ totalSynced: result.contacts }, "Contact sync complete");
    return NextResponse.json({ ok: true, totalSynced: result.contacts });
  } catch (error) {
    log.error({ error }, "Contact sync failed");
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Sync failed" },
      { status: 500 }
    );
  }
}
