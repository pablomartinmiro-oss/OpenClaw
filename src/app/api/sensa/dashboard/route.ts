export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Today's revenue
    const todayRevenue = await prisma.sensaRevenue.findMany({
      where: { date: { gte: todayStart } },
    });
    const todayRevenueTotal = todayRevenue.reduce(
      (sum, r) =>
        sum + r.courtRevenue + r.membershipRevenue + r.classesRevenue + r.otherRevenue,
      0
    );
    const todayCourtBookings = todayRevenue.reduce((sum, r) => sum + r.courtBookings, 0);

    // Yesterday revenue
    const yesterdayRevenue = await prisma.sensaRevenue.findMany({
      where: { date: { gte: yesterdayStart, lt: todayStart } },
    });
    const yesterdayRevenueTotal = yesterdayRevenue.reduce(
      (sum, r) =>
        sum + r.courtRevenue + r.membershipRevenue + r.classesRevenue + r.otherRevenue,
      0
    );

    // New players today (first visit sessions)
    const newPlayersToday = await prisma.sensaSession.count({
      where: { playedAt: { gte: todayStart }, isFirst: true },
    });

    // Active leads (hot leads: 2+ visits, <30 days, not converted)
    const activeLeads = await prisma.sensaLead.count({
      where: {
        status: { notIn: ["converted"] },
        lastVisit: { gte: thirtyDaysAgo },
        visitCount: { gte: 2 },
      },
    });

    // Last 7 days revenue chart
    const last7DaysRevenue = await prisma.sensaRevenue.findMany({
      where: { date: { gte: sevenDaysAgo } },
      orderBy: { date: "asc" },
    });

    // Build chart data — one entry per day for last 7 days
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(day.getDate() - i);
      const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayRevenue = last7DaysRevenue.filter(
        (r) => r.date >= dayStart && r.date < dayEnd
      );
      const total = dayRevenue.reduce(
        (sum, r) =>
          sum + r.courtRevenue + r.membershipRevenue + r.classesRevenue + r.otherRevenue,
        0
      );

      chartData.push({
        date: dayStart.toLocaleDateString("es-ES", { weekday: "short", day: "numeric" }),
        total: Math.round(total * 100) / 100,
      });
    }

    // Hot leads panel
    const hotLeads = await prisma.sensaLead.findMany({
      where: {
        lastVisit: { gte: thirtyDaysAgo },
        visitCount: { gte: 2 },
        status: { notIn: ["converted"] },
      },
      include: { member: true },
      orderBy: { visitCount: "desc" },
      take: 10,
    });

    return NextResponse.json({
      kpis: {
        todayRevenue: todayRevenueTotal,
        yesterdayRevenue: yesterdayRevenueTotal,
        todayCourtBookings,
        newPlayersToday,
        activeLeads,
      },
      chartData,
      hotLeads,
    });
  } catch (error) {
    console.error("GET /api/sensa/dashboard error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
