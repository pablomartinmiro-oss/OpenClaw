export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, createActivityBookingSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "booking");
  if (moduleError) return moduleError;

  const log = logger.child({ tenantId, path: "/api/booking/activities" });
  const { searchParams } = request.nextUrl;
  const date = searchParams.get("date");
  const status = searchParams.get("status");
  const reservationId = searchParams.get("reservationId");

  try {
    const where: Record<string, unknown> = { tenantId };

    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      where.activityDate = { gte: start, lt: end };
    }
    if (status) where.status = status;
    if (reservationId) where.reservationId = reservationId;

    const bookings = await prisma.activityBooking.findMany({
      where,
      include: {
        reservation: {
          select: { clientName: true, station: true, clientPhone: true },
        },
        monitors: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { activityDate: "asc" },
    });

    log.info({ count: bookings.length }, "Activity bookings fetched");
    return NextResponse.json({ bookings });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to fetch activity bookings",
      code: "BOOKING_ACTIVITIES_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "booking");
  if (moduleError) return moduleError;

  const log = logger.child({ tenantId, path: "/api/booking/activities" });

  try {
    const body = await request.json();
    const validated = validateBody(body, createActivityBookingSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const data = validated.data;

    // Verify reservation belongs to tenant
    const reservation = await prisma.reservation.findFirst({
      where: { id: data.reservationId, tenantId },
    });
    if (!reservation) {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 }
      );
    }

    const booking = await prisma.activityBooking.create({
      data: {
        tenantId,
        reservationId: data.reservationId,
        activityDate: data.activityDate,
        status: data.status,
        operationalNotes: data.operationalNotes ?? null,
      },
      include: {
        reservation: {
          select: { clientName: true, station: true, clientPhone: true },
        },
        monitors: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    log.info({ bookingId: booking.id }, "Activity booking created");
    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to create activity booking",
      code: "BOOKING_ACTIVITIES_ERROR",
      logContext: { tenantId },
    });
  }
}
