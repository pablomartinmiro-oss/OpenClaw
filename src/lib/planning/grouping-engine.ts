/**
 * Planning Engine — Auto-Grouping Algorithm
 *
 * Groups pending OperationalUnits into GroupCells by:
 * 1. discipline (required exact match)
 * 2. level (required exact match)
 * 3. ageBracket (strong preference)
 * 4. language (soft preference)
 *
 * Optimization goals:
 * - Fill groups to max capacity (rentabilidad)
 * - Maximize homogeneity (quality)
 * - Return suggestions for admin review
 */

import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import {
  MAX_GROUP_SIZE,
  PLANNING_MODES,
  TIME_SLOTS,
  type GroupingSuggestion,
  type PlanningResult,
} from "./types";

const log = logger.child({ module: "planning:grouping" });

interface UnitWithParticipant {
  id: string;
  participantId: string;
  planningMode: string;
  participant: {
    discipline: string;
    level: string;
    ageBracket: string | null;
    language: string;
    age: number | null;
  };
}

/**
 * Auto-group pending OUs for a given date and station.
 * Returns suggestions (not yet persisted).
 */
export async function autoGroupUnits(
  tenantId: string,
  date: string,
  station: string
): Promise<PlanningResult> {
  const dateObj = new Date(date);
  const dayStart = new Date(dateObj);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dateObj);
  dayEnd.setHours(23, 59, 59, 999);

  const units = await prisma.operationalUnit.findMany({
    where: {
      tenantId,
      activityDate: { gte: dayStart, lte: dayEnd },
      status: "pending",
    },
    include: {
      participant: {
        select: {
          discipline: true,
          level: true,
          ageBracket: true,
          language: true,
          age: true,
        },
      },
      reservation: { select: { station: true } },
    },
  });

  // Filter by station via reservation
  const stationUnits = units.filter((u) => u.reservation.station === station);

  // Separate by planning mode
  const fixedSlot = stationUnits.filter(
    (u) => u.planningMode === PLANNING_MODES.FIXED_SLOT
  );
  const dynamic = stationUnits.filter(
    (u) => u.planningMode === PLANNING_MODES.DYNAMIC_GROUPING
  );

  const groups: GroupingSuggestion[] = [];
  const ungrouped: string[] = [];

  // Fixed slot: 1:1 GroupCell (private lessons already have their time)
  for (const unit of fixedSlot) {
    groups.push({
      criteria: {
        discipline: unit.participant.discipline,
        level: unit.participant.level,
        ageBracket: unit.participant.ageBracket,
        timeSlotStart: "09:00",
        timeSlotEnd: "10:00",
        language: unit.participant.language,
      },
      unitIds: [unit.id],
      participantCount: 1,
      homogeneityScore: 10,
    });
  }

  // Dynamic grouping: group by discipline+level, then by ageBracket+language
  const buckets = new Map<string, UnitWithParticipant[]>();
  for (const unit of dynamic) {
    const key = `${unit.participant.discipline}:${unit.participant.level}`;
    const bucket = buckets.get(key) ?? [];
    bucket.push(unit as UnitWithParticipant);
    buckets.set(key, bucket);
  }

  for (const [key, bucket] of buckets) {
    const [discipline, level] = key.split(":");

    // Sub-group by ageBracket for better homogeneity
    const ageBuckets = new Map<string, UnitWithParticipant[]>();
    for (const unit of bucket) {
      const ab = unit.participant.ageBracket ?? "adulto";
      const abBucket = ageBuckets.get(ab) ?? [];
      abBucket.push(unit);
      ageBuckets.set(ab, abBucket);
    }

    for (const [ageBracket, ageUnits] of ageBuckets) {
      // Split into groups of max MAX_GROUP_SIZE
      for (let i = 0; i < ageUnits.length; i += MAX_GROUP_SIZE) {
        const chunk = ageUnits.slice(i, i + MAX_GROUP_SIZE);
        const languages = chunk.map((u) => u.participant.language);
        const dominantLang = mode(languages);
        const score = computeHomogeneity(chunk);

        // Determine time slot (morning by default, alternate if many groups)
        const slotIndex = Math.floor(i / MAX_GROUP_SIZE);
        const slot = slotIndex % 2 === 0 ? TIME_SLOTS.MORNING : TIME_SLOTS.AFTERNOON;

        groups.push({
          criteria: {
            discipline,
            level,
            ageBracket,
            timeSlotStart: slot.start,
            timeSlotEnd: slot.end,
            language: dominantLang,
          },
          unitIds: chunk.map((u) => u.id),
          participantCount: chunk.length,
          homogeneityScore: score,
        });
      }
    }
  }

  log.info(
    { date, station, totalUnits: stationUnits.length, groups: groups.length },
    "Auto-grouping completed"
  );

  return {
    groups,
    ungrouped,
    totalParticipants: stationUnits.length,
    totalGroups: groups.length,
  };
}

/**
 * Persist grouping suggestions as GroupCells and update OUs.
 */
export async function applyGroupingSuggestion(
  tenantId: string,
  date: string,
  station: string,
  suggestions: GroupingSuggestion[]
): Promise<{ created: number }> {
  let created = 0;

  for (const suggestion of suggestions) {
    const groupCell = await prisma.groupCell.create({
      data: {
        tenantId,
        activityDate: new Date(date),
        station,
        timeSlotStart: suggestion.criteria.timeSlotStart,
        timeSlotEnd: suggestion.criteria.timeSlotEnd,
        discipline: suggestion.criteria.discipline,
        level: suggestion.criteria.level,
        ageBracket: suggestion.criteria.ageBracket,
        language: suggestion.criteria.language,
      },
    });

    await prisma.operationalUnit.updateMany({
      where: { id: { in: suggestion.unitIds } },
      data: { groupCellId: groupCell.id, status: "grouped" },
    });

    created++;
  }

  return { created };
}

function computeHomogeneity(units: UnitWithParticipant[]): number {
  if (units.length <= 1) return 10;
  let score = 5;
  const ages = units.map((u) => u.participant.ageBracket).filter(Boolean);
  const langs = units.map((u) => u.participant.language);
  if (new Set(ages).size === 1) score += 3;
  if (new Set(langs).size === 1) score += 2;
  return Math.min(score, 10);
}

function mode(arr: string[]): string {
  const freq = new Map<string, number>();
  for (const v of arr) freq.set(v, (freq.get(v) ?? 0) + 1);
  let maxCount = 0;
  let result = arr[0] ?? "es";
  for (const [val, count] of freq) {
    if (count > maxCount) { maxCount = count; result = val; }
  }
  return result;
}
