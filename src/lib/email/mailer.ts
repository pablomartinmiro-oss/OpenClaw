/**
 * Email Sending Service
 *
 * Dual-strategy: Brevo HTTP API (preferred in cloud) + Nodemailer SMTP fallback.
 * Railway blocks outbound SMTP (465/587), so Brevo API is always primary.
 *
 * Env vars:
 *   BREVO_API_KEY — Brevo API key (preferred)
 *   SMTP_FROM — sender address, e.g. "OpenClaw <noreply@openclaw.com>"
 *   SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS — SMTP fallback
 */

import { logger } from "@/lib/logger";

const log = logger.child({ module: "mailer" });

export interface MailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  cc?: string | string[];
}

export interface MailResult {
  success: boolean;
  provider: "brevo" | "smtp" | "none";
  messageId?: string;
  error?: string;
}

function parseSender(raw: string): { name: string; email: string } {
  const match = raw.match(/^(.+?)\s*<(.+?)>$/);
  if (match) return { name: match[1].trim(), email: match[2].trim() };
  return { name: "OpenClaw", email: raw.trim() };
}

/**
 * Send an email via Brevo HTTP API.
 */
async function sendViaBrevo(params: MailParams): Promise<MailResult> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return { success: false, provider: "none", error: "No BREVO_API_KEY" };

  const fromRaw = params.from ?? process.env.SMTP_FROM ?? "OpenClaw <noreply@openclaw.com>";
  const sender = parseSender(fromRaw);
  const toList = Array.isArray(params.to)
    ? params.to.map((e) => ({ email: e }))
    : [{ email: params.to }];
  const ccList = params.cc
    ? (Array.isArray(params.cc) ? params.cc : [params.cc]).map((e) => ({ email: e }))
    : undefined;

  const body = {
    sender,
    to: toList,
    subject: params.subject,
    htmlContent: params.html,
    ...(params.text ? { textContent: params.text } : {}),
    ...(ccList ? { cc: ccList } : {}),
  };

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const json = (await res.json()) as { messageId?: string };
      log.info(
        { to: params.to, messageId: json.messageId },
        "Email sent via Brevo"
      );
      return { success: true, provider: "brevo", messageId: json.messageId };
    }

    const errText = await res.text();
    log.error({ status: res.status, body: errText }, "Brevo API error");
    return { success: false, provider: "brevo", error: errText };
  } catch (err) {
    log.error({ err }, "Brevo API request failed");
    return {
      success: false,
      provider: "brevo",
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Send an email via SMTP (Nodemailer).
 * Only works if SMTP env vars are set and port is not blocked.
 */
async function sendViaSMTP(params: MailParams): Promise<MailResult> {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    return { success: false, provider: "none", error: "SMTP not configured" };
  }

  try {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.default.createTransport({
      host,
      port: parseInt(port, 10),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user, pass },
    });

    const from = params.from ?? process.env.SMTP_FROM ?? `OpenClaw <${user}>`;

    const info = await transporter.sendMail({
      from,
      to: Array.isArray(params.to) ? params.to.join(", ") : params.to,
      cc: params.cc
        ? Array.isArray(params.cc) ? params.cc.join(", ") : params.cc
        : undefined,
      subject: params.subject,
      html: params.html,
      text: params.text,
    });

    log.info(
      { to: params.to, messageId: info.messageId },
      "Email sent via SMTP"
    );
    return { success: true, provider: "smtp", messageId: info.messageId };
  } catch (err) {
    log.error({ err }, "SMTP send failed");
    return {
      success: false,
      provider: "smtp",
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Send an email using the best available provider.
 * Tries Brevo first, falls back to SMTP.
 */
export async function sendEmail(params: MailParams): Promise<MailResult> {
  // Try Brevo first
  const brevoResult = await sendViaBrevo(params);
  if (brevoResult.success) return brevoResult;

  // Fallback to SMTP
  const smtpResult = await sendViaSMTP(params);
  if (smtpResult.success) return smtpResult;

  log.error(
    { to: params.to, subject: params.subject },
    "All email providers failed"
  );
  return {
    success: false,
    provider: "none",
    error: `Brevo: ${brevoResult.error}; SMTP: ${smtpResult.error}`,
  };
}
