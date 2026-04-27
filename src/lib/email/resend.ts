import { Resend } from "resend";
import { logger } from "@/lib/logger";

const log = logger.child({ module: "resend" });

let _client: Resend | null = null;

function getResend(): Resend {
  if (!_client) _client = new Resend(process.env.RESEND_API_KEY ?? "");
  return _client;
}

export const DEFAULT_FROM = "Skicenter <no-reply@skicenter.es>";

export interface SendEmailOpts {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
}

export async function sendEmail(opts: SendEmailOpts): Promise<{ id?: string }> {
  const resend = getResend();

  const { data, error } = await resend.emails.send({
    from: opts.from ?? DEFAULT_FROM,
    to: Array.isArray(opts.to) ? opts.to : [opts.to],
    subject: opts.subject,
    html: opts.html,
    ...(opts.replyTo ? { replyTo: opts.replyTo } : {}),
    ...(opts.cc ? { cc: Array.isArray(opts.cc) ? opts.cc : [opts.cc] } : {}),
  });

  if (error) {
    log.error({ error, to: opts.to, subject: opts.subject }, "Resend API error");
    throw new Error(`RESEND_ERROR: ${error.message}`);
  }

  log.info({ id: data?.id, to: opts.to }, "Email sent via Resend");
  return { id: data?.id ?? undefined };
}
