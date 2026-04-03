export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { lookupTenant } from "@/lib/storefront/tenant-lookup";
import { requireModule } from "@/lib/modules/guard";
import { checkHotelAvailability } from "@/lib/hotel/availability";
import {
  validateBody,
  storefrontHotelBookingSchema,
} from "@/lib/validation";

type RouteCtx = { params: Promise<{ slug: string }> };

export async function POST(request: NextRequest, ctx: RouteCtx) {
  const { slug } = await ctx.params;
  const tenant = await lookupTenant(slug);
  if (!tenant) {
    return NextResponse.json(
      { error: "Tienda no encontrada" },
      { status: 404 }
    );
  }

  const modErr = await requireModule(tenant.id, "hotel");
  if (modErr) return modErr;

  const log = logger.child({
    tenantId: tenant.id,
    path: `/api/storefront/${slug}/hotel/book`,
  });

  try {
    const body = await request.json();
    const validated = validateBody(body, storefrontHotelBookingSchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }

    const { roomTypeId, checkIn, checkOut, guests, clientName, clientEmail, clientPhone } =
      validated.data;

    // 1. Check availability + get pricing
    const availability = await checkHotelAvailability(
      tenant.id,
      roomTypeId,
      checkIn,
      checkOut,
      guests
    );

    if (!availability.available) {
      return NextResponse.json(
        { error: availability.reason ?? "No disponible", available: false },
        { status: 409 }
      );
    }

    // 2. Create reservation + activity bookings in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.create({
        data: {
          tenantId: tenant.id,
          clientName,
          clientEmail,
          clientPhone,
          source: "web",
          station: "hotel",
          activityDate: checkIn,
          schedule: `${availability.nights} noches`,
          totalPrice: availability.totalPrice,
          status: "pendiente",
          notes: `Hotel: ${availability.nights} noches, ${guests} personas`,
        },
      });

      // Create one ActivityBooking per night
      const msPerDay = 86_400_000;
      const bookings = [];
      for (let i = 0; i < availability.nights; i++) {
        const nightDate = new Date(checkIn.getTime() + i * msPerDay);
        bookings.push({
          tenantId: tenant.id,
          reservationId: reservation.id,
          activityDate: nightDate,
          status: "scheduled",
          operationalNotes: `Noche ${i + 1}/${availability.nights} — ${availability.dailyRates[i]?.price ?? 0} EUR`,
        });
      }

      if (bookings.length > 0) {
        await tx.activityBooking.createMany({ data: bookings });
      }

      return reservation;
    });

    log.info(
      { reservationId: result.id, nights: availability.nights },
      "Hotel booking created from storefront"
    );

    return NextResponse.json(
      {
        reservation: {
          id: result.id,
          status: result.status,
          totalPrice: availability.totalPrice,
          nights: availability.nights,
          dailyRates: availability.dailyRates,
        },
        tenant: { name: tenant.name, slug: tenant.slug },
      },
      { status: 201 }
    );
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al reservar habitacion",
      code: "STOREFRONT_HOTEL_BOOK_ERROR",
      logContext: { tenantId: tenant.id },
    });
  }
}
