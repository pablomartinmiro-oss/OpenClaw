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
  priceType: z.enum(["per_day", "per_person_per_hour", "per_session", "fixed", "bundle"]),
  pricingMatrix: z.record(z.unknown()).nullable().optional(),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  // PORT-04: Catalog enrichment fields
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones").nullable().optional(),
  fiscalRegime: z.enum(["general", "reav", "mixed"]).default("general"),
  productType: z.enum(["experiencia", "actividad", "transporte", "alojamiento", "restauracion", "pack", "alquiler", "otro"]).nullable().optional(),
  providerPercent: z.number().min(0).max(100).nullable().optional(),
  agencyMarginPercent: z.number().min(0).max(100).nullable().optional(),
  supplierCommissionPercent: z.number().min(0).max(100).nullable().optional(),
  supplierCostType: z.enum(["percentage", "fixed", "margin", "hybrid"]).nullable().optional(),
  settlementFrequency: z.enum(["biweekly", "monthly", "quarterly"]).nullable().optional(),
  isSettlable: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(true),
  isPresentialSale: z.boolean().default(false),
  discountPercent: z.number().min(0).max(100).nullable().optional(),
  discountExpiresAt: z.coerce.date().nullable().optional(),
  coverImageUrl: z.string().url().max(2000).nullable().optional().or(z.literal("")),
  images: z.array(z.string().url()).default([]),
  includes: z.array(z.string().max(200)).nullable().optional(),
  excludes: z.array(z.string().max(200)).nullable().optional(),
  metaTitle: z.string().max(200).nullable().optional(),
  metaDescription: z.string().max(500).nullable().optional(),
  difficulty: z.enum(["facil", "intermedio", "avanzado", "experto"]).nullable().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const BULK_IMPORT_PRICE_TYPES = [
  "per_day",
  "per_person_per_hour",
  "per_session",
  "fixed",
  "bundle",
] as const;

const slugField = z
  .string()
  .min(1)
  .max(50)
  .regex(/^[a-z0-9_]+$/, "Debe ser un slug: letras minúsculas, números y guiones bajos");

const bulkProductRow = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(200),
  category: slugField.optional(),
  station: slugField.optional(),
  price: z
    .number({
      invalid_type_error: "El precio debe ser un número, no una cadena de texto",
    })
    .min(0)
    .max(1_000_000),
  priceType: z
    .enum(BULK_IMPORT_PRICE_TYPES, {
      errorMap: () => ({
        message: `priceType debe ser uno de: ${BULK_IMPORT_PRICE_TYPES.join(", ")}`,
      }),
    })
    .optional(),
  description: z.string().max(2000).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const bulkImportProductSchema = z.object({
  products: z
    .array(bulkProductRow)
    .min(1, "Se requiere al menos un producto")
    .max(500, "Máximo 500 productos por importación")
    .superRefine((products, ctx) => {
      const seen = new Set<string>();
      products.forEach((p, idx) => {
        const key = p.name.trim().toLowerCase();
        if (seen.has(key)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Nombre duplicado en el lote: "${p.name}"`,
            path: [idx, "name"],
          });
        }
        seen.add(key);
      });
    }),
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
