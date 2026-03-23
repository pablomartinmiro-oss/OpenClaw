import { Resend } from "resend";
import { logger } from "@/lib/logger";

const log = logger.child({ module: "email" });

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY ?? "");
  return _resend;
}

const EMAIL_FROM = process.env.EMAIL_FROM ?? "Skicenter <onboarding@resend.dev>";
const EMAIL_CC = process.env.EMAIL_CC ?? "";

interface SendEmailParams {
  tenantId: string;
  contactId: string | null; // kept for API compat — not used by Resend
  subject: string;
  html: string;
  to: string;
}

interface SendEmailResult {
  messageId?: string;
  skipped?: boolean;
  skipReason?: string;
}

export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  log.info({ to: params.to, subject: params.subject }, "Sending email via Resend");

  const { data, error } = await getResend().emails.send({
    from: EMAIL_FROM,
    to: params.to,
    ...(EMAIL_CC ? { cc: EMAIL_CC } : {}),
    subject: params.subject,
    html: params.html,
  });

  if (error) {
    log.error({ error, to: params.to }, "Resend email failed");
    throw new Error(`RESEND_ERROR: ${error.message}`);
  }

  log.info({ messageId: data?.id, to: params.to }, "Email sent via Resend");
  return { messageId: data?.id ?? undefined };
}
