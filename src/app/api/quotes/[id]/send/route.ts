import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { generateRedsysForm, generateOrderId } from "@/lib/redsys/client";
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
      return NextResponse.json({ error: "El cliente no tiene email" }, { status: 400 });
    }

    if (quote.items.length === 0) {
      return NextResponse.json({ error: "El presupuesto no tiene productos" }, { status: 400 });
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
      const sp = new URLSearchParams();
      sp.set("Ds_SignatureVersion", redsysForm.params.Ds_SignatureVersion);
      sp.set("Ds_MerchantParameters", redsysForm.params.Ds_MerchantParameters);
      sp.set("Ds_Signature", redsysForm.params.Ds_Signature);
      redsysPaymentUrl = `${redsysForm.url}?${sp.toString()}`;
    } catch (redsysError) {
      log.warn({ error: redsysError }, "Redsys not configured, sending without payment link");
    }

    // 3. Format dates
    const quoteNumber = quote.id.slice(-8).toUpperCase();
    const checkIn = new Date(quote.checkIn).toLocaleDateString("es-ES");
    const checkOut = new Date(quote.checkOut).toLocaleDateString("es-ES");
    const expiresAt = quote.expiresAt
      ? new Date(quote.expiresAt).toLocaleDateString("es-ES")
      : undefined;

    // 4. PDF download link (GHL API does not support attachments)
    const pdfUrl = `${BASE_URL}/api/quotes/${id}/pdf`;

    // 5. Build email HTML (includes PDF download link + payment button)
    const html = buildQuoteEmailHTML({
      quoteNumber,
      clientName: quote.clientName,
      clientPhone: quote.clientPhone ?? undefined,
      clientEmail: quote.clientEmail ?? undefined,
      destination: quote.destination,
      checkIn,
      checkOut,
      items: quote.items.map((item) => ({
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        totalPrice: item.totalPrice,
        startDate: item.startDate ? new Date(item.startDate).toLocaleDateString("es-ES") : null,
        numDays: item.numDays,
        horario: item.horario,
        modalidad: item.modalidad,
        nivel: item.nivel,
        sector: item.sector,
        idioma: item.idioma,
        tipoCliente: item.tipoCliente,
        notes: item.notes,
      })),
      totalAmount: quote.totalAmount,
      paymentUrl: redsysPaymentUrl ?? undefined,
      expiresAt,
      iban: IBAN,
      pdfUrl,
    });

    // 6. Send via GHL (non-blocking — quote saved as SENT regardless)
    let emailError: string | null = null;
    let emailSkipped = false;
    try {
      const result = await sendEmail({
        tenantId,
        contactId: quote.ghlContactId ?? null,
        to: quote.clientEmail,
        subject: `Presupuesto nº ${quoteNumber} ${quote.clientName}`,
        html,
      });
      if (result.skipped) {
        emailSkipped = true;
        log.warn({ quoteId: id, reason: result.skipReason }, "Email skipped");
      }
    } catch (err) {
      const e = err as Error & { code?: string };
      emailError = `${e.code ?? "EMAIL_ERROR"}: ${e.message}`;
      log.error({ error: err, to: quote.clientEmail }, "GHL email failed — quote saved as sent anyway");
    }

    // 7. Update quote status
    const now = new Date();
    const emailSent = !emailError && !emailSkipped;
    await prisma.quote.update({
      where: { id },
      data: {
        status: "enviado",
        sentAt: now,
        ...(emailSent ? { emailSentAt: now, emailSentTo: quote.clientEmail } : {}),
        redsysOrderId: redsysPaymentUrl ? orderId : null,
        redsysPaymentUrl,
        pdfUrl: `/api/quotes/${id}/pdf`,
      },
    });

    // 8. Move GHL opportunity to PRESUPUESTO stage
    if (quote.ghlOpportunityId) {
      try {
        const ghl = await getGHLClient(tenantId);
        const stageInfo = await findStageByName(tenantId, "PRESUPUESTO");
        if (stageInfo) {
          await ghl.updateOpportunity(quote.ghlOpportunityId, { stageId: stageInfo.stageId });
          await prisma.cachedOpportunity.updateMany({
            where: { id: quote.ghlOpportunityId, tenantId },
            data: { pipelineStageId: stageInfo.stageId, cachedAt: new Date() },
          });
        }
      } catch (ghlError) {
        log.error({ error: ghlError }, "Failed to move GHL opportunity on send");
      }
    }

    log.info({ quoteId: id, to: quote.clientEmail, orderId, emailError, emailSkipped }, "Quote sent");

    return NextResponse.json({
      success: true,
      emailSentTo: emailSent ? quote.clientEmail : null,
      emailError,
      emailSkipped,
      redsysPaymentUrl,
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
