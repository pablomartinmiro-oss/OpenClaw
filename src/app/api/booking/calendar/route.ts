export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const modError = await requireModule(tenantId, "booking");
  if (modError) return modError;

  const log = logger.child({ tenantId, path: "/api/booking/calendar" });
  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get("date");

  if (!dateStr) {
    return NextResponse.json({ error: "Parametro date requerido" }, { status: 400 });
  }

  const dayStart = new Date(dateStr);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dateStr);
  dayEnd.setDate(dayEnd.getDate() + 1);

  try {
    // Fetch all event types in parallel
    const [activities, restaurantBookings, spaSlots, dailyOrder] = await Promise.all([
      // Activity bookings
      prisma.activityBooking.findMany({
        where: { tenantId, activityDate: { gte: dayStart, lt: dayEnd } },
        include: {
          reservation: {
            select: {
              clientName: true,
              station: true,
              clientPhone: true,
              schedule: true,
              status: true,
            },
          },
          monitors: {
            include: { user: { select: { id: true, name: true, email: true } } },
          },
        },
        orderBy: { activityDate: "asc" },
      }),

      // Restaurant bookings
      prisma.restaurantBooking.findMany({
        where: { tenantId, date: { gte: dayStart, lt: dayEnd } },
        include: {
          restaurant: { select: { title: true, slug: true } },
          client: { select: { name: true, phone: true } },
        },
        orderBy: { time: "asc" },
      }),

      // Spa slots (booked > 0)
      prisma.spaSlot.findMany({
        where: { tenantId, date: { gte: dayStart, lt: dayEnd }, booked: { gt: 0 } },
        include: {
          treatment: { select: { title: true, duration: true } },
          resource: { select: { name: true, type: true } },
        },
        orderBy: { time: "asc" },
      }),

      // Daily order
      prisma.dailyOrder.findFirst({
        where: { tenantId, date: { gte: dayStart, lt: dayEnd } },
      }),
    ]);

    const totalDiners = restaurantBookings.reduce((sum, rb) => sum + rb.guestCount, 0);
    const totalSpaClients = spaSlots.reduce((sum, s) => sum + s.booked, 0);

    log.info(
      { activities: activities.length, restaurants: restaurantBookings.length, spa: spaSlots.length },
      "Calendar data fetched"
    );

    return NextResponse.json({
      activities,
      restaurantBookings,
      spaSlots,
      dailyOrder,
      summary: {
        totalActivities: activities.length,
        totalDiners,
        totalSpaClients,
      },
    });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener calendario",
      code: "BOOKING_CALENDAR_ERROR",
      logContext: { tenantId },
    });
  }
}
