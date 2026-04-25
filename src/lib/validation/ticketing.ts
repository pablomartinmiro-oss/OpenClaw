import { z } from "zod";

// ==================== EXTERNAL PLATFORMS ====================

export const createPlatformSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(200),
  type: z.enum(["coupon", "affiliate"]).default("coupon"),
  commissionPercentage: z.coerce.number().min(0).max(100).default(0),
  active: z.boolean().default(true),
});
export const updatePlatformSchema = createPlatformSchema.partial();

// ==================== PLATFORM PRODUCTS ====================

export const createPlatformProductSchema = z.object({
  productId: z.string().min(1, "El producto es obligatorio"),
  externalId: z.string().max(200).optional().nullable(),
  externalUrl: z.string().url().max(2000).optional().nullable(),
  status: z.enum(["active", "paused", "removed"]).default("active"),
});
export const updatePlatformProductSchema = z.object({
  externalId: z.string().max(200).optional().nullable(),
  externalUrl: z.string().url().max(2000).optional().nullable(),
  status: z.enum(["active", "paused", "removed"]).optional(),
});

// ==================== COUPON REDEMPTIONS ====================

export const REDEMPTION_STATUSES = [
  "received",
  "pending",
  "pendiente",
  "confirmado",
  "completado",
  "cancelado",
  "reservation_generated",
] as const;

const skiEnrichmentFields = {
  customerName: z.string().max(200).optional().nullable(),
  platformId: z.string().optional().nullable(),
  productId: z.string().optional().nullable(),
  skiLevel: z.string().max(50).optional().nullable(),
  bootSize: z.string().max(20).optional().nullable(),
  height: z.coerce.number().int().min(50).max(250).optional().nullable(),
  numPeople: z.coerce.number().int().min(1).max(50).default(1),
  preferredDate: z.coerce.date().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
} as const;

export const createCouponRedemptionSchema = z.object({
  code: z.string().min(1, "El codigo es obligatorio").max(100),
  email: z.string().email().max(200).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  status: z.enum(REDEMPTION_STATUSES).default("pendiente"),
  financialStatus: z
    .enum(["pending", "redeemed", "incident"])
    .default("pending"),
  ocrExtraction: z.record(z.unknown()).optional().nullable(),
  reservationId: z.string().optional().nullable(),
  redeemedAt: z.coerce.date().optional().nullable(),
  ...skiEnrichmentFields,
});

export const updateCouponRedemptionSchema = z.object({
  code: z.string().min(1).max(100).optional(),
  email: z.string().email().max(200).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  status: z.enum(REDEMPTION_STATUSES).optional(),
  financialStatus: z
    .enum(["pending", "redeemed", "incident"])
    .optional(),
  ocrExtraction: z.record(z.unknown()).optional().nullable(),
  reservationId: z.string().optional().nullable(),
  redeemedAt: z.coerce.date().optional().nullable(),
  customerName: z.string().max(200).optional().nullable(),
  platformId: z.string().optional().nullable(),
  productId: z.string().optional().nullable(),
  skiLevel: z.string().max(50).optional().nullable(),
  bootSize: z.string().max(20).optional().nullable(),
  height: z.coerce.number().int().min(50).max(250).optional().nullable(),
  numPeople: z.coerce.number().int().min(1).max(50).optional(),
  preferredDate: z.coerce.date().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

// ==================== PUBLIC REDEEM ====================

export const publicRedeemSchema = z.object({
  tenantSlug: z.string().min(1).max(200).optional(),
  tenantId: z.string().optional(),
  platformId: z.string().min(1, "La plataforma es obligatoria"),
  code: z.string().min(1, "El codigo es obligatorio").max(100),
  productId: z.string().optional().nullable(),
  customerName: z.string().min(1, "El nombre es obligatorio").max(200),
  email: z.string().email("Email invalido").max(200),
  phone: z.string().max(50).optional().nullable(),
  skiLevel: z.string().max(50).optional().nullable(),
  bootSize: z.string().max(20).optional().nullable(),
  height: z.coerce.number().int().min(50).max(250).optional().nullable(),
  numPeople: z.coerce.number().int().min(1).max(50).default(1),
  preferredDate: z.coerce.date().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  // honeypot
  website: z.string().max(0).optional(),
});

// ==================== COUPON EMAIL CONFIG ====================

export const createCouponEmailConfigSchema = z.object({
  templateId: z.string().min(1, "El ID de plantilla es obligatorio").max(200),
  eventTrigger: z.string().min(1, "El evento es obligatorio").max(100),
  enabled: z.boolean().default(true),
});
export const updateCouponEmailConfigSchema = z.object({
  templateId: z.string().min(1).max(200).optional(),
  eventTrigger: z.string().min(1).max(100).optional(),
  enabled: z.boolean().optional(),
});

// ==================== BATCH COUPON SUBMISSION ====================

export const batchCouponSubmissionSchema = z.object({
  coupons: z
    .array(
      z.object({
        code: z.string().min(1),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        platformId: z.string().optional(),
        imageBase64: z.string().optional(),
      })
    )
    .min(1)
    .max(10),
});
