/**
 * Pure payroll calculation logic for instructors.
 * Takes time entries + assignments and produces a payroll summary
 * ready to create PayrollRecord + PayrollExtra entries.
 */

interface TimeEntryInput {
  netMinutes: number;
  date: Date;
  correctionOf: string | null;
}

interface AssignmentInput {
  lessonType: string;
  studentCount: number;
  scheduledStart: string;
  scheduledEnd: string;
  hourlyRate: number;
  bonusPerStudent: number;
  surcharge: number;
  status: string;
}

export interface PayrollSummary {
  instructorId: string;
  instructorName: string;
  year: number;
  month: number;
  // Time
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  workingDays: number;
  // Assignments
  totalLessons: number;
  groupLessons: number;
  privateLessons: number;
  adaptiveLessons: number;
  totalStudents: number;
  // Money (all in EUR, rounded to 2 decimals)
  baseEarnings: number;
  overtimeEarnings: number;
  studentBonuses: number;
  surchargeTotal: number;
  totalEarnings: number;
  // Breakdown for PayrollExtra creation
  extras: Array<{
    concept: string;
    type: "bonus" | "overtime" | "commission";
    amount: number;
  }>;
}

const OVERTIME_MULTIPLIER = 1.25;
const DAILY_REGULAR_HOURS = 8;

/**
 * Calculate payroll summary from time entries and assignments.
 * Only considers locked/completed data (entries with clockOut, assignments with status=completed).
 */
export function calculatePayroll(
  instructorId: string,
  instructorName: string,
  hourlyRate: number,
  year: number,
  month: number,
  timeEntries: TimeEntryInput[],
  assignments: AssignmentInput[]
): PayrollSummary {
  // Filter out corrections that have been superseded
  const correctionOriginals = new Set(
    timeEntries.filter((e) => e.correctionOf).map((e) => e.correctionOf!)
  );
  const effectiveEntries = timeEntries.filter(
    (e) => !correctionOriginals.has(e.correctionOf ?? "__none__") || e.correctionOf !== null
  ).filter((e) => !correctionOriginals.has(String(e)));

  // Simplified: use all entries, but if an entry has a correction, use the correction
  const entryMap = new Map<string, number>();
  for (const entry of timeEntries) {
    const key = entry.date.toISOString().split("T")[0];
    if (entry.correctionOf) {
      // Correction replaces original for that day
      entryMap.set(key, entry.netMinutes);
    } else {
      // Only add if no correction exists for this day
      if (!entryMap.has(key)) {
        entryMap.set(key, entry.netMinutes);
      }
    }
  }

  const totalMinutes = Array.from(entryMap.values()).reduce((s, m) => s + m, 0);
  const totalHours = round2(totalMinutes / 60);
  const workingDays = entryMap.size;

  // Calculate overtime: daily overtime (>8h/day)
  let overtimeMinutes = 0;
  for (const minutes of entryMap.values()) {
    if (minutes > DAILY_REGULAR_HOURS * 60) {
      overtimeMinutes += minutes - DAILY_REGULAR_HOURS * 60;
    }
  }

  const overtimeHours = round2(overtimeMinutes / 60);
  const regularHours = round2(totalHours - overtimeHours);

  // Completed assignments only
  const completed = assignments.filter((a) => a.status === "completed");
  const groupLessons = completed.filter((a) => a.lessonType === "group").length;
  const privateLessons = completed.filter((a) => a.lessonType === "private").length;
  const adaptiveLessons = completed.filter((a) => a.lessonType === "adaptive").length;
  const totalStudents = completed.reduce((s, a) => s + a.studentCount, 0);
  const groupStudents = completed
    .filter((a) => a.lessonType === "group")
    .reduce((s, a) => s + a.studentCount, 0);

  // Money
  const baseEarnings = round2(regularHours * hourlyRate);
  const overtimeEarnings = round2(overtimeHours * hourlyRate * OVERTIME_MULTIPLIER);

  // Per-student bonuses (from completed group lessons)
  const studentBonuses = completed
    .filter((a) => a.lessonType === "group" && a.bonusPerStudent > 0)
    .reduce((s, a) => s + round2(a.studentCount * a.bonusPerStudent), 0);

  const surchargeTotal = completed.reduce((s, a) => s + a.surcharge, 0);
  const totalEarnings = round2(baseEarnings + overtimeEarnings + studentBonuses + surchargeTotal);

  // Build extras
  const extras: PayrollSummary["extras"] = [];

  if (overtimeEarnings > 0) {
    extras.push({
      concept: `Horas extra (${overtimeHours}h x ${hourlyRate} EUR x ${OVERTIME_MULTIPLIER})`,
      type: "overtime",
      amount: round2(overtimeEarnings),
    });
  }

  if (studentBonuses > 0) {
    extras.push({
      concept: `Bonus por alumnos (${groupStudents} alumnos en ${groupLessons} clases grupales)`,
      type: "commission",
      amount: round2(studentBonuses),
    });
  }

  if (surchargeTotal > 0) {
    extras.push({
      concept: `Recargos especiales (${completed.filter((a) => a.surcharge > 0).length} clases)`,
      type: "bonus",
      amount: round2(surchargeTotal),
    });
  }

  return {
    instructorId,
    instructorName,
    year,
    month,
    totalHours,
    regularHours,
    overtimeHours,
    workingDays,
    totalLessons: completed.length,
    groupLessons,
    privateLessons,
    adaptiveLessons,
    totalStudents,
    baseEarnings,
    overtimeEarnings,
    studentBonuses,
    surchargeTotal,
    totalEarnings,
    extras,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
