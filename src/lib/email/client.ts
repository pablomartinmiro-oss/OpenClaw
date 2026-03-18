import { getGHLClient } from "@/lib/ghl/api";
import { logger } from "@/lib/logger";

const log = logger.child({ module: "email" });

const EMAIL_FROM = "Skicenter <reservas@skicenter.es>";
const EMAIL_REPLY_TO = "reservas@skicenter.es";
const EMAIL_CC = ["reservas@skicenter.es"];

interface SendEmailParams {
  tenantId: string;
  contactId: string | null; // GHL contact ID — null skips sending
  subject: string;
  html: string;
  to: string; // used only for logging
}

interface SendEmailResult {
  messageId?: string;
  skipped?: boolean;
  skipReason?: string;
}

export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  if (!params.contactId) {
    log.warn(
      { to: params.to, subject: params.subject },
      "Email skipped — no GHL contactId on quote"
    );
    return { skipped: true, skipReason: "no_contact_id" };
  }

  log.info(
    { contactId: params.contactId, to: params.to, subject: params.subject },
    "Sending email via GHL"
  );

  const ghl = await getGHLClient(params.tenantId);

  const result = await ghl.sendMessage({
    type: "Email",
    contactId: params.contactId,
    subject: params.subject,
    html: params.html,
    body: params.subject, // GHL uses body as plain-text fallback
    emailFrom: EMAIL_FROM,
    emailTo: params.to,
    emailCc: EMAIL_CC,
    emailReplyTo: EMAIL_REPLY_TO,
  });

  log.info(
    { messageId: result.id, contactId: params.contactId },
    "Email sent via GHL"
  );

  return { messageId: result.id };
}
