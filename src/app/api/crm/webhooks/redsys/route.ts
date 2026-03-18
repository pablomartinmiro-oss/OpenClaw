import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { verifyRedsysSignature } from "@/lib/redsys/client";
import { sendEmail } from "@/lib/email/client";
import { buildConfirmationEmailHTML } from "@/lib/email/templates";

const log = logger.child({ route: "/api/crm/webhooks/redsys" });

/**
 * PUBLIC endpoint — no auth required.
 * Receives Redsys payment notifications (POST form-encoded).
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const signatureVersion = formData.get("Ds_SignatureVersion") as string;
    const merchantParameters = formData.get("Ds_MerchantParameters") as string;
    const signature = formData.get("Ds_Signature") as string;

    if (!signatureVersion || !merchantParameters || !signature) {
      log.warn("Missing Redsys parameters");
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 }
      );
    }

    // Verify signature
    const { valid, data } = verifyRedsysSignature({
      Ds_SignatureVersion: signatureVersion,
      Ds_MerchantParameters: merchantParameters,
      Ds_Signature: signature,
    });

    if (!valid || !data) {
      log.warn("Invalid Redsys signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 403 }
      );
    }

    const orderId = data.Ds_Order;
    const responseCode = parseInt(data.Ds_Response, 10);
    const authCode = data.Ds_AuthorisationCode;

    log.info(
      { orderId, responseCode, authCode },
      "Redsys notification received"
    );

    // Find quote by redsysOrderId
    const quote = await prisma.quote.findUnique({
      where: { redsysOrderId: orderId },
      include: { items: true },
    });

    if (!quote) {
      log.warn({ orderId }, "Quote not found for Redsys order");
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    // Payment successful if Ds_Response < 100
    if (responseCode < 100) {
      await prisma.quote.update({
        where: { id: quote.id },
        data: {
          status: "pagado",
          paymentStatus: "paid",
          paymentMethod: "redsys",
          paidAt: new Date(),
          paymentRef: authCode,
        },
      });

      log.info(
        { quoteId: quote.id, orderId, authCode },
        "Payment confirmed"
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
            paymentRef: authCode,
          });

          await sendEmail({
            tenantId: quote.tenantId,
            contactId: quote.ghlContactId ?? null,
            to: quote.clientEmail,
            subject: `Pago confirmado — Presupuesto ${quoteNumber}`,
            html,
          });
        } catch (emailError) {
          log.error(
            { error: emailError, quoteId: quote.id },
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
    } else {
      // Payment failed
      await prisma.quote.update({
        where: { id: quote.id },
        data: {
          paymentStatus: "failed",
        },
      });

      log.warn(
        { quoteId: quote.id, orderId, responseCode },
        "Payment failed"
      );
    }

    // Redsys expects 200 OK
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    log.error({ error }, "Error processing Redsys webhook");
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
