export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { apiError, badRequest } from "@/lib/api-response";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/db";
import { buildRedsysForm, generateMerchantOrder } from "@/lib/payments/redsys";
import { z } from "zod";
import { validateBody } from "@/lib/validation";

const generatePaymentSchema = z.object({
  quoteId: z.string().min(1),
});

const log = logger.child({ route: "/api/payments/redsys/generate" });

/**
 * POST /api/payments/redsys/generate
 * Generate a Redsys payment form for a quote.
 * Protected — requires authenticated session.
 */
export async function POST(request: NextRequest) {
  try {
    const [session, authError] = await requireTenant();
    if (authError) return authError;

    const { tenantId } = session;
    const body = await request.json();
    const parsed = validateBody(body, generatePaymentSchema);
    if (!parsed.ok) return badRequest(parsed.error);

    const quote = await prisma.quote.findFirst({
      where: { id: parsed.data.quoteId, tenantId },
    });

    if (!quote) {
      return NextResponse.json({ error: "Presupuesto no encontrado" }, { status: 404 });
    }

    if (quote.paymentStatus === "paid") {
      return badRequest("Este presupuesto ya esta pagado");
    }

    // Amount in cents (integer) — never use floats
    const amountCents = Math.round(quote.totalAmount * 100);
    if (amountCents <= 0) {
      return badRequest("El importe debe ser mayor que 0");
    }

    // Generate or reuse order ID
    const merchantOrder = quote.redsysOrderId ?? generateMerchantOrder();
    const baseUrl = process.env.AUTH_URL ?? "https://openclaw-production.up.railway.app";

    const formData = buildRedsysForm({
      amountCents,
      merchantOrder,
      productDescription: `Presupuesto ${quote.clientName}`.slice(0, 125),
      notifyUrl: `${baseUrl}/api/payments/redsys/notification`,
      okUrl: `${baseUrl}/presupuestos/${quote.id}/success`,
      koUrl: `${baseUrl}/presupuestos/${quote.id}/error`,
      holderName: quote.clientName,
    });

    // Save order ID and payment URL on the quote
    await prisma.quote.update({
      where: { id: quote.id },
      data: {
        redsysOrderId: merchantOrder,
        redsysPaymentUrl: formData.url,
        paymentMethod: "redsys",
        paymentStatus: "pending",
      },
    });

    log.info(
      { quoteId: quote.id, merchantOrder, amountCents },
      "Redsys payment form generated"
    );

    return NextResponse.json({
      formData,
      merchantOrder,
      quoteId: quote.id,
    });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al generar formulario de pago",
      code: "REDSYS_GENERATE_ERROR",
    });
  }
}
