export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { apiError } from "@/lib/api-response";

interface DaySummary {
  date: string;
  totalActivities: number;
  totalStudents: number;
  totalInstructors: number;
  totalRentals: number;
}

function isoDay(d: Date): string {
  return d.toISOString().split("T")[0];
}

function countStudents(participants: unknown): number {
  if (!Array.isArray(participants)) return 0;
  return participants.length;
}

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const modError = await requireModule(tenantId, "booking");
  if (modError) return modError;

  const { searchParams } = new URL(request.url);
  const weekStart = searchParams.get("weekStart");
  if (!weekStart) {
    return NextResponse.json(
      { error: "Parametro weekStart requerido" },
      { status: 400 }
    );
  }

  const start = new Date(weekStart);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  try {
    const [activities, rentals] = await Promise.all([
      prisma.activityBooking.findMany({
        where: {
          tenantId,
          activityDate: { gte: start, lt: end },
        },
        include: {
          reservation: { select: { participants: true } },
          monitors: { select: { userId: true } },
        },
      }),
      prisma.rentalOrder
        .findMany({
          where: {
            tenantId,
            OR: [
              { pickupDate: { gte: start, lt: end } },
              { returnDate: { gte: start, lt: end } },
            ],
            status: { notIn: ["cancelled"] },
          },
          select: { pickupDate: true, returnDate: true },
        })
        .catch(() => []),
    ]);

    const days: DaySummary[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      days.push({
        date: isoDay(d),
        totalActivities: 0,
        totalStudents: 0,
        totalInstructors: 0,
        totalRentals: 0,
      });
    }

    const dayMap = new Map(days.map((d) => [d.date, d]));
    const dayInstructors = new Map<string, Set<string>>();

    for (const a of activities) {
      const dayKey = isoDay(new Date(a.activityDate));
      const day = dayMap.get(dayKey);
      if (!day) continue;
      day.totalActivities += 1;
      day.totalStudents += countStudents(a.reservation?.participants);
      const set = dayInstructors.get(dayKey) ?? new Set<string>();
      for (const m of a.monitors) set.add(m.userId);
      dayInstructors.set(dayKey, set);
    }

    for (const [dayKey, set] of dayInstructors) {
      const day = dayMap.get(dayKey);
      if (day) day.totalInstructors = set.size;
    }

    for (const r of rentals) {
      const pickupKey = isoDay(new Date(r.pickupDate));
      const returnKey = isoDay(new Date(r.returnDate));
      if (dayMap.has(pickupKey)) dayMap.get(pickupKey)!.totalRentals += 1;
      if (returnKey !== pickupKey && dayMap.has(returnKey))
        dayMap.get(returnKey)!.totalRentals += 1;
    }

    return NextResponse.json({ days });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener resumen semanal",
      code: "OPS_WEEK_SUMMARY_ERROR",
      logContext: { tenantId },
    });
  }
}
