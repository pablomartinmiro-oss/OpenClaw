import { z } from "zod";

// ==================== ROOM TYPES ====================
export const createRoomTypeSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  capacity: z.number().int().min(1).max(50),
  basePrice: z.coerce.number().min(0),
  description: z.string().max(2000).optional().nullable(),
  images: z.array(z.string()).default([]),
  active: z.boolean().default(true),
});
export const updateRoomTypeSchema = createRoomTypeSchema.partial();

// ==================== RATE SEASONS ====================
export const createRoomRateSeasonSchema = z.object({
  name: z.string().min(1).max(100),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});
export const updateRoomRateSeasonSchema =
  createRoomRateSeasonSchema.partial();

// ==================== RATES ====================
export const createRoomRateSchema = z.object({
  roomTypeId: z.string().min(1),
  seasonId: z.string().min(1),
  dayOfWeek: z.number().int().min(0).max(6),
  price: z.coerce.number().min(0),
  supplement: z.coerce.number().default(0),
});
export const updateRoomRateSchema = z.object({
  price: z.coerce.number().min(0).optional(),
  supplement: z.coerce.number().optional(),
});

// Bulk rate set: all 7 days for a roomType+season
export const bulkSetRatesSchema = z.object({
  roomTypeId: z.string().min(1),
  seasonId: z.string().min(1),
  rates: z
    .array(
      z.object({
        dayOfWeek: z.number().int().min(0).max(6),
        price: z.coerce.number().min(0),
        supplement: z.coerce.number().default(0),
      })
    )
    .min(1)
    .max(7),
});

// ==================== BLOCKS ====================
export const createRoomBlockSchema = z.object({
  roomTypeId: z.string().min(1),
  date: z.coerce.date(),
  unitCount: z.number().int().min(0).default(0),
  reason: z
    .enum(["closure", "reduced_capacity", "maintenance"])
    .default("closure"),
});
export const updateRoomBlockSchema = z.object({
  unitCount: z.number().int().min(0).optional(),
  reason: z
    .enum(["closure", "reduced_capacity", "maintenance"])
    .optional(),
});
