/**
 * POST /api/onboarding/provision
 * Full parallel orchestration — all 4 agents fire simultaneously
 */

import { NextResponse } from "next/server";
import { provisionClient, ClientBrief } from "@/lib/provisioner/builder";
import { orchestrateClientDeployment } from "@/lib/agents/orchestrator";
import { logger } from "@/lib/logger";

const log = logger.child({ route: "/api/onboarding/provision" });

export async function POST(req: Request) {
  try {
    const body = await req.json() as Partial<ClientBrief> & {
      locationToken?: string;
    };

    if (!body.clientName || !body.companyName || !body.email) {
      return NextResponse.json(
        { error: "clientName, companyName, and email are required" },
        { status: 400 }
      );
    }

    const brief: ClientBrief = {
      clientName: body.clientName,
      companyName: body.companyName,
      email: body.email,
      phone: body.phone,
      industry: body.industry || "General",
      snapshotRecommendation: body.snapshotRecommendation || "both",
      topBottlenecks: body.topBottlenecks || [],
      pipelinesNeeded: body.pipelinesNeeded || ["Universal Sales Pipeline"],
      automationsToActivate: body.automationsToActivate || ["Speed to Lead", "Follow Up Sequence"],
      customFieldsNeeded: body.customFieldsNeeded || [],
      tier: body.tier || "starter",
    };

    log.info({ client: brief.companyName, tier: brief.tier }, "Provision + orchestrate request");

    // Step 1: Create GHL subaccount + DB tenant
    const provisionResult = await provisionClient(brief);

    if (!provisionResult.success || !provisionResult.locationId) {
      return NextResponse.json({ ...provisionResult, orchestration: null });
    }

    const slug = brief.companyName.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 30);

    // Step 2: If we have a location token, run full parallel orchestration
    if (body.locationToken) {
      log.info("Location token provided — running full parallel orchestration");

      const orchResult = await orchestrateClientDeployment({
        ...brief,
        locationId: provisionResult.locationId,
        locationToken: body.locationToken,
        slug,
      });

      return NextResponse.json({
        ...provisionResult,
        orchestration: orchResult,
        summary: orchResult.summary,
      });
    }

    // No token yet — return provision result with instructions
    return NextResponse.json({
      ...provisionResult,
      orchestration: null,
      nextStep: {
        message: "GHL subaccount created. To run full parallel setup, create a private integration token for this location and call this endpoint again with locationToken.",
        locationId: provisionResult.locationId,
        dashboardUrl: provisionResult.dashboardUrl,
      },
    });

  } catch (err) {
    log.error({ err }, "Provision failed");
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
