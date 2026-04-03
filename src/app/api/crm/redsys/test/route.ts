export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { apiError } from "@/lib/api-response";
import { generateRedsysForm, generateOrderId } from "@/lib/redsys/client";

/**
 * GET /api/redsys/test
 * Generate a 1.00€ test payment form — returns full form data for inspection.
 * Auth required (Owner only).
 */
export async function GET() {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  // session used for auth gating; tenantId available as session.tenantId if needed
  const baseUrl = process.env.AUTH_URL ?? "https://crm-dash-prod.up.railway.app";
  const orderId = generateOrderId();

  try {
    const result = generateRedsysForm({
      orderId,
      amount: 1.0, // 1.00€ test payment
      description: "Test payment — 1.00 EUR",
      merchantUrl: `${baseUrl}/api/crm/webhooks/redsys`,
      urlOk: `${baseUrl}/presupuestos?payment=ok`,
      urlKo: `${baseUrl}/presupuestos?payment=ko`,
    });

    // Decode params so the caller can inspect every field
    const decodedParams = JSON.parse(
      Buffer.from(result.params.Ds_MerchantParameters, "base64").toString("utf8")
    );

    return NextResponse.json({
      orderId,
      formAction: result.url,
      formFields: result.params,
      decodedMerchantParams: decodedParams,
      htmlForm: [
        `<form method="POST" action="${result.url}">`,
        `  <input type="hidden" name="Ds_SignatureVersion" value="${result.params.Ds_SignatureVersion}" />`,
        `  <input type="hidden" name="Ds_MerchantParameters" value="${result.params.Ds_MerchantParameters}" />`,
        `  <input type="hidden" name="Ds_Signature" value="${result.params.Ds_Signature}" />`,
        `  <button type="submit">Pagar 1,00 €</button>`,
        `</form>`,
      ].join("\n"),
    });
  } catch (err) {
    return apiError(err, { publicMessage: "Failed to generate test form", code: "REDSYS_TEST_ERROR", logContext: { tenantId: session.tenantId } });
  }
}
