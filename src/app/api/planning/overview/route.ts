export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { apiError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modError = await requireModule(tenantId, "instructors");
  if (modError) return modError;

  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get("date") ?? new Date().toISOString().split("T")[0];
  const station = searchParams.get("station");

  try {
    const d = new Date(dateStr);
    const dayStart = new Date(d); dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(d); dayEnd.setHours(23, 59, 59, 999);

    const groupWhere: Record<string, unknown> = {
      tenantId,
      activityDate: { gte: dayStart, lte: dayEnd },
    };
    if (station) groupWhere.station = station;

    // Parallel queries for efficiency
    const [groups, pendingUnits, openIncidents, pendingFreeDays] = await Promise.all([
      prisma.groupCell.findMany({
        where: groupWhere,
        include: {
          _count: { select: { units: true } },
        },
      }),
      prisma.operationalUnit.count({
        where: {
          tenantId,
          activityDate: { gte: dayStart, lte: dayEnd },
          status: "pending",
        },
      }),
      prisma.incident.findMany({
        where: { tenantId, resolved: false },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, type: true, severity: true, description: true, createdAt: true },
      }),
      prisma.freeDayRequest.count({
        where: { tenantId, status: "pending" },
      }),
    ]);

    const todayGroups = groups.length;
    const todayStudents = groups.reduce((s, g) => s + g._count.units, 0);
    const totalCapacity = groups.reduce((s, g) => s + g.maxParticipants, 0);
    const occupancy = totalCapacity > 0 ? Math.round((todayStudents / totalCapacity) * 100) : 0;

    const instructorIds = new Set(groups.filter((g) => g.instructorId).map((g) => g.instructorId as string));
    const todayInstructors = instructorIds.size;

    const unassignedGroups = groups.filter((g) => !g.instructorId).length;

    const morningGroups = groups.filter((g) => g.timeSlotStart < "13:00").length;
    const afternoonGroups = groups.filter((g) => g.timeSlotStart >= "13:00").length;

    // Discipline breakdown
    const discMap = new Map<string, number>();
    for (const g of groups) {
      discMap.set(g.discipline, (discMap.get(g.discipline) ?? 0) + 1);
    }
    const byDiscipline = Array.from(discMap.entries()).map(([discipline, count]) => ({ discipline, count }));

    return NextResponse.json({
      todayGroups,
      todayStudents,
      todayInstructors,
      pendingUnits,
      unassignedGroups,
      openIncidents: openIncidents.length,
      pendingFreeDays,
      occupancy,
      morningGroups,
      afternoonGroups,
      byDiscipline,
      recentIncidents: openIncidents,
    });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener resumen",
      code: "OVERVIEW_ERROR",
      logContext: { tenantId },
    });
  }
}
