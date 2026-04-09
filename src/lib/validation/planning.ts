import { z } from "zod";

// ==================== PARTICIPANTS ====================

export const createParticipantSchema = z.object({
  reservationId: z.string().min(1, "La reserva es obligatoria"),
  firstName: z.string().min(1, "El nombre es obligatorio"),
  lastName: z.string().optional().nullable(),
  birthDate: z.coerce.date().optional().nullable(),
  age: z.number().int().min(0).optional().nullable(),
  ageBracket: z.enum(["baby", "infantil", "adolescente", "juvenil", "adulto"]).optional().nullable(),
  discipline: z.enum(["esqui", "snow", "telemark", "freestyle"]),
  level: z.enum(["A", "B", "C", "D"]),
  language: z.string().default("es"),
  specialNeeds: z.string().max(500).optional().nullable(),
  relationship: z.string().max(50).optional().nullable(),
});

export const updateParticipantSchema = createParticipantSchema.partial().omit({ reservationId: true });

// ==================== OPERATIONAL UNITS ====================

export const generateUnitsSchema = z.object({
  reservationId: z.string().min(1),
});

// ==================== GROUP CELLS ====================

export const autoGroupSchema = z.object({
  date: z.string().min(1, "La fecha es obligatoria"),
  station: z.string().min(1, "La estacion es obligatoria"),
});

export const createGroupCellSchema = z.object({
  activityDate: z.coerce.date(),
  station: z.string().min(1),
  timeSlotStart: z.string().regex(/^\d{2}:\d{2}$/),
  timeSlotEnd: z.string().regex(/^\d{2}:\d{2}$/),
  discipline: z.enum(["esqui", "snow", "telemark", "freestyle"]),
  level: z.enum(["A", "B", "C", "D"]),
  ageBracket: z.enum(["baby", "infantil", "adolescente", "juvenil", "adulto"]).optional().nullable(),
  language: z.string().default("es"),
  maxParticipants: z.number().int().min(1).max(15).default(10),
  instructorId: z.string().optional().nullable(),
  meetingPointId: z.string().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export const updateGroupCellSchema = createGroupCellSchema.partial();

export const moveUnitSchema = z.object({
  unitId: z.string().min(1),
  targetGroupCellId: z.string().min(1),
});

// ==================== CHECK-IN ====================

export const classCheckInSchema = z.object({
  groupCellId: z.string().min(1),
  participantId: z.string().min(1),
  status: z.enum(["pending", "present", "absent", "no_show"]),
  notes: z.string().max(500).optional().nullable(),
});

// ==================== INCIDENTS ====================

export const createIncidentSchema = z.object({
  groupCellId: z.string().min(1),
  participantId: z.string().optional().nullable(),
  type: z.enum(["level_mismatch", "age_mismatch", "danger", "medical", "general"]),
  severity: z.enum(["normal", "urgent"]).default("normal"),
  description: z.string().min(1, "La descripcion es obligatoria").max(1000),
});

export const resolveIncidentSchema = z.object({
  resolvedNotes: z.string().max(500).optional().nullable(),
});

// ==================== FREE DAY REQUESTS ====================

export const createFreeDayRequestSchema = z.object({
  requestDate: z.coerce.date(),
  reason: z.string().max(500).optional().nullable(),
});

export const reviewFreeDaySchema = z.object({
  status: z.enum(["approved", "rejected"]),
  reviewNotes: z.string().max(500).optional().nullable(),
});
