import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { sendEmail } from "@/lib/email/client";
import { buildConfirmationEmailHTML } from "@/lib/email/templates";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tenantId } = session.user;
  const { id } = await params;
  const log = logger.child({ tenantId, path: `/api/quotes/${id}/mark-paid` });

  try {
    const quote = await prisma.quote.findFirst({
      where: { id, tenantId },
    });

    if (!quote) {
      return NextResponse.json(
        { error: "Presupuesto no encontrado" },
        { status: 404 }
      );
    }

    const body = (await request.json()) as {
      paymentMethod?: string;
      paymentRef?: string;
    };

    const paymentMethod = body.paymentMethod ?? "transfer";

    // Update quote as paid
    const updated = await prisma.quote.update({
      where: { id },
      data: {
        status: "pagado",
        paymentStatus: "paid",
        paymentMethod,
        paymentRef: body.paymentRef ?? null,
        paidAt: new Date(),
      },
      include: { items: true },
    });

    log.info(
      { quoteId: id, paymentMethod },
      "Quote marked as paid"
    );

    // Send confirmation email
    if (quote.clientEmail) {
      try {
        const quoteNumber = quote.id.slice(-8).toUpperCase();
        const html = buildConfirmationEmailHTML({
          quoteNumber,
          clientName: quote.clientName,
          destination: quote.destination,
          checkIn: new Date(quote.checkIn).toLocaleDateString("es-ES"),
          checkOut: new Date(quote.checkOut).toLocaleDateString("es-ES"),
          totalAmount: quote.totalAmount,
          paymentRef: body.paymentRef,
        });

        await sendEmail({
          to: quote.clientEmail,
          subject: `Pago confirmado — Presupuesto ${quoteNumber}`,
          html,
          cc: "reservas@skicenter.es",
        });
      } catch (emailError) {
        log.error(
          { error: emailError, quoteId: id },
          "Failed to send confirmation email"
        );
      }
    }

    // Move GHL opportunity if linked
    if (quote.ghlOpportunityId) {
      log.info(
        { oppId: quote.ghlOpportunityId },
        "GHL opportunity should be moved to CLIENTE COMPRA stage"
      );
      // GHL stage move would go here when GHL is connected
    }

    return NextResponse.json({ quote: updated });
  } catch (error) {
    log.error({ error, quoteId: id }, "Failed to mark quote as paid");
    return NextResponse.json(
      { error: "Error al marcar como pagado" },
      { status: 500 }
    );
  }
}
