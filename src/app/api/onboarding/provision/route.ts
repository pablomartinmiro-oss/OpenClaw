/**
 * POST /api/onboarding/provision
 * 
 * Manually trigger provisioning for a client.
 * Also called by the Builder agent after Client Analyzer creates the brief.
 */

import { NextResponse } from "next/server";
import { provisionClient, ClientBrief } from "@/lib/provisioner/builder";
import { logger } from "@/lib/logger";

const log = logger.child({ route: "/api/onboarding/provision" });

export async function POST(req: Request) {
  try {
    const body = await req.json() as Partial<ClientBrief>;

    // Validate required fields
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

    log.info({ client: brief.companyName, tier: brief.tier }, "Provisioning request received");

    const result = await provisionClient(brief);

    return NextResponse.json(result);
  } catch (err) {
    log.error({ err }, "Provisioning failed");
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
