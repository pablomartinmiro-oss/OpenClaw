import { logger } from "@/lib/logger";

interface OcrResult {
  code: string | null;
  securityCode: string | null;
  customerName: string | null;
  confidence: "alta" | "media" | "baja" | "conflicto";
}

const OCR_PROMPT = `Extrae los datos de este cupon/voucher.
Devuelve SOLAMENTE JSON valido con estos campos:
- code (string|null): codigo del cupon (formato VS-XXXX-XXXX o similar)
- securityCode (string|null): codigo de seguridad
- customerName (string|null): nombre del cliente

Si no puedes leer un campo, usa null. NO inventes datos.
Responde SOLO con el JSON, sin texto adicional ni markdown.`;

/**
 * Use Claude API to extract coupon data from a voucher image.
 */
export async function extractCouponData(imageBase64: string): Promise<OcrResult> {
  const log = logger.child({ service: "ticketing-ocr" });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    log.warn("ANTHROPIC_API_KEY not configured — OCR unavailable");
    return { code: null, securityCode: null, customerName: null, confidence: "baja" };
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 512,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: "image/jpeg", data: imageBase64 },
              },
              { type: "text", text: OCR_PROMPT },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      log.error({ status: response.status, body: errText }, "Claude OCR API error");
      return { code: null, securityCode: null, customerName: null, confidence: "baja" };
    }

    const result = await response.json();
    const textContent = result.content?.find(
      (c: { type: string }) => c.type === "text"
    );

    if (!textContent?.text) {
      return { code: null, securityCode: null, customerName: null, confidence: "baja" };
    }

    const cleanJson = textContent.text
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();

    const parsed = JSON.parse(cleanJson) as {
      code?: string | null;
      securityCode?: string | null;
      customerName?: string | null;
    };

    // Score confidence based on how many fields were extracted
    const fields = [parsed.code, parsed.securityCode, parsed.customerName];
    const found = fields.filter(Boolean).length;

    let confidence: OcrResult["confidence"];
    if (found === 3) confidence = "alta";
    else if (found === 2) confidence = "media";
    else if (found === 1) confidence = "baja";
    else confidence = "conflicto";

    log.info({ found, confidence }, "OCR extraction complete");

    return {
      code: parsed.code ?? null,
      securityCode: parsed.securityCode ?? null,
      customerName: parsed.customerName ?? null,
      confidence,
    };
  } catch (error) {
    log.error({ err: error }, "OCR extraction failed");
    return { code: null, securityCode: null, customerName: null, confidence: "conflicto" };
  }
}
