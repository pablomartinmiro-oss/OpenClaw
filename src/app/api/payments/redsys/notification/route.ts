export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/api-response";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { validateRedsysNotification } from "@/lib/payments/redsys";

const log = logger.child({ route: "/api/payments/redsys/notification" });

/**
 * POST /api/payments/redsys/notification
 * PUBLIC endpoint — no auth required. Receives Redsys IPN callbacks.
 * Redsys sends form-encoded POST with payment result.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const signatureVersion = formData.get("Ds_SignatureVersion") as string;
    const merchantParameters = formData.get("Ds_MerchantParameters") as string;
    const signature = formData.get("Ds_Signature") as string;

    if (!signatureVersion || !merchantParameters || !signature) {
      log.warn("Missing Redsys IPN parameters");
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Validate signature with timing-safe comparison
    const result = validateRedsysNotification({
      Ds_SignatureVersion: signatureVersion,
      Ds_MerchantParameters: merchantParameters,
      Ds_Signature: signature,
    });

    if (!result.isValid) {
      log.warn({ merchantOrder: result.merchantOrder }, "Invalid Redsys signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    log.info(
      {
        merchantOrder: result.merchantOrder,
        responseCode: result.responseCode,
        isAuthorized: result.isAuthorized,
        amountCents: result.amount,
      },
      "Redsys IPN received"
    );

    // Find quote by redsysOrderId
    const quote = await prisma.quote.findUnique({
      where: { redsysOrderId: result.merchantOrder },
    });

    if (!quote) {
      log.warn({ merchantOrder: result.merchantOrder }, "Quote not found for Redsys order");
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    if (result.isAuthorized) {
      // Payment successful (Ds_Response 0000-0099)
      await prisma.quote.update({
        where: { id: quote.id },
        data: {
          status: "pagado",
          paymentStatus: "paid",
          paymentMethod: "redsys",
          paidAt: new Date(),
          paymentRef: result.authCode,
        },
      });

      log.info(
        { quoteId: quote.id, authCode: result.authCode },
        "Payment confirmed via Redsys"
      );

      // Post-payment hooks will be wired up in CRM port (PORT-09):
      // - Create invoice (document numbering PORT-01)
      // - Send confirmation email (email templates PORT-02)
      // - Create REAV expedient
      // - Move GHL opportunity
    } else {
      // Payment failed
      await prisma.quote.update({
        where: { id: quote.id },
        data: { paymentStatus: "failed" },
      });

      log.warn(
        { quoteId: quote.id, responseCode: result.responseCode },
        "Payment failed via Redsys"
      );
    }

    // Redsys expects HTTP 200
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Internal error",
      code: "REDSYS_NOTIFICATION_ERROR",
    });
  }
}
