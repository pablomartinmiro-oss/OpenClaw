import { z } from "zod";

// ==================== PRODUCTS ====================
export const createProductSchema = z.object({
  category: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  station: z.string().max(50).default("all"),
  description: z.string().max(2000).nullable().optional(),
  personType: z.enum(["adulto", "infantil", "baby"]).nullable().optional(),
  tier: z.enum(["media_quality", "alta_quality"]).nullable().optional(),
  includesHelmet: z.boolean().default(false),
  price: z.coerce.number().min(0).max(100000),
  priceType: z.enum(["per_day", "per_person_per_hour", "per_session", "fixed"]),
  pricingMatrix: z.record(z.unknown()).nullable().optional(),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema.partial();

export const bulkImportProductSchema = z.object({
  products: z
    .array(
      z.object({
        name: z.string().min(1),
        category: z.string().optional(),
        station: z.string().optional(),
        price: z.number().min(0),
        priceType: z.string().optional(),
      })
    )
    .min(1)
    .max(500),
});

// ==================== CATEGORIES ====================
export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/).optional(),
  parentId: z.string().optional().nullable(),
  sortOrder: z.number().int().min(0).default(0),
  image: z.string().max(500).optional().nullable(),
});
export const updateCategorySchema = createCategorySchema.partial();

// ==================== LOCATIONS ====================
export const createLocationSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/).optional(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
});
export const updateLocationSchema = createLocationSchema.partial();

// ==================== VARIANTS ====================
export const createVariantSchema = z.object({
  productId: z.string().min(1),
  label: z.string().min(1).max(200),
  priceModifier: z.number().default(0),
  priceType: z.enum(["fixed", "percentage"]).default("fixed"),
});
export const updateVariantSchema = createVariantSchema.partial().omit({ productId: true });

// ==================== TIME SLOTS ====================
export const createTimeSlotSchema = z.object({
  productId: z.string().min(1),
  type: z.enum(["fixed", "flexible", "range"]).default("fixed"),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  capacity: z.number().int().min(0).default(0),
  dayOfWeek: z.number().int().min(0).max(6).optional().nullable(),
  priceOverride: z.number().min(0).optional().nullable(),
});
export const updateTimeSlotSchema = createTimeSlotSchema.partial().omit({ productId: true });
