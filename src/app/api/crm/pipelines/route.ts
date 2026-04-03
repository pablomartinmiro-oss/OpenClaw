export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { apiError } from "@/lib/api-response";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import type { GHLPipelineStage } from "@/lib/ghl/types";

export async function GET() {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const log = logger.child({ tenantId, path: "/api/crm/pipelines" });

  try {
    const pipelines = await prisma.cachedPipeline.findMany({
      where: { tenantId },
    });

    log.info({ count: pipelines.length }, "Pipelines from cache");
    return NextResponse.json({
      pipelines: pipelines.map((p) => ({
        id: p.id,
        name: p.name,
        stages: p.stages as unknown as GHLPipelineStage[],
      })),
    });
  } catch (error) {
    return apiError(error, { publicMessage: "Failed to fetch pipelines", code: "CRM_PIPELINES_FETCH", logContext: { tenantId } });
  }
}
