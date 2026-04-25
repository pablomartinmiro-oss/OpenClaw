import { z } from "zod";

// ==================== ENUMS ====================

export const equipmentTypeEnum = z.enum([
  "SKI", "BOOT", "POLE", "HELMET", "SNOWBOARD", "SNOWBOARD_BOOT",
]);

export const qualityTierEnum = z.enum(["media", "alta"]);

export const abilityLevelEnum = z.enum([
  "beginner", "intermediate", "advanced", "expert",
]);

// ==================== RENTAL INVENTORY ====================

export const inventoryConditionEnum = z.enum([
  "bueno",
  "dañado",
  "mantenimiento",
  "baja",
]);

export const createRentalInventorySchema = z.object({
  stationSlug: z.string().min(1),
  equipmentType: equipmentTypeEnum,
  size: z.string().min(1).max(20),
  qualityTier: qualityTierEnum,
  totalQuantity: z.number().int().min(0),
  availableQuantity: z.number().int().min(0),
  minStockAlert: z.number().int().min(0).default(5),
  condition: inventoryConditionEnum.optional(),
  lastMaintenanceAt: z.coerce.date().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});
export const updateRentalInventorySchema =
  createRentalInventorySchema.partial();

// ==================== RENTAL ORDER ====================

export const createRentalOrderSchema = z.object({
  reservationId: z.string().optional().nullable(),
  clientName: z.string().min(1).max(200),
  clientEmail: z.string().email().optional().nullable(),
  clientPhone: z.string().max(30).optional().nullable(),
  stationSlug: z.string().min(1),
  pickupDate: z.coerce.date(),
  returnDate: z.coerce.date(),
  totalPrice: z.coerce.number().min(0).default(0),
  discount: z.coerce.number().min(0).max(100).default(0),
  notes: z.string().max(2000).optional().nullable(),
  internalNotes: z.string().max(2000).optional().nullable(),
});
export const updateRentalOrderSchema = createRentalOrderSchema
  .partial()
  .extend({
    status: z
      .enum([
        "RESERVED", "PREPARED", "PICKED_UP",
        "RETURNED", "INSPECTED", "CANCELLED",
      ])
      .optional(),
    paymentStatus: z
      .enum(["pending", "paid", "partial", "refunded"])
      .optional(),
  });

// ==================== RENTAL ORDER ITEM ====================

export const createRentalOrderItemSchema = z.object({
  participantName: z.string().min(1).max(200),
  equipmentType: equipmentTypeEnum,
  size: z.string().max(20).optional().nullable(),
  qualityTier: qualityTierEnum,
  dinSetting: z.coerce.number().min(0.5).max(16).optional().nullable(),
  unitPrice: z.coerce.number().min(0).default(0),
});
export const updateRentalOrderItemSchema = z.object({
  size: z.string().max(20).optional().nullable(),
  dinSetting: z.coerce.number().min(0.5).max(16).optional().nullable(),
  itemStatus: z
    .enum(["RESERVED", "ASSIGNED", "PICKED_UP", "RETURNED", "DAMAGED"])
    .optional(),
  conditionOnReturn: z
    .enum(["OK", "NEEDS_SERVICE", "DAMAGED"])
    .optional()
    .nullable(),
  damageNotes: z.string().max(2000).optional().nullable(),
  unitPrice: z.coerce.number().min(0).optional(),
});

// ==================== CUSTOMER SIZING PROFILE ====================

export const createCustomerSizingProfileSchema = z.object({
  clientEmail: z.string().email(),
  clientName: z.string().min(1).max(200),
  clientPhone: z.string().max(30).optional().nullable(),
  height: z.coerce.number().min(50).max(250).optional().nullable(),
  weight: z.coerce.number().min(10).max(200).optional().nullable(),
  shoeSize: z.string().max(10).optional().nullable(),
  age: z.coerce.number().int().min(2).max(100).optional().nullable(),
  abilityLevel: abilityLevelEnum.optional().nullable(),
  bootSoleLength: z.coerce
    .number()
    .min(150)
    .max(400)
    .optional()
    .nullable(),
  preferredDinSetting: z.coerce
    .number()
    .min(0.5)
    .max(16)
    .optional()
    .nullable(),
  notes: z.string().max(2000).optional().nullable(),
});
export const updateCustomerSizingProfileSchema =
  createCustomerSizingProfileSchema.partial();

// ==================== PICKUP / RETURN ACTIONS ====================

export const pickupActionSchema = z.object({
  items: z.array(
    z.object({
      itemId: z.string().min(1),
      size: z.string().min(1),
      dinSetting: z.coerce
        .number()
        .min(0.5)
        .max(16)
        .optional()
        .nullable(),
    })
  ),
  notes: z.string().max(2000).optional(),
  depositCents: z.coerce.number().int().min(0).optional(),
  signatureUrl: z.string().max(2000).optional().nullable(),
});

export const returnActionSchema = z.object({
  items: z.array(
    z.object({
      itemId: z.string().min(1),
      conditionOnReturn: z.enum(["OK", "NEEDS_SERVICE", "DAMAGED"]),
      damageNotes: z.string().max(2000).optional().nullable(),
    })
  ),
  notes: z.string().max(2000).optional(),
  damageNotes: z.string().max(2000).optional().nullable(),
  depositReturned: z.boolean().optional(),
});
