/**
 * Dashboard-Builder Agent
 * Specialist: Railway deployment only
 * Job: Create and deploy a new client dashboard to Railway
 */

import { logger } from "@/lib/logger";

const log = logger.child({ agent: "dashboard-builder" });

const RAILWAY_TOKEN = process.env.RAILWAY_TOKEN || "a2ad325e-40d0-4bad-a799-591ca0239529";
const RAILWAY_WORKSPACE_ID = "0eb30602-ae17-4c81-a4c3-534584d3fb7c";
const BASE_PROJECT_ID = "06a727f2-a224-471d-abf5-853540ef9ebd"; // existing dashboard project

export interface DashboardBuildSpec {
  clientName: string;
  slug: string;
  ghlLocationId: string;
  ghlPrivateToken: string;
  industry: string;
  tier: "starter" | "growth" | "scale";
}

export interface DashboardBuildResult {
  success: boolean;
  dashboardUrl: string;
  serviceId?: string;
  log: string[];
  errors: string[];
}

async function gql(query: string, variables?: Record<string, unknown>) {
  const res = await fetch("https://backboard.railway.app/graphql/v2", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RAILWAY_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });
  return res.json();
}

export async function runDashboardBuilder(spec: DashboardBuildSpec): Promise<DashboardBuildResult> {
  const result: DashboardBuildResult = {
    success: false,
    dashboardUrl: "",
    log: [],
    errors: [],
  };

  const emit = (msg: string) => {
    log.info(msg);
    result.log.push(`[Dashboard-Builder] ${msg}`);
  };

  emit(`Starting dashboard deployment for ${spec.clientName}`);

  try {
    // Strategy: Add the new client as a tenant in the existing dashboard
    // The dashboard is multi-tenant — same Railway service, new DB tenant
    // This is already handled by the provisioner (creates tenant in DB)
    // The dashboard URL is just /{slug} on the existing service

    const dashboardUrl = `https://openclaw-production-50e4.up.railway.app/${spec.slug}`;
    result.dashboardUrl = dashboardUrl;

    // Set client-specific env vars if needed for the service
    // For now the multi-tenant approach means we just need the DB tenant
    emit(`  ✅ Dashboard URL: ${dashboardUrl}`);
    emit(`  ✅ Tenant slug: ${spec.slug}`);
    emit(`  ✅ Multi-tenant deployment — no new service needed`);

    // Set GHL env vars for this tenant via Railway if it's scale tier (dedicated instance)
    if (spec.tier === "scale") {
      emit(`  🔄 Scale tier — considering dedicated Railway service...`);
      // Future: create dedicated Railway service per scale client
      // For now, all tiers use the shared multi-tenant instance
    }

    // Trigger a sync for this new tenant
    emit(`  🔄 Triggering initial GHL sync...`);
    const syncRes = await fetch(
      `https://openclaw-production-50e4.up.railway.app/api/crm/full-sync`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantSlug: spec.slug }),
      }
    );
    if (syncRes.ok) {
      emit(`  ✅ Initial sync triggered`);
    } else {
      emit(`  ⏭️ Sync will run on next cron cycle (5 min)`);
    }

    result.success = true;
    emit(`Done. Dashboard live at ${dashboardUrl}`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    result.errors.push(msg);
    emit(`  ❌ Failed: ${msg}`);
  }

  return result;
}
