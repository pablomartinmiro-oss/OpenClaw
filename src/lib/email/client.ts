import nodemailer from "nodemailer";
import dns from "dns";
import { logger } from "@/lib/logger";

const log = logger.child({ module: "email" });

function createTransporter() {
  const host = process.env.SMTP_HOST ?? "skicenter-es.correoseguro.dinaserver.com";
  const port = parseInt(process.env.SMTP_PORT ?? "587");
  // SMTP_SECURE=true → SSL on 465. Default false → STARTTLS on 587 (Railway-safe)
  const secure = process.env.SMTP_SECURE === "true";

  log.info({ host, port, secure }, "Creating SMTP transporter");

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER ?? "reservas@skicenter.es",
      pass: process.env.SMTP_PASS ?? "",
    },
    tls: {
      rejectUnauthorized: false, // Allow self-signed certs (Dinahosting)
    },
    connectionTimeout: 10_000,
    greetingTimeout: 5_000,
    socketTimeout: 10_000,
  });
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  cc?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
}

export async function sendEmail(
  params: SendEmailParams
): Promise<{ messageId: string }> {
  const from = process.env.SMTP_FROM ?? "Skicenter <reservas@skicenter.es>";
  const host = process.env.SMTP_HOST ?? "skicenter-es.correoseguro.dinaserver.com";

  // DNS diagnostic — log resolved IP to verify hostname is reachable
  try {
    const resolved = await dns.promises.lookup(host);
    log.info({ host, ip: resolved.address }, "SMTP host DNS resolved");
  } catch (dnsErr) {
    log.warn({ host, error: dnsErr }, "SMTP host DNS lookup failed — host may be unreachable");
  }

  log.info({ to: params.to, subject: params.subject }, "Sending email");

  const transporter = createTransporter();

  try {
    const info = await transporter.sendMail({
      from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      cc: params.cc,
      replyTo: params.replyTo ?? "reservas@skicenter.es",
      attachments: params.attachments,
    });

    log.info({ messageId: info.messageId, to: params.to }, "Email sent successfully");
    return { messageId: info.messageId };
  } catch (error) {
    log.error({ error, to: params.to }, "Failed to send email");
    throw error;
  }
}
