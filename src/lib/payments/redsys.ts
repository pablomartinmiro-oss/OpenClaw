/**
 * Redsys Payment Service — OpenClaw
 *
 * Complete Redsys integration with:
 * - 3DES key derivation per order
 * - HMAC-SHA256 signature generation and verification
 * - Environment-based URL (test/production)
 * - Timing-safe signature comparison
 * - Merchant order generation
 *
 * Ported from Nayade, enhanced with timing-safe comparison.
 * Reference: https://pagosonline.redsys.es/conexion-redireccion.html
 */

import { createCipheriv, createHmac, timingSafeEqual } from "node:crypto";
import { logger } from "@/lib/logger";

const log = logger.child({ module: "redsys" });

// ─── Configuration ───────────────────────────────────────────────────────────

const REDSYS_URLS = {
  test: "https://sis-t.redsys.es:25443/sis/realizarPago",
  production: "https://sis.redsys.es/sis/realizarPago",
};

const CURRENCY_EUR = "978";
const TRANSACTION_TYPE = "0"; // Standard authorization
const SIGNATURE_VERSION = "HMAC_SHA256_V1";

function getRedsysUrl(): string {
  const env = process.env.REDSYS_ENVIRONMENT ?? "test";
  return env === "production" ? REDSYS_URLS.production : REDSYS_URLS.test;
}

function getConfig() {
  const merchantCode = process.env.REDSYS_MERCHANT_CODE;
  const secretKey = process.env.REDSYS_MERCHANT_KEY ?? process.env.REDSYS_SECRET_KEY;
  const rawTerminal = process.env.REDSYS_MERCHANT_TERMINAL ?? process.env.REDSYS_TERMINAL ?? "1";
  const terminal = rawTerminal.padStart(3, "0");

  if (!merchantCode || !secretKey) {
    throw new Error("REDSYS_MERCHANT_CODE and REDSYS_MERCHANT_KEY must be set");
  }

  return { merchantCode, terminal, secretKey };
}

// ─── Cryptography ────────────────────────────────────────────────────────────

/**
 * Derive per-order signing key using 3DES-CBC.
 * Padding the order to 8 bytes with zeros as per Redsys spec.
 */
function deriveKey(merchantOrder: string, masterKey: Buffer): Buffer {
  const orderBuffer = Buffer.alloc(8, 0);
  Buffer.from(merchantOrder, "utf8").copy(orderBuffer);

  const iv = Buffer.alloc(8, 0);
  const cipher = createCipheriv("des-ede3-cbc", masterKey, iv);
  cipher.setAutoPadding(false);
  return Buffer.concat([cipher.update(orderBuffer), cipher.final()]);
}

/**
 * Generate HMAC-SHA256 signature.
 */
function signParams(merchantParamsB64: string, orderKey: Buffer): string {
  return createHmac("sha256", orderKey).update(merchantParamsB64).digest("base64");
}

// ─── Payment Form Generation ─────────────────────────────────────────────────

export interface RedsysPaymentParams {
  /** Amount in cents (100 = 1.00 EUR) */
  amountCents: number;
  /** Unique 12-char order reference */
  merchantOrder: string;
  /** Product/service description (max 125 chars) */
  productDescription: string;
  /** IPN callback URL (backend) */
  notifyUrl: string;
  /** Redirect on success (frontend) */
  okUrl: string;
  /** Redirect on failure (frontend) */
  koUrl: string;
  /** Cardholder name (optional, max 60 chars) */
  holderName?: string;
}

export interface RedsysFormData {
  url: string;
  Ds_SignatureVersion: string;
  Ds_MerchantParameters: string;
  Ds_Signature: string;
}

/**
 * Generate Redsys payment form data.
 * Amount MUST be in integer cents — no floats allowed.
 */
export function buildRedsysForm(params: RedsysPaymentParams): RedsysFormData {
  const { merchantCode, terminal, secretKey } = getConfig();

  const merchantData: Record<string, string> = {
    DS_MERCHANT_AMOUNT: String(params.amountCents),
    DS_MERCHANT_ORDER: params.merchantOrder,
    DS_MERCHANT_MERCHANTCODE: merchantCode,
    DS_MERCHANT_CURRENCY: CURRENCY_EUR,
    DS_MERCHANT_TRANSACTIONTYPE: TRANSACTION_TYPE,
    DS_MERCHANT_TERMINAL: terminal,
    DS_MERCHANT_MERCHANTURL: params.notifyUrl,
    DS_MERCHANT_URLOK: params.okUrl,
    DS_MERCHANT_URLKO: params.koUrl,
    DS_MERCHANT_PRODUCTDESCRIPTION: params.productDescription.slice(0, 125),
  };

  if (params.holderName) {
    merchantData.DS_MERCHANT_TITULAR = params.holderName.slice(0, 60);
  }

  const merchantParamsJson = JSON.stringify(merchantData);
  const merchantParamsB64 = Buffer.from(merchantParamsJson).toString("base64");

  const decodedKey = Buffer.from(secretKey, "base64");
  const orderKey = deriveKey(params.merchantOrder, decodedKey);
  const signature = signParams(merchantParamsB64, orderKey);

  log.info(
    {
      merchantOrder: params.merchantOrder,
      amountCents: params.amountCents,
      url: getRedsysUrl(),
    },
    "Redsys form generated"
  );

  return {
    url: getRedsysUrl(),
    Ds_SignatureVersion: SIGNATURE_VERSION,
    Ds_MerchantParameters: merchantParamsB64,
    Ds_Signature: signature,
  };
}

// ─── IPN Notification Validation ─────────────────────────────────────────────

export interface RedsysNotificationData {
  isValid: boolean;
  isAuthorized: boolean;
  merchantOrder: string;
  responseCode: string;
  amount: number;
  authCode: string;
  rawData: Record<string, string>;
}

/**
 * Validate Redsys IPN notification using timing-safe comparison.
 * NEVER mark a reservation as paid without passing through this.
 */
export function validateRedsysNotification(params: {
  Ds_SignatureVersion: string;
  Ds_MerchantParameters: string;
  Ds_Signature: string;
}): RedsysNotificationData {
  const { Ds_MerchantParameters, Ds_Signature } = params;

  let rawData: Record<string, string> = {};
  try {
    const decoded = Buffer.from(Ds_MerchantParameters, "base64").toString("utf8");
    rawData = JSON.parse(decoded);
  } catch {
    return {
      isValid: false,
      isAuthorized: false,
      merchantOrder: "",
      responseCode: "",
      amount: 0,
      authCode: "",
      rawData: {},
    };
  }

  const merchantOrder = rawData.Ds_Order ?? rawData.DS_MERCHANT_ORDER ?? "";

  try {
    const { secretKey } = getConfig();
    const decodedKey = Buffer.from(secretKey, "base64");
    const orderKey = deriveKey(merchantOrder, decodedKey);
    const expectedSignature = signParams(Ds_MerchantParameters, orderKey);

    // Normalize: Redsys may send url-safe base64 (- instead of +, _ instead of /)
    const normalizedReceived = Ds_Signature.replace(/-/g, "+").replace(/_/g, "/");

    // Timing-safe comparison
    let isValid = false;
    try {
      isValid = timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(normalizedReceived)
      );
    } catch {
      isValid = false;
    }

    const responseCode = rawData.Ds_Response ?? "";
    const responseNum = parseInt(responseCode, 10);
    const isAuthorized = isValid && !isNaN(responseNum) && responseNum >= 0 && responseNum <= 99;

    if (!isValid) {
      log.warn(
        { merchantOrder, expected: expectedSignature.slice(0, 20) },
        "Redsys signature verification failed"
      );
    }

    return {
      isValid,
      isAuthorized,
      merchantOrder,
      responseCode,
      amount: parseInt(rawData.Ds_Amount ?? "0", 10),
      authCode: rawData.Ds_AuthorisationCode ?? "",
      rawData,
    };
  } catch (err) {
    log.error({ err }, "Failed to validate Redsys notification");
    return {
      isValid: false,
      isAuthorized: false,
      merchantOrder,
      responseCode: "",
      amount: 0,
      authCode: "",
      rawData,
    };
  }
}

// ─── Order ID Generation ─────────────────────────────────────────────────────

/**
 * Generate a unique 12-character merchant order ID.
 * First 4+ characters MUST be numeric (Redsys requirement).
 */
export function generateMerchantOrder(): string {
  const numeric = String(Date.now()).slice(-6);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let rand = "";
  for (let i = 0; i < 6; i++) {
    rand += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${numeric}${rand}`.slice(0, 12);
}
