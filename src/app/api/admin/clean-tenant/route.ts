export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { apiError } from "@/lib/api-response";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

/**
 * POST /api/admin/clean-tenant
 * Removes all demo/seeded data from the current tenant.
 * Keeps: products, season calendar, cached GHL data.
 */
export async function POST() {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const log = logger.child({ route: "clean-tenant", tenantId });

  try {
    const [reservations, quotes, capacity, notifications] = await Promise.all([
      prisma.reservation.deleteMany({ where: { tenantId } }),
      prisma.quote.deleteMany({ where: { tenantId } }),
      prisma.stationCapacity.deleteMany({ where: { tenantId } }),
      prisma.notification.deleteMany({ where: { tenantId } }),
    ]);

    log.info({
      reservations: reservations.count,
      quotes: quotes.count,
      capacity: capacity.count,
      notifications: notifications.count,
    }, "Tenant cleaned");

    return NextResponse.json({
      success: true,
      deleted: {
        reservations: reservations.count,
        quotes: quotes.count,
        capacity: capacity.count,
        notifications: notifications.count,
      },
    });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to clean tenant",
      code: "ADMIN_ERROR",
      logContext: { tenantId },
    });
  }
}
