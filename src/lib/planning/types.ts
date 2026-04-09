/**
 * Planning Engine — Type definitions
 */

export const MAX_GROUP_SIZE = 10;

export const PLANNING_MODES = {
  FIXED_SLOT: "fixed_slot",
  DYNAMIC_GROUPING: "dynamic_grouping",
} as const;

export const TIME_SLOTS = {
  MORNING: { start: "10:00", end: "13:00" },
  AFTERNOON: { start: "13:00", end: "16:00" },
  ESCUELITA: { start: "10:00", end: "15:00" },
} as const;

export const AGE_BRACKETS = {
  baby: { label: "Baby", minAge: 3, maxAge: 5 },
  infantil: { label: "Infantil", minAge: 6, maxAge: 9 },
  adolescente: { label: "Adolescente", minAge: 9, maxAge: 13 },
  juvenil: { label: "Juvenil", minAge: 13, maxAge: 17 },
  adulto: { label: "Adulto", minAge: 18, maxAge: null },
} as const;

export interface GroupingCriteria {
  discipline: string;
  level: string;
  ageBracket: string | null;
  timeSlotStart: string;
  timeSlotEnd: string;
  language: string;
}

export interface GroupingSuggestion {
  criteria: GroupingCriteria;
  unitIds: string[];
  participantCount: number;
  homogeneityScore: number;
}

export interface PlanningResult {
  groups: GroupingSuggestion[];
  ungrouped: string[]; // unitIds that couldn't be grouped
  totalParticipants: number;
  totalGroups: number;
}

export interface PlanningConflict {
  type: "double_booking" | "over_capacity" | "unavailable" | "td_insufficient";
  severity: "warning" | "error";
  description: string;
  entityId: string;
  entityType: "groupCell" | "instructor";
}

export function computeAgeBracket(age: number): "baby" | "infantil" | "adolescente" | "juvenil" | "adulto" {
  if (age <= 5) return "baby";
  if (age <= 9) return "infantil";
  if (age <= 13) return "adolescente";
  if (age <= 17) return "juvenil";
  return "adulto";
}
