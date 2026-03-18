import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tenantId } = session.user;
  const log = logger.child({ tenantId, path: "/api/settings/tenant" });

  try {
    const [tenant, syncStatus] = await Promise.all([
      prisma.tenant.findUniqueOrThrow({
        where: { id: tenantId },
        select: {
          id: true,
          name: true,
          slug: true,
          ghlLocationId: true,
          ghlConnectedAt: true,
          ghlTokenExpiry: true,
          onboardingComplete: true,
          onboardingDismissed: true,
          isDemo: true,
          isActive: true,
          syncState: true,
          syncProgressMsg: true,
          lastSyncAt: true,
          lastSyncError: true,
          createdAt: true,
        },
      }),
      prisma.syncStatus.findUnique({ where: { tenantId } }),
    ]);

    // Recovery: if sync has been "in progress" for >15 min, it's stuck — reset it
    if (syncStatus?.syncInProgress) {
      const lastUpdate = syncStatus.lastFullSync ?? syncStatus.lastIncrSync;
      const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000);
      const isStale = !lastUpdate || new Date(lastUpdate) < fifteenMinAgo;
      if (isStale) {
        log.warn({ tenantId }, "Resetting stale sync — stuck for >15 min");
        await prisma.syncStatus.update({
          where: { tenantId },
          data: { syncInProgress: false, lastError: "Sincronización anterior interrumpida" },
        });
        await prisma.tenant.update({
          where: { id: tenantId },
          data: { syncState: "error", lastSyncError: "Sincronización anterior interrumpida. Pulsa Sincronizar de nuevo." },
        });
        // Re-read the updated state
        const [updatedTenant, updatedSync] = await Promise.all([
          prisma.tenant.findUniqueOrThrow({
            where: { id: tenantId },
            select: {
              id: true, name: true, slug: true, ghlLocationId: true, ghlConnectedAt: true,
              ghlTokenExpiry: true, onboardingComplete: true, onboardingDismissed: true,
              isDemo: true, isActive: true, syncState: true, syncProgressMsg: true,
              lastSyncAt: true, lastSyncError: true, createdAt: true,
            },
          }),
          prisma.syncStatus.findUnique({ where: { tenantId } }),
        ]);
        return NextResponse.json({ tenant: updatedTenant, syncStatus: updatedSync });
      }
    }

    log.info("Tenant settings fetched");
    return NextResponse.json({ tenant, syncStatus });
  } catch (error) {
    log.error({ error }, "Failed to fetch tenant settings");
    return NextResponse.json(
      { error: "Failed to fetch settings", code: "SETTINGS_ERROR" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tenantId } = session.user;
  const log = logger.child({ tenantId, path: "/api/settings/tenant" });

  try {
    const body = await request.json();
    const { onboardingDismissed } = body as { onboardingDismissed?: boolean };

    const updated = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        ...(onboardingDismissed !== undefined ? { onboardingDismissed } : {}),
      },
      select: { id: true, onboardingDismissed: true },
    });

    log.info("Tenant settings updated");
    return NextResponse.json({ tenant: updated });
  } catch (error) {
    log.error({ error }, "Failed to update tenant settings");
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
