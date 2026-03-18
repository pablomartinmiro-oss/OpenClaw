import nodemailer from "nodemailer";
import { logger } from "@/lib/logger";

const log = logger.child({ module: "email" });

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "skicenter-es.correoseguro.dinaserver.com",
  port: parseInt(process.env.SMTP_PORT ?? "465"),
  secure: true,
  auth: {
    user: process.env.SMTP_USER ?? "reservas@skicenter.es",
    pass: process.env.SMTP_PASS ?? "",
  },
});

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
  const from =
    process.env.SMTP_FROM ?? "Skicenter <reservas@skicenter.es>";

  log.info(
    { to: params.to, subject: params.subject },
    "Sending email"
  );

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

    log.info(
      { messageId: info.messageId, to: params.to },
      "Email sent successfully"
    );

    return { messageId: info.messageId };
  } catch (error) {
    log.error({ error, to: params.to }, "Failed to send email");
    throw error;
  }
}
