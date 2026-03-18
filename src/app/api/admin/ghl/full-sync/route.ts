import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { fullSync } from "@/lib/ghl/sync";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

const log = logger.child({ route: "/api/admin/ghl/full-sync" });

export async function POST() {
  const session = await auth();
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const tenantId = session.user.tenantId;

  // Check if sync is already in progress
  const syncStatus = await prisma.syncStatus.findUnique({
    where: { tenantId },
  });
  if (syncStatus?.syncInProgress) {
    return NextResponse.json(
      { message: "Sincronización ya en progreso" },
      { status: 202 }
    );
  }

  // Fire-and-forget: start sync in background, return immediately
  log.info({ tenantId }, "Starting full GHL sync (background)");

  fullSync(tenantId)
    .then((result) => {
      log.info(
        { tenantId, status: result.status, contacts: result.contacts, opportunities: result.opportunities },
        "Background sync finished"
      );
    })
    .catch((error) => {
      const msg = error instanceof Error ? error.message : "Unknown error";
      log.error({ tenantId, error: msg }, "Background sync failed");
    });

  return NextResponse.json(
    { message: "Sincronización iniciada", status: "syncing" },
    { status: 202 }
  );
}
