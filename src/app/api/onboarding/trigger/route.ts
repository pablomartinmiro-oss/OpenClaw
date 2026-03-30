/**
 * POST /api/onboarding/trigger
 *
 * Called by GHL webhook when a deal is marked Won in the Viddix pipeline.
 * - Researches the company using the Client Analyzer (/api/onboarding/research)
 * - Sends a personalized intake email to the new client
 * - Logs to DB
 */

import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

const log = logger.child({ route: "/api/onboarding/trigger" });

const GHL_AGENCY_TOKEN =
  process.env.GHL_AGENCY_TOKEN || "pit-b5193bfa-4585-40cc-bf43-827176b3da5c";

// Internal base URL for calling our own research endpoint
const APP_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.APP_BASE_URL ||
  "http://localhost:3000";

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
      company:
        body.contact?.company_name ||
        body.opportunity?.name ||
        body.company_name ||
        "tu empresa",
      opportunityId: body.opportunity?.id || body.id,
      locationId: body.location?.id || body.locationId,
    };

    if (!contact.email) {
      return NextResponse.json(
        { error: "No email found in payload" },
        { status: 400 }
      );
    }

    const contactName = `${contact.firstName} ${contact.lastName}`.trim();

    log.info(
      { company: contact.company, email: contact.email },
      "Researching company before sending onboarding email"
    );

    // Step 1: Research the company and generate personalized questions
    let emailSubject: string;
    let emailBody: string;
    let whatsappMessage: string;
    let researchData: unknown = null;

    try {
      const researchRes = await fetch(
        `${APP_BASE_URL}/api/onboarding/research`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companyName: contact.company,
            contactName,
            email: contact.email,
            phone: contact.phone,
            locationId: contact.locationId,
          }),
          // 20s timeout — research call uses AI
          signal: AbortSignal.timeout(20_000),
        }
      );

      if (researchRes.ok) {
        const research = await researchRes.json();
        researchData = research;
        emailSubject = research.emailSubject;
        emailBody = research.emailBody;
        whatsappMessage = research.whatsappMessage;

        log.info(
          {
            industry: research.companyResearch?.industry,
            questions: research.personalizedQuestions?.length,
          },
          "Research complete — using personalized email"
        );
      } else {
        log.warn(
          { status: researchRes.status },
          "Research endpoint returned error, falling back to generic email"
        );
        const fallback = buildFallbackEmail(contactName, contact.company);
        emailSubject = fallback.subject;
        emailBody = fallback.body;
        whatsappMessage = fallback.whatsapp;
      }
    } catch (researchErr) {
      log.warn(
        { err: researchErr },
        "Research call failed (timeout/network), falling back to generic email"
      );
      const fallback = buildFallbackEmail(contactName, contact.company);
      emailSubject = fallback.subject;
      emailBody = fallback.body;
      whatsappMessage = fallback.whatsapp;
    }

    // Step 2: Send personalized email
    const emailSent = await sendEmail({
      contactId: contact.opportunityId,
      email: contact.email,
      subject: emailSubject,
      html: emailBody,
    });

    log.info(
      { contact: contact.email, emailSent, hasResearch: !!researchData },
      "Onboarding trigger processed"
    );

    return NextResponse.json({
      ok: true,
      message: "Onboarding triggered",
      contact: contact.email,
      emailSent,
      personalized: !!researchData,
      research: researchData,
    });
  } catch (err) {
    log.error({ err }, "Onboarding trigger failed");
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// ─── Email sending ─────────────────────────────────────────────────────────

async function sendEmail({
  contactId,
  email,
  subject,
  html,
}: {
  contactId?: string;
  email: string;
  subject: string;
  html: string;
}) {
  try {
    // Try GHL first
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
          contactId,
          subject,
          html,
        }),
      }
    );

    if (!res.ok) {
      log.warn({ status: res.status }, "GHL email send failed, trying Resend");
      return await sendViaResend({ email, subject, html });
    }

    return true;
  } catch (err) {
    log.error({ err }, "GHL send failed, falling back to Resend");
    return await sendViaResend({ email, subject, html });
  }
}

async function sendViaResend({
  email,
  subject,
  html,
}: {
  email: string;
  subject: string;
  html: string;
}) {
  const RESEND_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_KEY) {
    log.warn("No RESEND_API_KEY configured");
    return false;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "onboarding@viddixai.com",
      to: email,
      subject,
      html,
    }),
  });

  return res.ok;
}

// ─── Fallback email ───────────────────────────────────────────────────────────

function buildFallbackEmail(
  contactName: string,
  company: string
): { subject: string; body: string; whatsapp: string } {
  const INTAKE_FORM_URL =
    process.env.INTAKE_FORM_URL || "https://link.viddixai.com/onboarding";

  return {
    subject: `Viddix AI × ${company} — Antes de empezar, necesitamos conocerte mejor`,
    body: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <h1 style="color: #1a1a1a; font-size: 22px;">Hola ${contactName} 👋</h1>
  <p style="font-size: 15px; line-height: 1.7; color: #444;">
    Estamos listos para configurar el sistema de <strong>${company}</strong>. 
    Antes de empezar, necesitamos entender mejor vuestro negocio para hacer una configuración a medida.
  </p>
  <p style="font-size: 15px; line-height: 1.7; color: #444;">
    El proceso de onboarding tarda solo <strong>5-7 minutos</strong>. Cuanto más detalle nos des, mejor configuraremos tu sistema.
  </p>
  <div style="text-align: center; margin: 32px 0;">
    <a href="${INTAKE_FORM_URL}?company=${encodeURIComponent(company)}&contact=${encodeURIComponent(contactName)}"
       style="background: #6366f1; color: white; padding: 14px 36px; border-radius: 8px; 
              text-decoration: none; font-size: 16px; font-weight: bold; display: inline-block;">
      Completar formulario de onboarding →
    </a>
  </div>
  <p style="font-size: 13px; color: #888;">
    Una vez recibamos tus respuestas, lo tendrás todo listo en 24-48h.<br/><br/>
    — El equipo de Viddix AI
  </p>
</body>
</html>`,
    whatsapp: `Hola ${contactName} 👋 Soy del equipo de Viddix AI. Para configurar tu sistema de ${company} necesitamos que completes este formulario (5 min): ${INTAKE_FORM_URL}`,
  };
}
