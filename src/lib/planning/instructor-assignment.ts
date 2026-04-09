/**
 * Planning Engine — Auto-Assign Instructors to GroupCells
 *
 * For each unassigned GroupCell, find the best available instructor
 * using the matching criteria (TD level, discipline, language, availability).
 * Distributes load fairly across instructors.
 */

import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

const log = logger.child({ module: "planning:assignment" });

const TD_LEVEL_MAP: Record<string, string[]> = {
  TD1: ["A"],
  TD2: ["A", "B", "C"],
  TD3: ["A", "B", "C", "D"],
};

interface AssignmentSuggestion {
  groupCellId: string;
  instructorId: string;
  instructorName: string;
  score: number;
  reasons: string[];
}

/**
 * Auto-assign instructors to unassigned GroupCells for a date+station.
 * Returns suggestions (not yet persisted — admin confirms).
 */
export async function autoAssignInstructors(
  tenantId: string,
  date: string,
  station: string
): Promise<AssignmentSuggestion[]> {
  const dateObj = new Date(date);
  const dayStart = new Date(dateObj);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dateObj);
  dayEnd.setHours(23, 59, 59, 999);

  // Get unassigned GroupCells
  const unassigned = await prisma.groupCell.findMany({
    where: {
      tenantId,
      activityDate: { gte: dayStart, lte: dayEnd },
      station,
      instructorId: null,
    },
  });

  if (unassigned.length === 0) return [];

  // Get available instructors
  const dayOfWeek = dateObj.getDay();
  const instructors = await prisma.instructor.findMany({
    where: { tenantId, station, isActive: true },
    include: {
      user: { select: { name: true } },
      availability: { where: { dayOfWeek, isActive: true } },
      groupCells: {
        where: { activityDate: { gte: dayStart, lte: dayEnd } },
      },
      freeDayRequests: {
        where: {
          requestDate: { gte: dayStart, lte: dayEnd },
          status: "approved",
        },
      },
    },
  });

  // Filter out instructors on approved free days or without availability
  const available = instructors.filter(
    (i) => i.availability.length > 0 && i.freeDayRequests.length === 0
  );

  const suggestions: AssignmentSuggestion[] = [];

  // Track assignments-per-instructor for fairness
  const loadMap = new Map<string, number>();
  for (const inst of available) {
    loadMap.set(inst.id, inst.groupCells.length);
  }

  for (const group of unassigned) {
    let bestInstructor: typeof available[0] | null = null;
    let bestScore = -1;
    const bestReasons: string[] = [];

    for (const inst of available) {
      let score = 0;
      const reasons: string[] = [];

      // Hard filter: TD level
      const allowed = TD_LEVEL_MAP[inst.tdLevel] ?? [];
      if (!allowed.includes(group.level)) continue;

      // Hard filter: no time conflict
      const hasConflict = inst.groupCells.some(
        (gc) =>
          gc.timeSlotStart < group.timeSlotEnd &&
          gc.timeSlotEnd > group.timeSlotStart
      );
      if (hasConflict) continue;

      // Hard filter: availability covers slot
      const avail = inst.availability[0];
      if (avail && (avail.startTime > group.timeSlotStart || avail.endTime < group.timeSlotEnd)) {
        continue;
      }

      // Soft: discipline match
      const disciplines = inst.disciplines as string[];
      if (disciplines.includes(group.discipline)) {
        score += 5;
        reasons.push("Disciplina");
      }

      // Soft: language match
      const languages = inst.languages as string[];
      if (languages.includes(group.language)) {
        score += 3;
        reasons.push("Idioma");
      }

      // Soft: fewer assignments = more fair
      const currentLoad = loadMap.get(inst.id) ?? 0;
      score += Math.max(0, 5 - currentLoad);

      if (score > bestScore) {
        bestScore = score;
        bestInstructor = inst;
        bestReasons.length = 0;
        bestReasons.push(...reasons);
      }
    }

    if (bestInstructor) {
      suggestions.push({
        groupCellId: group.id,
        instructorId: bestInstructor.id,
        instructorName: bestInstructor.user.name ?? bestInstructor.id,
        score: bestScore,
        reasons: bestReasons,
      });
      // Update load map for fairness in subsequent iterations
      loadMap.set(
        bestInstructor.id,
        (loadMap.get(bestInstructor.id) ?? 0) + 1
      );
    }
  }

  log.info(
    { date, station, assigned: suggestions.length, total: unassigned.length },
    "Auto-assignment completed"
  );

  return suggestions;
}

/**
 * Apply assignment suggestions — update GroupCells with instructor.
 */
export async function applyAssignmentSuggestions(
  suggestions: AssignmentSuggestion[]
): Promise<{ assigned: number }> {
  let assigned = 0;
  for (const s of suggestions) {
    await prisma.groupCell.update({
      where: { id: s.groupCellId },
      data: { instructorId: s.instructorId, status: "confirmed" },
    });
    assigned++;
  }
  return { assigned };
}
