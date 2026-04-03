import { z } from "zod";

// ==================== CASH REGISTERS ====================
export const createCashRegisterSchema = z.object({
  name: z.string().min(1).max(200),
  location: z.string().max(500).optional().nullable(),
  active: z.boolean().default(true),
});
export const updateCashRegisterSchema = createCashRegisterSchema.partial();

// ==================== CASH SESSIONS ====================
export const openCashSessionSchema = z.object({
  registerId: z.string().min(1),
  openingAmount: z.coerce.number().min(0).default(0),
});

export const closeCashSessionSchema = z.object({
  closingAmount: z.coerce.number().min(0),
  totalCash: z.coerce.number().min(0).default(0),
  totalCard: z.coerce.number().min(0).default(0),
  totalBizum: z.coerce.number().min(0).default(0),
});

// ==================== CASH MOVEMENTS ====================
export const createCashMovementSchema = z.object({
  sessionId: z.string().min(1),
  type: z.enum(["in", "out"]),
  amount: z.coerce.number().positive(),
  reason: z.string().min(1).max(500),
});

// ==================== TPV SALES ====================
const tpvSaleItemSchema = z.object({
  productId: z.string().optional().nullable(),
  description: z.string().min(1).max(500),
  quantity: z.number().int().min(1).default(1),
  unitPrice: z.coerce.number().min(0),
  discountAmount: z.coerce.number().min(0).optional().nullable(),
  fiscalRegime: z.enum(["general", "reav"]).default("general"),
  taxRate: z.coerce.number().min(0).max(100).default(21),
});

export const createTpvSaleSchema = z.object({
  sessionId: z.string().min(1),
  date: z.coerce.date().optional(),
  discountApplied: z.coerce.number().min(0).optional().nullable(),
  paymentMethods: z
    .object({
      cash: z.coerce.number().min(0).default(0),
      card: z.coerce.number().min(0).default(0),
      bizum: z.coerce.number().min(0).default(0),
    })
    .default({ cash: 0, card: 0, bizum: 0 }),
  clientId: z.string().optional().nullable(),
  items: z.array(tpvSaleItemSchema).min(1),
});

export const updateTpvSaleSchema = z.object({
  discountApplied: z.coerce.number().min(0).optional().nullable(),
  paymentMethods: z
    .object({
      cash: z.coerce.number().min(0).default(0),
      card: z.coerce.number().min(0).default(0),
      bizum: z.coerce.number().min(0).default(0),
    })
    .optional(),
  clientId: z.string().optional().nullable(),
});
