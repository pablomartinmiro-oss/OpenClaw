export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";

export async function GET() {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const log = logger.child({ tenantId, path: "/api/dashboard/stats" });
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Today range for module stats
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  // This month range for finance stats
  const monthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);
  const monthEnd = new Date(todayStart.getFullYear(), todayStart.getMonth() + 1, 1);

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
      // Module stats — hotel, restaurant, spa, finance, tpv
      hotelOccupancy,
      restaurantBookingsToday,
      spaAppointmentsToday,
      monthlyRevenue,
      outstandingInvoices,
      tpvSalesToday,
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
      // Hotel: reservations with activityDate = today (proxy for rooms occupied)
      prisma.reservation.count({
        where: {
          tenantId,
          activityDate: { gte: todayStart, lt: todayEnd },
          status: { in: ["confirmada", "pendiente"] },
        },
      }),
      // Restaurant: bookings today
      prisma.restaurantBooking.count({
        where: {
          tenantId,
          date: { gte: todayStart, lt: todayEnd },
          status: { not: "cancelled" },
        },
      }),
      // Spa: slots with booked > 0 today
      prisma.spaSlot.count({
        where: {
          tenantId,
          date: { gte: todayStart, lt: todayEnd },
          booked: { gt: 0 },
        },
      }),
      // Finance: paid invoices this month
      prisma.invoice.aggregate({
        where: {
          tenantId,
          status: "paid",
          paidAt: { gte: monthStart, lt: monthEnd },
        },
        _sum: { total: true },
      }),
      // Finance: outstanding (non-paid, non-cancelled) invoices
      prisma.invoice.count({
        where: {
          tenantId,
          status: { in: ["draft", "sent"] },
        },
      }),
      // TPV: today's sales total
      prisma.tpvSale.aggregate({
        where: {
          tenantId,
          date: { gte: todayStart, lt: todayEnd },
        },
        _sum: { totalAmount: true },
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

    log.info("Dashboard stats fetched with module data");

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
        // Module stats
        hotelOccupancy,
        restaurantBookingsToday,
        spaAppointmentsToday,
        monthlyRevenue: monthlyRevenue._sum.total ?? 0,
        outstandingInvoices,
        tpvSalesToday: tpvSalesToday._sum.totalAmount ?? 0,
      },
    });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al cargar estadísticas",
      code: "DASHBOARD_STATS_FAILED",
      logContext: { tenantId },
    });
  }
}
