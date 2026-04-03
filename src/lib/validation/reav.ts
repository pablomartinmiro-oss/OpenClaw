import { z } from "zod";

// ==================== REAV EXPEDIENT ====================

export const createReavExpedientSchema = z.object({
  invoiceId: z.string().min(1),
  operationType: z
    .enum(["standard", "intra_eu", "extra_eu", "mixed"])
    .default("standard"),
  costPercentage: z.coerce.number().min(0).max(100).default(0),
  marginPercentage: z.coerce.number().min(0).max(100).default(0),
  marginAmount: z.coerce.number().min(0).default(0),
  taxableBase: z.coerce.number().min(0).default(0),
  vat: z.coerce.number().min(0).max(100).default(0),
});

export const updateReavExpedientSchema = z.object({
  operationType: z
    .enum(["standard", "intra_eu", "extra_eu", "mixed"])
    .optional(),
  costPercentage: z.coerce.number().min(0).max(100).optional(),
  marginPercentage: z.coerce.number().min(0).max(100).optional(),
  marginAmount: z.coerce.number().min(0).optional(),
  taxableBase: z.coerce.number().min(0).optional(),
  vat: z.coerce.number().min(0).max(100).optional(),
});

// ==================== REAV COST ====================

export const createReavCostSchema = z.object({
  description: z.string().min(1).max(500),
  cost: z.coerce.number().min(0),
  notes: z.string().max(2000).optional().nullable(),
});

// ==================== REAV DOCUMENT ====================

export const createReavDocumentSchema = z.object({
  type: z.enum(["client", "provider"]),
  url: z.string().url().min(1),
});
