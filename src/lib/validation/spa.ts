import { z } from "zod";

// ==================== SPA CATEGORY ====================

export const createSpaCategorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/).optional(),
  sortOrder: z.number().int().min(0).default(0),
});
export const updateSpaCategorySchema = createSpaCategorySchema.partial();

// ==================== SPA TREATMENT ====================

export const createSpaTreatmentSchema = z.object({
  categoryId: z.string().min(1),
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/).optional(),
  duration: z.number().int().min(5).max(480),
  capacity: z.number().int().min(1).max(50).default(1),
  price: z.coerce.number().min(0),
  images: z.array(z.string()).default([]),
  description: z.string().max(2000).optional().nullable(),
  supplierCommission: z.coerce.number().min(0).max(100).optional().nullable(),
  fiscalRegime: z.enum(["general", "reav"]).default("general"),
  active: z.boolean().default(true),
});
export const updateSpaTreatmentSchema = createSpaTreatmentSchema.partial();

// ==================== SPA RESOURCE ====================

export const createSpaResourceSchema = z.object({
  type: z.enum(["cabin", "therapist"]),
  name: z.string().min(1).max(200),
  active: z.boolean().default(true),
});
export const updateSpaResourceSchema = createSpaResourceSchema.partial();

// ==================== SPA SLOT ====================

export const createSpaSlotSchema = z.object({
  date: z.coerce.date(),
  time: z.string().min(1),
  treatmentId: z.string().min(1),
  resourceId: z.string().optional().nullable(),
  capacity: z.number().int().min(1).default(1),
  status: z.enum(["available", "blocked", "full"]).default("available"),
});
export const updateSpaSlotSchema = z.object({
  capacity: z.number().int().min(0).optional(),
  booked: z.number().int().min(0).optional(),
  status: z.enum(["available", "blocked", "full"]).optional(),
});

// ==================== SPA SCHEDULE TEMPLATE ====================

export const createSpaScheduleTemplateSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  treatmentId: z.string().optional().nullable(),
  capacity: z.number().int().min(1).default(1),
  resourceIds: z.array(z.string()).default([]),
});
export const updateSpaScheduleTemplateSchema =
  createSpaScheduleTemplateSchema.partial();
