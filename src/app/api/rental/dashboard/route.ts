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

    const tomorrowEnd = new Date(todayEnd);
    tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);

    // 7 days ago (rolling window for chart)
    const weekAgo = new Date(todayStart);
    weekAgo.setDate(weekAgo.getDate() - 6);

    const [
      pickupsToday,
      returnsToday,
      activeRentals,
      completedToday,
      lowStockAlerts,
      revenueData,
      maintenanceCount,
      availableUnits,
      pickedUpCountsRaw,
      upcomingReturns,
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
      // Inventory under maintenance/baja
      prisma.rentalInventory.count({
        where: {
          tenantId,
          condition: { in: ["mantenimiento", "baja"] },
        },
      }),
      // Total available units across all bueno-condition pools
      prisma.rentalInventory.aggregate({
        where: { tenantId, condition: "bueno" },
        _sum: { availableQuantity: true },
      }),
      // Daily picked-up counts for last 7 days
      prisma.$queryRaw<{ day: Date; count: bigint }[]>`
        SELECT date_trunc('day', "pickedUpAt") AS day, COUNT(*)::bigint AS count
        FROM "RentalOrder"
        WHERE "tenantId" = ${tenantId}
          AND "pickedUpAt" IS NOT NULL
          AND "pickedUpAt" >= ${weekAgo}
        GROUP BY day
        ORDER BY day ASC
      `,
      // Upcoming returns (today + tomorrow)
      prisma.rentalOrder.findMany({
        where: {
          tenantId,
          returnDate: { gte: todayStart, lte: tomorrowEnd },
          status: { in: ["PICKED_UP", "IN_USE", "RESERVED", "PREPARED"] },
        },
        select: {
          id: true,
          clientName: true,
          stationSlug: true,
          returnDate: true,
          status: true,
          depositCents: true,
        },
        orderBy: { returnDate: "asc" },
        take: 20,
      }),
    ]);

    // Build 7-day chart data (fill missing days with 0)
    const pickupCountByDay = new Map<string, number>();
    for (const row of pickedUpCountsRaw) {
      const key = new Date(row.day).toISOString().slice(0, 10);
      pickupCountByDay.set(key, Number(row.count));
    }
    const last7Days: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayStart);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      last7Days.push({ date: key, count: pickupCountByDay.get(key) ?? 0 });
    }

    const dashboard = {
      pickupsToday,
      returnsToday,
      activeRentals,
      completedToday,
      maintenanceCount,
      availableUnits: availableUnits._sum.availableQuantity ?? 0,
      lowStockAlerts,
      revenueToday: revenueData._sum.totalPrice ?? 0,
      last7Days,
      upcomingReturns: upcomingReturns.map((r) => ({
        ...r,
        returnDate: r.returnDate.toISOString(),
      })),
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
