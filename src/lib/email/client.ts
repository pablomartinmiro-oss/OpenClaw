import type { AxiosError } from "axios";
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

  // GHL requires a conversationId — get or create one for this contact
  const conversation = await ghl.getOrCreateConversation(params.contactId);

  // conversationId goes in the URL; contactId is required in the body
  const requestBody = {
    type: "Email" as const,
    contactId: params.contactId,
    subject: params.subject,
    html: params.html,
    body: params.subject, // plain-text fallback
    emailFrom: EMAIL_FROM,
    emailTo: params.to,
    emailCc: EMAIL_CC,
    emailReplyTo: EMAIL_REPLY_TO,
  };

  log.info(
    {
      conversationId: conversation.id,
      contactId: params.contactId,
      type: requestBody.type,
      emailFrom: requestBody.emailFrom,
      emailTo: requestBody.emailTo,
      htmlLength: params.html.length,
      subject: params.subject,
    },
    "GHL sendMessage request — POST /conversations/{id}/messages"
  );

  try {
    const result = await ghl.sendMessage(conversation.id, requestBody);
    log.info(
      { messageId: result.id, conversationId: conversation.id },
      "Email sent via GHL"
    );
    return { messageId: result.id };
  } catch (err) {
    const axiosErr = err as AxiosError;
    const status = axiosErr.response?.status;
    const responseBody = axiosErr.response?.data
      ? JSON.stringify(axiosErr.response.data).substring(0, 500)
      : "";
    log.error(
      {
        status,
        responseBody,
        contactId: params.contactId,
        conversationId: conversation.id,
        requestType: requestBody.type,
        requestEmailFrom: requestBody.emailFrom,
        requestEmailTo: requestBody.emailTo,
        requestHtmlLength: params.html.length,
      },
      "GHL sendMessage failed — full response logged"
    );
    // Re-throw with enriched message so caller gets the GHL reason
    throw new Error(`GHL_${status ?? "ERR"}: ${responseBody || axiosErr.message}`);
  }
}
