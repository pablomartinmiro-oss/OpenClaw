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

// ==================== LODGE STAYS ====================
export const lodgeStayStatus = z.enum([
  "reservada",
  "checkin",
  "checkout",
  "cancelada",
]);

export const createLodgeStaySchema = z.object({
  guestName: z.string().min(1).max(200),
  guestEmail: z.string().email().optional().nullable(),
  guestPhone: z.string().max(50).optional().nullable(),
  roomTypeId: z.string().optional().nullable(),
  checkIn: z.coerce.date(),
  checkOut: z.coerce.date(),
  adults: z.number().int().min(1).max(20).default(1),
  children: z.number().int().min(0).max(20).default(0),
  totalAmount: z.coerce.number().min(0).default(0),
  status: lodgeStayStatus.default("reservada"),
  notes: z.string().max(2000).optional().nullable(),
});
export const updateLodgeStaySchema = createLodgeStaySchema.partial();
