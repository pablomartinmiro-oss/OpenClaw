import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import type { DailyOrder } from "@/generated/prisma/client";

/**
 * Generate or update a DailyOrder for a specific date.
 * Counts activity bookings, restaurant bookings, and spa slots,
 * then upserts a summary record.
 */
export async function generateDailyOrder(
  tenantId: string,
  date: Date
): Promise<DailyOrder> {
  const log = logger.child({ tenantId, fn: "generateDailyOrder" });

  // Normalize to start/end of day
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  // Count activity bookings for the date
  const activityCount = await prisma.activityBooking.count({
    where: {
      tenantId,
      activityDate: { gte: dayStart, lt: dayEnd },
      status: { not: "cancelled" },
    },
  });

  // Count restaurant bookings (confirmed + no_show) for the date
  const restaurantCount = await prisma.restaurantBooking.count({
    where: {
      tenantId,
      date: { gte: dayStart, lt: dayEnd },
      status: { not: "cancelled" },
    },
  });

  // Count spa slots with at least 1 booking for the date
  const spaSlots = await prisma.spaSlot.findMany({
    where: {
      tenantId,
      date: { gte: dayStart, lt: dayEnd },
      booked: { gt: 0 },
    },
    select: { booked: true },
  });
  const spaBookedCount = spaSlots.reduce((sum, s) => sum + s.booked, 0);

  // Build notes summary
  const parts: string[] = [];
  if (activityCount > 0) {
    parts.push(`${activityCount} actividades`);
  }
  if (restaurantCount > 0) {
    parts.push(`${restaurantCount} mesas`);
  }
  if (spaBookedCount > 0) {
    parts.push(`${spaBookedCount} tratamientos spa`);
  }
  const notes = parts.length > 0
    ? parts.join(", ")
    : "Sin operaciones programadas";

  // Upsert DailyOrder
  const dailyOrder = await prisma.dailyOrder.upsert({
    where: {
      tenantId_date: { tenantId, date: dayStart },
    },
    update: {
      notes,
      generatedAt: new Date(),
    },
    create: {
      tenantId,
      date: dayStart,
      notes,
      generatedAt: new Date(),
    },
  });

  log.info(
    { dailyOrderId: dailyOrder.id, activityCount, restaurantCount, spaBookedCount },
    "Daily order generated"
  );

  return dailyOrder;
}
