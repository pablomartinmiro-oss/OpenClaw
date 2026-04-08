export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";

export async function GET() {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "rental");
  if (moduleError) return moduleError;

  const log = logger.child({ tenantId, path: "/api/rental/dashboard" });

  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [
      pickupsToday,
      returnsToday,
      activeRentals,
      completedToday,
      lowStockAlerts,
      revenueData,
    ] = await Promise.all([
      // Pickups pending today
      prisma.rentalOrder.count({
        where: {
          tenantId,
          pickupDate: { gte: todayStart, lte: todayEnd },
          status: { in: ["RESERVED", "PREPARED"] },
        },
      }),
      // Returns expected today
      prisma.rentalOrder.count({
        where: {
          tenantId,
          returnDate: { gte: todayStart, lte: todayEnd },
          status: { in: ["PICKED_UP", "IN_USE"] },
        },
      }),
      // Active rentals
      prisma.rentalOrder.count({
        where: {
          tenantId,
          status: { in: ["PICKED_UP", "IN_USE"] },
        },
      }),
      // Completed today
      prisma.rentalOrder.count({
        where: {
          tenantId,
          returnedAt: { gte: todayStart, lte: todayEnd },
          status: { in: ["RETURNED", "INSPECTED"] },
        },
      }),
      // Low stock alerts (self-referencing column comparison requires raw SQL)
      prisma.$queryRaw<{
        stationSlug: string;
        equipmentType: string;
        size: string;
        qualityTier: string;
        availableQuantity: number;
        minStockAlert: number;
      }[]>`
        SELECT "stationSlug", "equipmentType", "size", "qualityTier",
               "availableQuantity", "minStockAlert"
        FROM "RentalInventory"
        WHERE "tenantId" = ${tenantId}
          AND "availableQuantity" <= "minStockAlert"
        ORDER BY "availableQuantity" ASC
        LIMIT 20
      `,
      // Revenue today (orders picked up today)
      prisma.rentalOrder.aggregate({
        where: {
          tenantId,
          pickedUpAt: { gte: todayStart, lte: todayEnd },
        },
        _sum: { totalPrice: true },
      }),
    ]);

    const dashboard = {
      pickupsToday,
      returnsToday,
      activeRentals,
      completedToday,
      lowStockAlerts,
      revenueToday: revenueData._sum.totalPrice ?? 0,
    };

    log.info("Rental dashboard fetched");
    return NextResponse.json(dashboard);
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to fetch rental dashboard",
      code: "RENTAL_DASHBOARD_ERROR",
      logContext: { tenantId },
    });
  }
}
