/**
 * Atlas Orchestrator
 * Runs all 4 specialist agents in PARALLEL
 * Reports real-time progress to Canopy
 */

import { logger } from "@/lib/logger";
import { ClientBrief } from "@/lib/provisioner/builder";
import { runGHLBuilder, type GHLBuildSpec } from "./ghl-builder";
import { runDashboardBuilder, type DashboardBuildSpec } from "./dashboard-builder";
import { runAutomationBuilder, type AutomationSpec } from "./automation-builder";
import { runQAAgent, type QASpec } from "./qa-agent";


const log = logger.child({ agent: "orchestrator" });

const CANOPY_URL = process.env.CANOPY_API_URL || "https://canopy-backend-production-81e1.up.railway.app";

export interface OrchestrationResult {
  success: boolean;
  clientName: string;
  dashboardUrl: string;
  locationId: string;
  qaScore: number;
  duration: number;
  agentLogs: {
    ghlBuilder: string[];
    dashboardBuilder: string[];
    automationBuilder: string[];
    qaAgent: string[];
  };
  summary: string;
}

export async function orchestrateClientDeployment(
  brief: ClientBrief & { locationId: string; locationToken: string; slug: string }
): Promise<OrchestrationResult> {
  const startTime = Date.now();
  log.info({ client: brief.companyName }, "🎯 Atlas Orchestrator starting parallel deployment");

  // Post update to Canopy
  await postToCanopy(`🎯 Starting deployment for **${brief.companyName}**\n4 specialist agents launching in parallel...`);

  // ── Build specs for each agent ─────────────────────────────────────────────
  const ghlSpec: GHLBuildSpec = {
    locationId: brief.locationId,
    locationToken: brief.locationToken,
    pipelines: [
      { name: "Universal Sales Pipeline", stages: ["New Lead", "Contacted", "Qualified", "Proposal Sent", "Negotiation", "Won", "Lost"] },
      ...brief.pipelinesNeeded.map((name: string) => ({ name, stages: ["Open", "In Progress", "Complete"] })),
    ],
    customFields: brief.customFieldsNeeded.map((name: string) => ({ name, dataType: "TEXT" })),
    tags: ["new-lead", "hot-lead", "follow-up", "won", "lost", brief.industry.toLowerCase().replace(/\s+/g, "-")],
    customValues: [
      { name: "Business Name", value: brief.companyName },
      { name: "Industry", value: brief.industry },
      { name: "Tier", value: brief.tier },
    ],
  };

  const dashSpec: DashboardBuildSpec = {
    clientName: brief.clientName,
    slug: brief.slug,
    ghlLocationId: brief.locationId,
    ghlPrivateToken: brief.locationToken,
    industry: brief.industry,
    tier: brief.tier,
  };

  const autoSpec: AutomationSpec = {
    locationId: brief.locationId,
    locationToken: brief.locationToken,
    snapshotIds: brief.snapshotRecommendation === "both"
      ? ["skicenter", "carson_reed"]
      : [brief.snapshotRecommendation],
    bottlenecks: brief.topBottlenecks,
    industry: brief.industry,
    useWhatsApp: true,
    automationsToActivate: brief.automationsToActivate,
  };

  // ── Launch all 4 agents in PARALLEL ───────────────────────────────────────
  log.info("🚀 Launching all 4 agents simultaneously...");

  const [ghlResult, dashResult, autoResult] = await Promise.all([
    runGHLBuilder(ghlSpec).then(r => {
      postToCanopy(`🔨 **GHL-Builder done**\n✅ ${r.created.customFields.length} fields, ${r.created.tags.length} tags\n${r.errors.length > 0 ? `⚠️ ${r.errors.length} errors` : "No errors"}`);
      return r;
    }),
    runDashboardBuilder(dashSpec).then(r => {
      postToCanopy(`💻 **Dashboard-Builder done**\n✅ ${r.dashboardUrl}\n${r.success ? "Live and ready" : "⚠️ " + r.errors[0]}`);
      return r;
    }),
    runAutomationBuilder(autoSpec).then(r => {
      postToCanopy(`🤖 **Automation-Builder done**\n✅ ${r.activated.length} automations configured\n⏭️ ${r.skipped.length} skipped`);
      return r;
    }),
  ]);

  // ── QA runs after the others complete ─────────────────────────────────────
  await postToCanopy(`🔍 **QA-Agent starting verification...**`);

  const qaSpec: QASpec = {
    locationId: brief.locationId,
    locationToken: brief.locationToken,
    dashboardUrl: dashResult.dashboardUrl,
    tenantSlug: brief.slug,
    expectedPipelines: brief.pipelinesNeeded,
    expectedFields: brief.customFieldsNeeded.slice(0, 5),
  };

  const qaResult = await runQAAgent(qaSpec);
  await postToCanopy(`🔍 **QA-Agent done**\n${qaResult.summary}`);

  const duration = Math.round((Date.now() - startTime) / 1000);

  const summary = [
    `✅ **${brief.companyName}** deployment complete in ${duration}s`,
    ``,
    `📊 Results:`,
    `• GHL: ${ghlResult.created.customFields.length} fields, ${ghlResult.created.tags.length} tags`,
    `• Dashboard: ${dashResult.dashboardUrl}`,
    `• Automations: ${autoResult.activated.join(", ")}`,
    `• QA Score: ${qaResult.score}/100 ${qaResult.passed ? "✅" : "⚠️"}`,
    ``,
    `${qaResult.passed ? "🟢 Ready for client handoff" : "🟡 Review QA failures before handoff"}`,
  ].join("\n");

  await postToCanopy(summary);

  log.info({ duration, qaScore: qaResult.score }, "Orchestration complete");

  return {
    success: ghlResult.success && dashResult.success,
    clientName: brief.companyName,
    dashboardUrl: dashResult.dashboardUrl,
    locationId: brief.locationId,
    qaScore: qaResult.score,
    duration,
    agentLogs: {
      ghlBuilder: ghlResult.log,
      dashboardBuilder: dashResult.log,
      automationBuilder: autoResult.log,
      qaAgent: qaResult.log,
    },
    summary,
  };
}

async function postToCanopy(message: string) {
  try {
    // Login
    const loginRes = await fetch(`${CANOPY_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "pablo@viddixai.com", password: "Atlas2026!" }),
    });
    const { token } = await loginRes.json() as { token: string };

    // Create issue/comment with the update
    await fetch(`${CANOPY_URL}/api/v1/issues`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        title: `[DEPLOY LOG] ${message.split("\n")[0]}`,
        description: message,
        priority: "medium",
        workspace_id: "7154e597-bc18-48c3-9296-0c71676e976f",
      }),
    });
  } catch (e) {
    log.warn({ e }, "Failed to post to Canopy — continuing anyway");
  }
}
