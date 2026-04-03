export const dynamic = "force-dynamic";
/**
 * POST /api/onboarding/research
 *
 * Intelligent Client Analyzer: researches a company and generates
 * personalized intake questions + email copy in Spanish.
 */

import { NextResponse } from "next/server";
import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";

const log = logger.child({ route: "/api/onboarding/research" });

const INTAKE_FORM_URL = process.env.INTAKE_FORM_URL || "https://link.viddixai.com/onboarding";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ResearchRequest {
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  locationId?: string;
}

interface PersonalizedQuestion {
  question: string;
  context: string;
  type: "text" | "choice" | "scale";
  options?: string[];
}

interface CompanyResearch {
  industry: string;
  estimatedSize: string;
  currentTools: string[];
  painPoints: string[];
  opportunities: string[];
  competitors: string[];
  onlinePresence: {
    hasWebsite: boolean;
    likelyRunsAds: boolean;
    socialMedia: string[];
  };
}

interface ResearchResponse {
  companyResearch: CompanyResearch;
  personalizedQuestions: PersonalizedQuestion[];
  emailSubject: string;
  emailBody: string;
  whatsappMessage: string;
}

// ─── Claude prompt ────────────────────────────────────────────────────────────

const CLIENT_ANALYZER_SYSTEM_PROMPT = `You are the Client Analyzer for Viddix AI. You analyze businesses to understand their needs before asking them questions.

When given a company name and contact info, you will:
1. Identify what type of business this likely is based on the company name
2. Determine their industry, typical size, typical tools used by similar businesses
3. Identify the 3 most likely pain points for this type of business
4. Generate 8-10 highly personalized questions that:
   - Reference specifics about their industry
   - Skip questions you can already infer from context
   - Focus on their biggest likely bottlenecks
   - Use their industry's language (not generic CRM terms)
   - Are written in Spanish (Spain market)

EXAMPLES:
- For a padel club: ask about court utilization hours, membership tiers, instructor management, peak/valley hours
- For a ski school: ask about seasonal demand, group bookings, equipment rental, instructor schedules
- For a real estate agency: ask about lead sources, property types, follow-up process, buyer vs seller ratio
- For a restaurant: ask about reservation system, customer retention, delivery platforms, average ticket
- For a gym/fitness: ask about member retention, class scheduling, trainer management, drop-off rates
- For a tourism/experience company: ask about booking cycles, group sizes, seasonal patterns, cancellation rate

INTAKE DECISION RULES:
- Lead leakage detected → prioritize speed-to-lead questions
- No digital presence likely → ask about current lead tracking method
- Sports/leisure → ask about membership models and peak hours
- Tourism/seasonal → ask about booking cycles and peak season management
- Service business → ask about appointment scheduling and follow-up
- Real estate → ask about lead sources, qualification, and follow-up cadence
- Restaurant/F&B → ask about repeat customers, reservation platform, delivery channels

RESEARCH HEURISTICS:
- Company name with "Padel" or "Club" → sports facility, B2C, ~2-15 employees
- Company name with "Inmobiliaria" or "Real Estate" → real estate agency, B2C/B2B
- Company name with "Ski", "Snow", "Sierra" → winter sports, seasonal, tourism
- Company name with "Hotel", "Hostal" → hospitality, seasonal, B2C
- Company name with "Gym", "Fitness", "Sport" → fitness, membership-based
- Company name with "Clinic", "Medical", "Dental" → healthcare, appointment-based
- Company name with "Academy", "School", "Training" → education/training

OUTPUT FORMAT:
Return ONLY valid JSON with this exact structure (no markdown, no explanation):
{
  "industry": "...",
  "estimatedSize": "...",
  "currentTools": ["...", "..."],
  "painPoints": ["...", "...", "..."],
  "opportunities": ["...", "...", "..."],
  "competitors": ["...", "...", "..."],
  "onlinePresence": {
    "hasWebsite": true,
    "likelyRunsAds": false,
    "socialMedia": ["Instagram", "Facebook"]
  },
  "questions": [
    {
      "question": "pregunta personalizada en español",
      "context": "why we ask this (internal, in English)",
      "type": "text",
      "options": []
    }
  ],
  "emailSubject": "...",
  "emailIntro": "personalized 2-3 sentence intro in Spanish mentioning their specific business type and likely challenges"
}

For questions with type "choice", include non-empty "options" array.
For questions with type "scale", include "options": ["1", "2", "3", "4", "5"].
For questions with type "text", "options" can be empty array [].
Generate exactly 8-10 questions total.`;

// ─── Route handler ─────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const body: ResearchRequest = await req.json();
    const { companyName, contactName, email, phone, locationId } = body;

    if (!companyName || !contactName || !email) {
      return NextResponse.json(
        { error: "companyName, contactName, and email are required" },
        { status: 400 }
      );
    }

    log.info({ companyName, contactName, email }, "Starting company research");

    // Call Claude to research + generate questions
    const { text } = await generateText({
      model: anthropic("claude-sonnet-4-5"),
      system: CLIENT_ANALYZER_SYSTEM_PROMPT,
      prompt: `Analyze this company and generate personalized intake questions:

Company Name: ${companyName}
Contact Name: ${contactName}
Email: ${email}
Phone: ${phone || "not provided"}
GHL Location ID: ${locationId || "not provided"}

Based on the company name and any context clues, determine what type of business this is and generate highly personalized intake questions in Spanish.`,
      maxTokens: 3000,
      temperature: 0.3,
    });

    // Parse Claude's JSON response
    let parsed: {
      industry: string;
      estimatedSize: string;
      currentTools: string[];
      painPoints: string[];
      opportunities: string[];
      competitors: string[];
      onlinePresence: {
        hasWebsite: boolean;
        likelyRunsAds: boolean;
        socialMedia: string[];
      };
      questions: Array<{
        question: string;
        context: string;
        type: string;
        options?: string[];
      }>;
      emailSubject: string;
      emailIntro: string;
    };

    try {
      // Strip markdown code blocks if present
      const cleaned = text.replace(/^```(?:json)?\n?/m, "").replace(/\n?```$/m, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      log.error({ text }, "Failed to parse Claude JSON response");
      return NextResponse.json(
        { error: "Failed to parse AI response", raw: text },
        { status: 500 }
      );
    }

    // Build structured response
    const companyResearch: CompanyResearch = {
      industry: parsed.industry,
      estimatedSize: parsed.estimatedSize,
      currentTools: parsed.currentTools || [],
      painPoints: parsed.painPoints || [],
      opportunities: parsed.opportunities || [],
      competitors: parsed.competitors || [],
      onlinePresence: parsed.onlinePresence || {
        hasWebsite: true,
        likelyRunsAds: false,
        socialMedia: [],
      },
    };

    const personalizedQuestions: PersonalizedQuestion[] = (parsed.questions || []).map((q) => ({
      question: q.question,
      context: q.context,
      type: (q.type as "text" | "choice" | "scale") || "text",
      options: q.options && q.options.length > 0 ? q.options : undefined,
    }));

    // Build HTML email
    const emailBody = buildPersonalizedEmail({
      contactName,
      companyName,
      emailIntro: parsed.emailIntro,
      questions: personalizedQuestions,
      formUrl: INTAKE_FORM_URL,
    });

    // Build WhatsApp message
    const whatsappMessage = buildWhatsAppMessage({
      contactName,
      companyName,
      formUrl: INTAKE_FORM_URL,
    });

    const response: ResearchResponse = {
      companyResearch,
      personalizedQuestions,
      emailSubject: parsed.emailSubject || `Viddix AI × ${companyName} — Antes de empezar, necesitamos conocerte mejor`,
      emailBody,
      whatsappMessage,
    };

    log.info(
      {
        companyName,
        industry: companyResearch.industry,
        questionsGenerated: personalizedQuestions.length,
      },
      "Company research complete"
    );

    return NextResponse.json(response);
  } catch (error) {
    return apiError(error, {
      publicMessage: "Research endpoint failed",
      code: "RESEARCH_ERROR",
    });
  }
}

// ─── Email builder ────────────────────────────────────────────────────────────

function buildPersonalizedEmail({
  contactName,
  companyName,
  emailIntro,
  questions,
  formUrl,
}: {
  contactName: string;
  companyName: string;
  emailIntro: string;
  questions: PersonalizedQuestion[];
  formUrl: string;
}): string {
  const questionsHtml = questions
    .map((q, i) => {
      let inputHtml = "";

      if (q.type === "choice" && q.options && q.options.length > 0) {
        inputHtml = `<div style="margin-top: 8px;">
          ${q.options
            .map(
              (opt) =>
                `<label style="display: block; margin: 4px 0; cursor: pointer;">
              <input type="radio" name="q${i + 1}" value="${opt}" style="margin-right: 8px;" />
              ${opt}
            </label>`
            )
            .join("")}
        </div>`;
      } else if (q.type === "scale") {
        inputHtml = `<div style="margin-top: 8px; display: flex; gap: 8px; align-items: center;">
          <span style="font-size: 12px; color: #666;">Muy bajo</span>
          ${[1, 2, 3, 4, 5]
            .map(
              (n) =>
                `<label style="cursor: pointer; text-align: center;">
              <input type="radio" name="q${i + 1}" value="${n}" style="display: block; margin: 0 auto 4px;" />
              <span style="font-size: 13px;">${n}</span>
            </label>`
            )
            .join("")}
          <span style="font-size: 12px; color: #666;">Muy alto</span>
        </div>`;
      } else {
        inputHtml = `<textarea name="q${i + 1}" rows="2"
          style="width: 100%; margin-top: 8px; padding: 10px; border: 1px solid #e5e7eb;
                 border-radius: 6px; font-size: 14px; font-family: Arial, sans-serif;
                 resize: vertical; box-sizing: border-box;"
          placeholder="Tu respuesta aquí..."></textarea>`;
      }

      return `<div style="margin-bottom: 24px; padding: 16px; background: #f9fafb; border-radius: 8px; border-left: 3px solid #6366f1;">
        <p style="margin: 0 0 4px 0; font-weight: 600; font-size: 15px; color: #1a1a1a;">
          ${i + 1}. ${q.question}
        </p>
        ${inputHtml}
      </div>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px; color: #333; background: #ffffff;">

  <div style="text-align: center; margin-bottom: 32px;">
    <img src="https://viddixai.com/logo.png" alt="Viddix AI" style="height: 36px;" />
  </div>

  <h1 style="color: #1a1a1a; font-size: 22px; margin-bottom: 8px;">
    Hola ${contactName} 👋
  </h1>

  <p style="font-size: 15px; line-height: 1.7; color: #444; margin-bottom: 16px;">
    ${emailIntro}
  </p>

  <p style="font-size: 15px; line-height: 1.7; color: #444; margin-bottom: 8px;">
    Antes de configurar tu sistema, queremos entender bien cómo funciona <strong>${companyName}</strong>.
    Por eso hemos preparado unas preguntas específicas para tu tipo de negocio — no es un formulario genérico,
    sino preguntas que nos ayudarán a configurar exactamente lo que necesitáis.
  </p>

  <p style="font-size: 15px; line-height: 1.7; color: #444; margin-bottom: 24px;">
    <strong>Son 8-10 preguntas, tardarás unos 5 minutos.</strong> Cuanto más detalle nos des, mejor configuraremos tu sistema.
  </p>

  <div style="text-align: center; margin: 32px 0;">
    <a href="${formUrl}?company=${encodeURIComponent(companyName)}&contact=${encodeURIComponent(contactName)}"
       style="background: #6366f1; color: white; padding: 14px 36px; border-radius: 8px;
              text-decoration: none; font-size: 16px; font-weight: bold; display: inline-block;">
      Responder preguntas →
    </a>
  </div>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />

  <p style="font-size: 13px; color: #666; margin-bottom: 24px;">
    O si prefieres, también puedes responder directamente aquí abajo:
  </p>

  <div>
    ${questionsHtml}
  </div>

  <div style="text-align: center; margin: 32px 0;">
    <a href="${formUrl}?company=${encodeURIComponent(companyName)}&contact=${encodeURIComponent(contactName)}"
       style="background: #6366f1; color: white; padding: 14px 36px; border-radius: 8px;
              text-decoration: none; font-size: 16px; font-weight: bold; display: inline-block;">
      Enviar mis respuestas →
    </a>
  </div>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />

  <p style="font-size: 13px; color: #888; line-height: 1.6;">
    Una vez recibamos tus respuestas, nuestro equipo las analizará y tendrás tu sistema configurado
    en <strong>24-48 horas</strong>. Te enviaremos un email de confirmación con los próximos pasos.
  </p>

  <p style="font-size: 13px; color: #888;">
    ¿Alguna duda? Responde a este email o escríbenos a <a href="mailto:hola@viddixai.com" style="color: #6366f1;">hola@viddixai.com</a>
  </p>

  <p style="font-size: 13px; color: #888; margin-top: 16px;">
    Un saludo,<br />
    <strong>El equipo de Viddix AI</strong>
  </p>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
  <p style="font-size: 11px; color: #bbb; text-align: center;">
    Viddix AI · Tu sistema de automatización inteligente
  </p>

</body>
</html>`;
}

// ─── WhatsApp builder ─────────────────────────────────────────────────────────

function buildWhatsAppMessage({
  contactName,
  companyName,
  formUrl,
}: {
  contactName: string;
  companyName: string;
  formUrl: string;
}): string {
  return `Hola ${contactName} 👋 Soy del equipo de Viddix AI.

Acabamos de confirmar tu acceso y queremos configurar tu sistema lo antes posible.

Para hacerlo bien, necesitamos entender cómo funciona ${companyName}. Te hemos preparado unas preguntas específicas para tu negocio (son solo 5 minutos):

👉 ${formUrl}?company=${encodeURIComponent(companyName)}&contact=${encodeURIComponent(contactName)}

En cuanto las recibamos, lo tendrás todo listo en 24-48h. ¡Gracias!`;
}
