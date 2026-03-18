import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { generateRedsysForm, generateOrderId } from "@/lib/redsys/client";
import { generateQuotePDF } from "@/lib/pdf/quote-pdf";
import { sendEmail } from "@/lib/email/client";
import { buildQuoteEmailHTML } from "@/lib/email/templates";
import { getGHLClient } from "@/lib/ghl/api";
import { findStageByName } from "@/lib/ghl/stages";

const BASE_URL = "https://crm-dash-prod.up.railway.app";
const IBAN = "ES58 0182 2900 5402 0182 7221";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tenantId } = session.user;
  const { id } = await params;
  const log = logger.child({ tenantId, path: `/api/quotes/${id}/send` });

  try {
    // 1. Fetch quote with items
    const quote = await prisma.quote.findFirst({
      where: { id, tenantId },
      include: { items: true },
    });

    if (!quote) {
      return NextResponse.json({ error: "Presupuesto no encontrado" }, { status: 404 });
    }

    if (!quote.clientEmail) {
      return NextResponse.json(
        { error: "El cliente no tiene email" },
        { status: 400 }
      );
    }

    if (quote.items.length === 0) {
      return NextResponse.json(
        { error: "El presupuesto no tiene productos" },
        { status: 400 }
      );
    }

    // 2. Generate Redsys payment link
    const orderId = generateOrderId();
    let redsysPaymentUrl: string | null = null;

    try {
      const redsysForm = generateRedsysForm({
        orderId,
        amount: quote.totalAmount,
        description: `Presupuesto ${quote.id.slice(-8).toUpperCase()}`,
        merchantUrl: `${BASE_URL}/api/crm/webhooks/redsys`,
        urlOk: `${BASE_URL}/presupuestos/${quote.id}/success`,
        urlKo: `${BASE_URL}/presupuestos/${quote.id}/error`,
      });
      // Build full payment URL with params
      const searchParams = new URLSearchParams();
      searchParams.set("Ds_SignatureVersion", redsysForm.params.Ds_SignatureVersion);
      searchParams.set("Ds_MerchantParameters", redsysForm.params.Ds_MerchantParameters);
      searchParams.set("Ds_Signature", redsysForm.params.Ds_Signature);
      redsysPaymentUrl = `${redsysForm.url}?${searchParams.toString()}`;
    } catch (redsysError) {
      log.warn({ error: redsysError }, "Redsys not configured, sending without payment link");
    }

    // 3. Format dates for display
    const quoteNumber = quote.id.slice(-8).toUpperCase();
    const checkIn = new Date(quote.checkIn).toLocaleDateString("es-ES");
    const checkOut = new Date(quote.checkOut).toLocaleDateString("es-ES");
    const expiresAt = quote.expiresAt
      ? new Date(quote.expiresAt).toLocaleDateString("es-ES")
      : undefined;

    // 4. Generate PDF
    const pdfBuffer = await generateQuotePDF({
      quoteNumber,
      clientName: quote.clientName,
      clientEmail: quote.clientEmail,
      destination: quote.destination,
      checkIn,
      checkOut,
      items: quote.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        totalPrice: item.totalPrice,
      })),
      totalAmount: quote.totalAmount,
      paymentUrl: redsysPaymentUrl ?? undefined,
      expiresAt,
      iban: IBAN,
    });

    // 5. Build email HTML
    const html = buildQuoteEmailHTML({
      quoteNumber,
      clientName: quote.clientName,
      destination: quote.destination,
      checkIn,
      checkOut,
      items: quote.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        totalPrice: item.totalPrice,
      })),
      totalAmount: quote.totalAmount,
      paymentUrl: redsysPaymentUrl ?? undefined,
      expiresAt,
      iban: IBAN,
    });

    // 6. Send email with PDF attachment, CC to reservas
    await sendEmail({
      to: quote.clientEmail,
      subject: `Presupuesto Skicenter N.o ${quoteNumber}`,
      html,
      cc: "reservas@skicenter.es",
      attachments: [
        {
          filename: `presupuesto-${quoteNumber}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    // 7. Update quote status and tracking fields
    const now = new Date();
    await prisma.quote.update({
      where: { id },
      data: {
        status: "enviado",
        sentAt: now,
        emailSentAt: now,
        emailSentTo: quote.clientEmail,
        redsysOrderId: redsysPaymentUrl ? orderId : null,
        redsysPaymentUrl,
        pdfUrl: `/api/quotes/${id}/pdf`,
      },
    });

    // Move GHL opportunity to "SE LE MANDA EL PRESUPUESTO" stage
    if (quote.ghlOpportunityId) {
      try {
        const ghl = await getGHLClient(tenantId);
        const stageInfo = await findStageByName(tenantId, "PRESUPUESTO");
        if (stageInfo) {
          await ghl.updateOpportunity(quote.ghlOpportunityId, {
            stageId: stageInfo.stageId,
          });
          await prisma.cachedOpportunity.updateMany({
            where: { id: quote.ghlOpportunityId, tenantId },
            data: {
              pipelineStageId: stageInfo.stageId,
              cachedAt: new Date(),
            },
          });
          log.info(
            { oppId: quote.ghlOpportunityId, stageId: stageInfo.stageId },
            "GHL opportunity moved to PRESUPUESTO stage",
          );
        }
      } catch (ghlError) {
        log.error(
          { error: ghlError },
          "Failed to move GHL opportunity on send",
        );
      }
    }

    log.info(
      { quoteId: id, to: quote.clientEmail, orderId },
      "Quote sent successfully"
    );

    return NextResponse.json({
      success: true,
      emailSentTo: quote.clientEmail,
      redsysOrderId: redsysPaymentUrl ? orderId : null,
    });
  } catch (error) {
    log.error({ error, quoteId: id }, "Failed to send quote");
    return NextResponse.json(
      { error: "Error al enviar el presupuesto" },
      { status: 500 }
    );
  }
}
