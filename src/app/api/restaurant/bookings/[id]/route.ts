export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import {
  validateBody,
  updateRestaurantBookingSchema,
} from "@/lib/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { id } = await params;
  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "restaurant");
  if (moduleError) return moduleError;

  const log = logger.child({
    tenantId,
    path: `/api/restaurant/bookings/${id}`,
  });

  try {
    const booking = await prisma.restaurantBooking.findFirst({
      where: { id, tenantId },
      include: {
        restaurant: {
          select: { id: true, title: true, depositPerGuest: true },
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    log.info({ bookingId: id }, "Booking fetched");
    return NextResponse.json({ booking });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to fetch booking",
      code: "RESTAURANT_BOOKING_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { id } = await params;
  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "restaurant");
  if (moduleError) return moduleError;

  const log = logger.child({
    tenantId,
    path: `/api/restaurant/bookings/${id}`,
  });

  try {
    const existing = await prisma.restaurantBooking.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = validateBody(
      body,
      updateRestaurantBookingSchema
    );
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }
    const data = validated.data;

    const booking = await prisma.restaurantBooking.update({
      where: { id },
      data: {
        ...(data.clientId !== undefined && {
          clientId: data.clientId ?? null,
        }),
        ...(data.date !== undefined && { date: data.date }),
        ...(data.time !== undefined && { time: data.time }),
        ...(data.guestCount !== undefined && {
          guestCount: data.guestCount,
        }),
        ...(data.specialRequests !== undefined && {
          specialRequests: data.specialRequests ?? null,
        }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.depositStatus !== undefined && {
          depositStatus: data.depositStatus,
        }),
        ...(data.operationalNotes !== undefined && {
          operationalNotes: data.operationalNotes ?? null,
        }),
      },
    });

    log.info({ bookingId: id }, "Booking updated");
    return NextResponse.json({ booking });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to update booking",
      code: "RESTAURANT_BOOKING_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { id } = await params;
  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "restaurant");
  if (moduleError) return moduleError;

  const log = logger.child({
    tenantId,
    path: `/api/restaurant/bookings/${id}`,
  });

  try {
    const existing = await prisma.restaurantBooking.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    await prisma.restaurantBooking.delete({ where: { id } });

    log.info({ bookingId: id }, "Booking deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to delete booking",
      code: "RESTAURANT_BOOKING_ERROR",
      logContext: { tenantId },
    });
  }
}
