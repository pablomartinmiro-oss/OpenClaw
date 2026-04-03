export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ quoteId: string }> }
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { quoteId } = await params;
  const { tenantId } = session;
  const log = logger.child({ tenantId, path: `/api/reservations/from-quote/${quoteId}` });

  try {
    const quote = await prisma.quote.findFirst({
      where: { id: quoteId, tenantId },
      include: { items: true },
    });

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    // Build services from quote items
    const services = quote.items.map((item) => ({
      type: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    }));

    const reservation = await prisma.reservation.create({
      data: {
        tenantId,
        quoteId: quote.id,
        ghlContactId: quote.ghlContactId,
        clientName: quote.clientName,
        clientPhone: quote.clientPhone || "",
        clientEmail: quote.clientEmail || "",
        source: "presupuesto",
        station: quote.destination,
        activityDate: quote.checkIn,
        schedule: "10:00-13:00",
        language: "es",
        services,
        totalPrice: quote.totalAmount,
        discount: 0,
        status: "pendiente",
        notes: quote.clientNotes,
        createdBy: session.userId,
      },
    });

    log.info({ quoteId, reservationId: reservation.id }, "Reservation created from quote");
    return NextResponse.json({ reservation }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to create reservation from quote",
      code: "RESERVATION_FROM_QUOTE_ERROR",
      logContext: { tenantId, quoteId },
    });
  }
}
