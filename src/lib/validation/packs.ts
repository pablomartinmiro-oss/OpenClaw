import { z } from "zod";

// ==================== LEGO PACK ====================

export const createLegoPackSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  categoryId: z.string().optional().nullable(),
  price: z.coerce.number().min(0).default(0),
  images: z.array(z.string()).default([]),
  description: z.string().max(2000).optional().nullable(),
  isActive: z.boolean().default(true),
});

export const updateLegoPackSchema = createLegoPackSchema.partial();

// ==================== LEGO PACK LINE ====================

export const createLegoPackLineSchema = z.object({
  productId: z.string().optional().nullable(),
  roomTypeId: z.string().optional().nullable(),
  treatmentId: z.string().optional().nullable(),
  quantity: z.number().int().min(1).default(1),
  isRequired: z.boolean().default(true),
  isOptional: z.boolean().default(false),
  isClientEditable: z.boolean().default(false),
  overridePrice: z.coerce.number().min(0).optional().nullable(),
  sortOrder: z.number().int().min(0).default(0),
});

export const updateLegoPackLineSchema = createLegoPackLineSchema.partial();
