import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function GET() {
  const session = await auth();
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const tenantId = session.user.tenantId;
  const log = logger.child({ tenantId, path: "/api/dashboard/stats" });
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { ghlAccessToken: true, syncState: true, lastSyncError: true },
    });
    const ghlConnected = !!tenant?.ghlAccessToken;

    const [
      totalContacts,
      totalOpportunities,
      pipelineValueResult,
      activeConversations,
      recentContacts,
      recentOpportunities,
      syncStatus,
      pipelines,
      wonCount,
      lostCount,
      contactsBySource,
      opportunitiesByPipeline,
    ] = await Promise.all([
      prisma.cachedContact.count({ where: { tenantId } }),
      prisma.cachedOpportunity.count({ where: { tenantId } }),
      prisma.cachedOpportunity.aggregate({
        where: { tenantId, status: "open" },
        _sum: { monetaryValue: true },
      }),
      prisma.cachedConversation.count({
        where: { tenantId, lastMessageDate: { gte: sevenDaysAgo } },
      }),
      prisma.cachedContact.findMany({
        where: { tenantId },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: { id: true, name: true, email: true, source: true, updatedAt: true },
      }),
      prisma.cachedOpportunity.findMany({
        where: { tenantId },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: { id: true, name: true, monetaryValue: true, status: true, updatedAt: true },
      }),
      prisma.syncStatus.findUnique({ where: { tenantId } }),
      prisma.cachedPipeline.findMany({
        where: { tenantId },
        select: { id: true, name: true, stages: true },
      }),
      prisma.cachedOpportunity.count({ where: { tenantId, status: "won" } }),
      prisma.cachedOpportunity.count({ where: { tenantId, status: "lost" } }),
      prisma.cachedContact.groupBy({
        by: ["source"],
        where: { tenantId, source: { not: null } },
        _count: true,
        orderBy: { _count: { source: "desc" } },
        take: 10,
      }),
      prisma.cachedOpportunity.groupBy({
        by: ["pipelineId"],
        where: { tenantId },
        _count: true,
        _sum: { monetaryValue: true },
      }),
    ]);

    // Build pipeline breakdown with names
    const pipelineBreakdown = opportunitiesByPipeline.map((g) => {
      const pipeline = pipelines.find((p) => p.id === g.pipelineId);
      return {
        pipelineId: g.pipelineId,
        pipelineName: pipeline?.name ?? g.pipelineId,
        count: g._count,
        value: g._sum.monetaryValue ?? 0,
      };
    }).sort((a, b) => b.count - a.count);

    // Build lead source breakdown
    const leadSources = contactsBySource.map((g) => ({
      source: g.source ?? "Sin origen",
      count: g._count,
    }));

    return NextResponse.json({
      ghlConnected,
      ghlError: tenant?.syncState === "error" ? tenant.lastSyncError : null,
      stats: {
        totalContacts,
        totalOpportunities,
        pipelineValue: pipelineValueResult._sum.monetaryValue ?? 0,
        activeConversations,
        pipelineCount: pipelines.length,
        wonDeals: wonCount,
        lostDeals: lostCount,
        pipelineBreakdown,
        leadSources,
        recentContacts,
        recentOpportunities,
        lastSync: syncStatus?.lastFullSync ?? syncStatus?.lastIncrSync,
        syncInProgress: syncStatus?.syncInProgress ?? false,
      },
    });
  } catch (error) {
    log.error({ error }, "Failed to fetch dashboard stats");
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
