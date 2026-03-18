import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { sendEmail } from "@/lib/email/client";
import { buildConfirmationEmailHTML } from "@/lib/email/templates";
import { getGHLClient } from "@/lib/ghl/api";
import { findStageByName } from "@/lib/ghl/stages";

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

    // Send confirmation email via GHL
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
          tenantId,
          contactId: quote.ghlContactId ?? null,
          to: quote.clientEmail,
          subject: `Pago confirmado — Presupuesto ${quoteNumber}`,
          html,
        });
      } catch (emailError) {
        log.error({ error: emailError, quoteId: id }, "Failed to send confirmation email");
      }
    }

    // Move GHL opportunity to COMPRA stage
    if (quote.ghlOpportunityId) {
      try {
        const ghl = await getGHLClient(tenantId);
        const stageInfo = await findStageByName(tenantId, "COMPRA");
        if (stageInfo) {
          await ghl.updateOpportunity(quote.ghlOpportunityId, {
            stageId: stageInfo.stageId,
            monetaryValue: quote.totalAmount,
            status: "won",
          });
          await prisma.cachedOpportunity.updateMany({
            where: { id: quote.ghlOpportunityId, tenantId },
            data: {
              pipelineStageId: stageInfo.stageId,
              monetaryValue: quote.totalAmount,
              status: "won",
              cachedAt: new Date(),
            },
          });
          log.info(
            { oppId: quote.ghlOpportunityId },
            "GHL opportunity moved to COMPRA stage",
          );
        }
      } catch (ghlError) {
        log.error(
          { error: ghlError },
          "Failed to move GHL opportunity on payment",
        );
      }
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
