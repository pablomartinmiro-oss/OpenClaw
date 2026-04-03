export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { lookupTenant } from "@/lib/storefront/tenant-lookup";
import { requireModule } from "@/lib/modules/guard";
import { checkRestaurantAvailability } from "@/lib/restaurant/booking";
import {
  validateBody,
  storefrontRestaurantBookingSchema,
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

  const modErr = await requireModule(tenant.id, "restaurant");
  if (modErr) return modErr;

  const log = logger.child({
    tenantId: tenant.id,
    path: `/api/storefront/${slug}/restaurant/book`,
  });

  try {
    const body = await request.json();
    const validated = validateBody(body, storefrontRestaurantBookingSchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }

    const {
      restaurantId,
      date,
      time,
      guestCount,
      clientName,
      clientEmail,
      specialRequests,
    } = validated.data;

    // 1. Check availability (closures, shifts, capacity)
    const availability = await checkRestaurantAvailability(
      tenant.id,
      restaurantId,
      date,
      time,
      guestCount
    );

    if (!availability.available) {
      return NextResponse.json(
        {
          error: availability.reason ?? "No disponible",
          available: false,
          shift: availability.shift ?? null,
        },
        { status: 409 }
      );
    }

    // 2. Optionally find or create client
    let clientId: string | null = null;
    if (clientEmail) {
      const existing = await prisma.client.findFirst({
        where: { tenantId: tenant.id, email: clientEmail },
      });
      if (existing) {
        clientId = existing.id;
      } else {
        const newClient = await prisma.client.create({
          data: {
            tenantId: tenant.id,
            name: clientName,
            email: clientEmail,
            conversionSource: "storefront",
          },
        });
        clientId = newClient.id;
      }
    }

    // 3. Create restaurant booking
    const booking = await prisma.restaurantBooking.create({
      data: {
        tenantId: tenant.id,
        restaurantId,
        clientId,
        date,
        time,
        guestCount,
        specialRequests: specialRequests ?? null,
        status: "confirmed",
        depositStatus: "pending",
      },
      include: {
        restaurant: { select: { id: true, title: true } },
      },
    });

    log.info(
      { bookingId: booking.id, restaurantId, guestCount },
      "Restaurant booking created from storefront"
    );

    return NextResponse.json(
      {
        booking: {
          id: booking.id,
          status: booking.status,
          date: booking.date,
          time: booking.time,
          guestCount: booking.guestCount,
          restaurant: booking.restaurant,
        },
        tenant: { name: tenant.name, slug: tenant.slug },
      },
      { status: 201 }
    );
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al reservar mesa",
      code: "STOREFRONT_RESTAURANT_BOOK_ERROR",
      logContext: { tenantId: tenant.id },
    });
  }
}
