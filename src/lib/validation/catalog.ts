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
