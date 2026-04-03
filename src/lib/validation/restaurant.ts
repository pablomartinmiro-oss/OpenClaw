import { z } from "zod";

// ==================== RESTAURANTS (VENUES) ====================
export const createRestaurantSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  capacity: z.number().int().min(0).default(0),
  depositPerGuest: z.coerce.number().min(0).default(0),
  operatingDays: z
    .array(z.number().int().min(0).max(6))
    .default([1, 2, 3, 4, 5]),
  description: z.string().max(2000).optional().nullable(),
  active: z.boolean().default(true),
});
export const updateRestaurantSchema = createRestaurantSchema.partial();

// ==================== SHIFTS ====================
export const createShiftSchema = z.object({
  restaurantId: z.string().min(1),
  name: z.string().min(1).max(100),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  maxCapacity: z.number().int().min(0).default(0),
  duration: z.number().int().min(15).max(480).default(90),
});
export const updateShiftSchema = createShiftSchema
  .partial()
  .omit({ restaurantId: true });

// ==================== CLOSURES ====================
export const createClosureSchema = z.object({
  restaurantId: z.string().min(1),
  date: z.coerce.date(),
  reason: z.string().max(500).optional().nullable(),
});

// ==================== BOOKINGS ====================
export const createRestaurantBookingSchema = z.object({
  restaurantId: z.string().min(1),
  clientId: z.string().optional().nullable(),
  date: z.coerce.date(),
  time: z.string().min(1),
  guestCount: z.number().int().min(1).max(100),
  specialRequests: z.string().max(2000).optional().nullable(),
  status: z
    .enum(["confirmed", "cancelled", "no_show"])
    .default("confirmed"),
  depositStatus: z.enum(["pending", "paid"]).default("pending"),
  operationalNotes: z.string().max(2000).optional().nullable(),
});
export const updateRestaurantBookingSchema =
  createRestaurantBookingSchema
    .partial()
    .omit({ restaurantId: true });

// ==================== STAFF ====================
export const assignStaffSchema = z.object({
  restaurantId: z.string().min(1),
  userId: z.string().min(1),
  role: z.enum(["staff", "manager", "chef"]).default("staff"),
});
