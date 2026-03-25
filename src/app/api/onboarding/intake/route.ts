/**
 * POST /api/onboarding/intake
 * 
 * Called by GHL form webhook when client submits the intake form.
 * - Runs Client Analyzer logic
 * - Produces a structured client brief
 * - Creates Canopy issue for Builder agent
 */

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { logger } from "@/lib/logger";

const log = logger.child({ route: "/api/onboarding/intake" });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    log.info("Intake form received");

    // Extract form responses from GHL webhook
    const responses = extractFormResponses(body);
    
    // Run Client Analyzer
    const brief = await analyzeClient(responses);
    
    // Post to Canopy as an issue
    await createCanopyBrief(brief, responses);

    return NextResponse.json({ ok: true, brief });

  } catch (err) {
    log.error({ err }, "Intake processing failed");
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

function extractFormResponses(body: Record<string, unknown>) {
  // GHL form submission format
  const fields = (body.formData || body.fields || body) as Record<string, string>;
  return {
    contactName: String(fields.name || fields.first_name || "Unknown"),
    email: String(fields.email || ""),
    company: String(fields.company || fields.company_name || ""),
    businessDescription: String(fields.business_description || fields.q1 || ""),
    industry: String(fields.industry || fields.q2 || ""),
    teamSize: String(fields.team_size || fields.q3 || ""),
    yearsInBusiness: String(fields.years_in_business || fields.q4 || ""),
    idealCustomer: String(fields.ideal_customer || fields.q5 || ""),
    leadSources: String(fields.lead_sources || fields.q6 || ""),
    avgSaleValue: String(fields.avg_sale_value || fields.q7 || ""),
    monthlyClients: String(fields.monthly_clients || fields.q8 || ""),
    growthBlocker: String(fields.growth_blocker || fields.q9 || ""),
    unconvertedLeads: String(fields.unconverted_leads || fields.q10 || ""),
    paidAds: String(fields.paid_ads || fields.q11 || ""),
    currentCRM: String(fields.current_crm || fields.q12 || ""),
    successVision: String(fields.success_vision || fields.q13 || ""),
    currentTools: String(fields.current_tools || fields.q14 || ""),
    whatFailed: String(fields.what_failed || fields.q15 || ""),
  };
}

async function analyzeClient(responses: Record<string, string>) {
  const prompt = `You are the Client Analyzer for Viddix AI. Analyze this client intake form and produce a structured brief.

CLIENT INTAKE RESPONSES:
${JSON.stringify(responses, null, 2)}

AVAILABLE SNAPSHOTS:
1. Skicenter Snapshot - Best for: tourism, travel, experiences, seasonal businesses, companies selling packages/bundles, multiple locations, quote/proposal flow, booking + payment
2. Carson Reed Snapshot - Best for: Meta/Facebook/Google ads, speed-to-lead automation, AI caller, service businesses, appointment booking funnels, lead nurture sequences

Produce a JSON brief with:
{
  "clientSummary": "1-2 sentence summary of the business",
  "industry": "classified industry",
  "topBottlenecks": ["bottleneck 1", "bottleneck 2", "bottleneck 3"],
  "snapshotRecommendation": "skicenter" | "carson_reed" | "both",
  "snapshotReasoning": "why this snapshot(s)",
  "specificFeaturesToLoad": ["feature 1", "feature 2", ...],
  "pipelinesNeeded": ["pipeline 1", "pipeline 2"],
  "automationsToActivate": ["automation 1", "automation 2"],
  "customFieldsNeeded": ["field 1", "field 2"],
  "estimatedSetupHours": number,
  "priorityActions": ["action 1", "action 2", "action 3"],
  "redFlags": ["anything concerning or missing"]
}

Return only valid JSON, no markdown.`;

  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    messages: [{ role: "user", content: prompt }],
  });

  const text = msg.content[0].type === "text" ? msg.content[0].text : "{}";
  
  try {
    return JSON.parse(text);
  } catch {
    log.warn("Failed to parse Claude JSON, returning raw");
    return { raw: text };
  }
}

async function createCanopyBrief(brief: Record<string, unknown>, responses: Record<string, string>) {
  const CANOPY_URL = process.env.CANOPY_API_URL || "http://localhost:9089";
  
  // Login to get token
  const loginRes = await fetch(`${CANOPY_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.CANOPY_EMAIL || "pablo@viddixai.com",
      password: process.env.CANOPY_PASSWORD || "Atlas2026!",
    }),
  });

  if (!loginRes.ok) {
    log.error("Failed to login to Canopy");
    return;
  }

  const { token } = await loginRes.json() as { token: string };

  const title = `[NEW CLIENT] ${responses.company || responses.contactName} — Setup Brief`;
  const description = `## Client Brief — Generated by Client Analyzer

**Company:** ${responses.company}
**Contact:** ${responses.contactName} (${responses.email})
**Industry:** ${brief.industry}

## Summary
${brief.clientSummary}

## Top Bottlenecks
${(brief.topBottlenecks as string[] || []).map((b: string) => `- ${b}`).join("\n")}

## Snapshot Recommendation
**Load:** ${String(brief.snapshotRecommendation).toUpperCase()}
**Why:** ${brief.snapshotReasoning}

## Features to Load
${(brief.specificFeaturesToLoad as string[] || []).map((f: string) => `- [ ] ${f}`).join("\n")}

## Pipelines Needed
${(brief.pipelinesNeeded as string[] || []).map((p: string) => `- ${p}`).join("\n")}

## Automations to Activate
${(brief.automationsToActivate as string[] || []).map((a: string) => `- [ ] ${a}`).join("\n")}

## Priority Actions (Do First)
${(brief.priorityActions as string[] || []).map((a: string, i: number) => `${i + 1}. ${a}`).join("\n")}

## Estimated Setup: ${brief.estimatedSetupHours} hours

## Red Flags
${(brief.redFlags as string[] || []).map((f: string) => `⚠️ ${f}`).join("\n") || "None"}

---
*Auto-generated by Client Analyzer Agent*`;

  await fetch(`${CANOPY_URL}/api/v1/issues`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title,
      description,
      priority: "high",
      workspace_id: "276c94fe-923d-4f7c-a26a-7311e61186be",
    }),
  });

  log.info({ title }, "Canopy brief created");
}
