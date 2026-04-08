export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { apiError } from "@/lib/api-response";

/** TD level to max student levels mapping */
const TD_LEVEL_MAP: Record<string, string[]> = {
  TD1: ["A"],
  TD2: ["A", "B", "C"],
  TD3: ["A", "B", "C", "D"],
};

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const modError = await requireModule(tenantId, "instructors");
  if (modError) return modError;

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const startTime = searchParams.get("startTime");
  const endTime = searchParams.get("endTime");
  const level = searchParams.get("level");
  const language = searchParams.get("language");
  const discipline = searchParams.get("discipline");
  const station = searchParams.get("station");

  try {
    // Get all active instructors at station
    const where: Record<string, unknown> = { tenantId, isActive: true };
    if (station) where.station = station;

    const instructors = await prisma.instructor.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
        availability: true,
        assignments: date
          ? {
              where: {
                booking: {
                  activityDate: {
                    gte: new Date(`${date}T00:00:00`),
                    lt: new Date(`${date}T23:59:59`),
                  },
                },
                status: { not: "cancelled" },
              },
            }
          : undefined,
      },
    });

    const dayOfWeek = date ? new Date(date).getDay() : null;

    const scored = instructors
      .map((inst) => {
        let score = 0;
        const reasons: string[] = [];

        // Hard filter: TD level sufficient
        if (level) {
          const allowed = TD_LEVEL_MAP[inst.tdLevel] ?? [];
          if (!allowed.includes(level)) return null;
        }

        // Hard filter: availability covers time slot
        if (dayOfWeek !== null && startTime && endTime) {
          const avail = inst.availability.find(
            (a) => a.dayOfWeek === dayOfWeek && a.isActive
          );
          if (!avail) return null;
          if (avail.startTime > startTime || avail.endTime < endTime) return null;
        }

        // Hard filter: no conflicting assignment at same time
        if (startTime && endTime && inst.assignments) {
          const conflict = inst.assignments.some(
            (a) => a.scheduledStart < endTime && a.scheduledEnd > startTime
          );
          if (conflict) return null;
        }

        // Soft: language match
        if (language) {
          const langs = inst.languages as string[];
          if (langs.includes(language)) {
            score += 10;
            reasons.push("Idioma exacto");
          }
        }

        // Soft: discipline match
        if (discipline) {
          const discs = inst.disciplines as string[];
          if (discs.includes(discipline)) {
            score += 5;
            reasons.push("Disciplina match");
          }
        }

        // Soft: fewer assignments today = more availability
        const todayAssignments = inst.assignments?.length ?? 0;
        score += Math.max(0, 3 - todayAssignments);

        return { instructor: inst, score, reasons, assignmentsToday: todayAssignments };
      })
      .filter(Boolean)
      .sort((a, b) => b!.score - a!.score);

    return NextResponse.json({ matches: scored });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al buscar profesores disponibles",
      code: "INSTRUCTOR_MATCHING_ERROR",
      logContext: { tenantId },
    });
  }
}
