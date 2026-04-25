export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import {
  validateBody,
  createRestaurantReservationSchema,
} from "@/lib/validation";
import { Prisma } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "restaurant");
  if (moduleError) return moduleError;

  const log = logger.child({ tenantId, path: "/api/restaurant/reservations" });
  const { searchParams } = request.nextUrl;
  const date = searchParams.get("date");
  const status = searchParams.get("status");

  try {
    const where: Prisma.RestaurantReservationWhereInput = { tenantId };
    if (status) where.status = status;
    if (date) {
      const d = new Date(date);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      where.date = { gte: d, lt: next };
    }

    const reservations = await prisma.restaurantReservation.findMany({
      where,
      orderBy: [{ date: "asc" }, { time: "asc" }],
    });

    log.info({ count: reservations.length }, "Reservations fetched");
    return NextResponse.json({ reservations });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to fetch reservations",
      code: "RESTAURANT_RESERVATION_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "restaurant");
  if (moduleError) return moduleError;

  const log = logger.child({ tenantId, path: "/api/restaurant/reservations" });

  try {
    const body = await request.json();
    const validated = validateBody(body, createRestaurantReservationSchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }
    const data = validated.data;

    const reservation = await prisma.restaurantReservation.create({
      data: {
        tenantId,
        date: data.date,
        time: data.time,
        guestCount: data.guestCount,
        guestName: data.guestName,
        guestPhone: data.guestPhone ?? null,
        guestEmail: data.guestEmail ?? null,
        notes: data.notes ?? null,
        status: data.status,
      },
    });

    log.info({ id: reservation.id }, "Reservation created");
    return NextResponse.json({ reservation }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to create reservation",
      code: "RESTAURANT_RESERVATION_ERROR",
      logContext: { tenantId },
    });
  }
}
