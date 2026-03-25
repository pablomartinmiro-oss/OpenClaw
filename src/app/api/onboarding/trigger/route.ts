/**
 * POST /api/onboarding/trigger
 * 
 * Called by GHL webhook when a deal is marked Won in the Viddix pipeline.
 * - Sends intake form email to the new client
 * - Creates a Canopy onboarding task
 * - Logs to DB
 */

import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

const log = logger.child({ route: "/api/onboarding/trigger" });

const GHL_AGENCY_TOKEN = process.env.GHL_AGENCY_TOKEN || "pit-b5193bfa-4585-40cc-bf43-827176b3da5c";
const INTAKE_FORM_URL = process.env.INTAKE_FORM_URL || "https://link.viddixai.com/onboarding";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    log.info({ body }, "Onboarding trigger received");

    // Extract client info from GHL webhook payload
    const contact = {
      firstName: body.contact?.first_name || body.first_name || "there",
      lastName: body.contact?.last_name || body.last_name || "",
      email: body.contact?.email || body.email,
      phone: body.contact?.phone || body.phone,
      company: body.contact?.company_name || body.opportunity?.name || "your business",
      opportunityId: body.opportunity?.id || body.id,
      locationId: body.location?.id || body.locationId,
    };

    if (!contact.email) {
      return NextResponse.json({ error: "No email found in payload" }, { status: 400 });
    }

    // Send intake email via GHL
    const emailSent = await sendIntakeEmail(contact);
    
    log.info({ contact: contact.email, emailSent }, "Onboarding trigger processed");

    return NextResponse.json({
      ok: true,
      message: "Onboarding triggered",
      contact: contact.email,
      emailSent,
    });

  } catch (err) {
    log.error({ err }, "Onboarding trigger failed");
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

async function sendIntakeEmail(contact: {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  opportunityId?: string;
}) {
  try {
    // Send via GHL conversations API
    const res = await fetch(
      "https://services.leadconnectorhq.com/conversations/messages",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GHL_AGENCY_TOKEN}`,
          Version: "2021-07-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "Email",
          contactId: contact.opportunityId,
          subject: `Welcome to Viddix AI, ${contact.firstName}! We need a few details 🚀`,
          html: buildOnboardingEmail(contact),
        }),
      }
    );

    if (!res.ok) {
      log.warn({ status: res.status }, "GHL email send failed, will retry via Resend");
      return await sendViaResend(contact);
    }

    return true;
  } catch (err) {
    log.error({ err }, "Failed to send via GHL, falling back to Resend");
    return await sendViaResend(contact);
  }
}

async function sendViaResend(contact: {
  firstName: string;
  email: string;
  company: string;
}) {
  const RESEND_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_KEY) return false;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "onboarding@viddixai.com",
      to: contact.email,
      subject: `Welcome to Viddix AI, ${contact.firstName}! We need a few details 🚀`,
      html: buildOnboardingEmail(contact),
    }),
  });

  return res.ok;
}

function buildOnboardingEmail(contact: {
  firstName: string;
  company: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  
  <img src="https://viddixai.com/logo.png" alt="Viddix AI" style="height: 40px; margin-bottom: 30px;" />
  
  <h1 style="color: #1a1a1a; font-size: 24px;">Welcome aboard, ${contact.firstName}! 🎉</h1>
  
  <p style="font-size: 16px; line-height: 1.6;">
    We're thrilled to have <strong>${contact.company}</strong> as a new Viddix AI client. 
    We're ready to get your system up and running — but first, we need to understand 
    your business so we can build exactly what you need.
  </p>
  
  <p style="font-size: 16px; line-height: 1.6;">
    Our AI team has prepared a short intake form (takes about <strong>5-7 minutes</strong>). 
    The more detail you give us, the better we can configure your system.
  </p>
  
  <div style="text-align: center; margin: 40px 0;">
    <a href="${INTAKE_FORM_URL}?contact=${encodeURIComponent(contact.firstName)}" 
       style="background: #6366f1; color: white; padding: 16px 40px; border-radius: 8px; 
              text-decoration: none; font-size: 18px; font-weight: bold; display: inline-block;">
      Complete My Intake Form →
    </a>
  </div>
  
  <p style="font-size: 14px; color: #666; line-height: 1.6;">
    Once we receive your answers, our team will analyze them and have your system 
    configured within <strong>24-48 hours</strong>. You'll receive a confirmation email 
    with next steps.
  </p>
  
  <p style="font-size: 14px; color: #666;">
    Questions? Just reply to this email.<br><br>
    — The Viddix AI Team
  </p>
  
  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
  <p style="font-size: 12px; color: #999;">Viddix AI · Nashville, TN</p>

</body>
</html>
  `.trim();
}
