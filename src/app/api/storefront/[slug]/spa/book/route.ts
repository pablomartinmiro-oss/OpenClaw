export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { lookupTenant } from "@/lib/storefront/tenant-lookup";
import { requireModule } from "@/lib/modules/guard";
import { checkSpaAvailability } from "@/lib/spa/booking";
import {
  validateBody,
  storefrontSpaBookingSchema,
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

  const modErr = await requireModule(tenant.id, "spa");
  if (modErr) return modErr;

  const log = logger.child({
    tenantId: tenant.id,
    path: `/api/storefront/${slug}/spa/book`,
  });

  try {
    const body = await request.json();
    const validated = validateBody(body, storefrontSpaBookingSchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }

    const { treatmentId, date, time, clientName, clientEmail, clientPhone } =
      validated.data;

    // 1. Check availability
    const availability = await checkSpaAvailability(
      tenant.id,
      treatmentId,
      date,
      time
    );

    if (!availability.available || !availability.slot || !availability.treatment) {
      return NextResponse.json(
        {
          error: availability.reason ?? "No disponible",
          available: false,
        },
        { status: 409 }
      );
    }

    const { slot, treatment } = availability;

    // 2. Book the slot + create reservation in a transaction
    const reservation = await prisma.$transaction(async (tx) => {
      // Increment booked count
      const updatedSlot = await tx.spaSlot.update({
        where: { id: slot.id },
        data: { booked: { increment: 1 } },
      });

      // If now full, update status
      if (updatedSlot.booked >= updatedSlot.capacity) {
        await tx.spaSlot.update({
          where: { id: slot.id },
          data: { status: "full" },
        });
      }

      // Create reservation
      const res = await tx.reservation.create({
        data: {
          tenantId: tenant.id,
          clientName,
          clientEmail,
          clientPhone,
          source: "web",
          station: "spa",
          activityDate: date,
          schedule: time,
          totalPrice: treatment.price,
          status: "pendiente",
          notes: `Spa: ${treatment.title} (${treatment.duration} min) a las ${time}`,
        },
      });

      // Create activity booking
      await tx.activityBooking.create({
        data: {
          tenantId: tenant.id,
          reservationId: res.id,
          activityDate: date,
          status: "scheduled",
          operationalNotes: `${treatment.title} — ${time} — ${treatment.duration} min`,
        },
      });

      return res;
    });

    log.info(
      { reservationId: reservation.id, treatmentId },
      "Spa booking created from storefront"
    );

    return NextResponse.json(
      {
        reservation: {
          id: reservation.id,
          status: reservation.status,
          totalPrice: treatment.price,
          treatment: {
            title: treatment.title,
            duration: treatment.duration,
          },
          slot: { date: slot.date, time: slot.time },
        },
        tenant: { name: tenant.name, slug: tenant.slug },
      },
      { status: 201 }
    );
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al reservar tratamiento spa",
      code: "STOREFRONT_SPA_BOOK_ERROR",
      logContext: { tenantId: tenant.id },
    });
  }
}
