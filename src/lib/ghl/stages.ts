import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

const log = logger.child({ layer: "ghl-stages" });

interface PipelineStage {
  id: string;
  name: string;
  position: number;
}

// In-memory cache (1 hour TTL)
let stageCache: Map<string, PipelineStage[]> | null = null;
let stageCacheExpiry = 0;

export async function getPipelineStages(
  tenantId: string,
): Promise<Map<string, PipelineStage[]>> {
  if (stageCache && Date.now() < stageCacheExpiry) {
    return stageCache;
  }

  const pipelines = await prisma.cachedPipeline.findMany({
    where: { tenantId },
    select: { id: true, name: true, stages: true },
  });

  const map = new Map<string, PipelineStage[]>();
  for (const p of pipelines) {
    map.set(p.id, p.stages as unknown as PipelineStage[]);
  }

  stageCache = map;
  stageCacheExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
  return map;
}

export async function findStageByName(
  tenantId: string,
  stageName: string,
): Promise<{ pipelineId: string; stageId: string } | null> {
  const stages = await getPipelineStages(tenantId);
  const searchName = stageName.toLowerCase();

  for (const [pipelineId, pipelineStages] of stages) {
    const found = pipelineStages.find((s) =>
      s.name.toLowerCase().includes(searchName),
    );
    if (found) {
      return { pipelineId, stageId: found.id };
    }
  }

  log.warn({ tenantId, stageName }, "Stage not found in any pipeline");
  return null;
}
