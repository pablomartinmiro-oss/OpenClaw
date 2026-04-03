import { z } from "zod";

// ==================== SUPPLIER ====================

export const createSupplierSchema = z.object({
  fiscalName: z.string().min(1).max(300),
  commercialName: z.string().max(300).optional().nullable(),
  nif: z.string().min(1).max(20),
  iban: z.string().max(34).optional().nullable(),
  email: z.string().email().max(255).optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  commissionPercentage: z.coerce.number().min(0).max(100).default(0),
  paymentMethod: z.enum(["transfer", "card"]).default("transfer"),
  settlementFrequency: z
    .enum(["biweekly", "monthly", "quarterly"])
    .default("monthly"),
  status: z.enum(["active", "inactive", "blocked"]).default("active"),
});
export const updateSupplierSchema = createSupplierSchema.partial();

// ==================== SETTLEMENT ====================

export const createSettlementSchema = z.object({
  supplierId: z.string().min(1),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  status: z.enum(["draft", "sent", "paid"]).default("draft"),
  pdfUrl: z.string().url().optional().nullable(),
});

export const updateSettlementSchema = z.object({
  status: z.enum(["draft", "sent", "paid"]).optional(),
  pdfUrl: z.string().url().optional().nullable(),
  reason: z.string().max(500).optional().nullable(),
});

// ==================== SETTLEMENT LINE ====================

export const createSettlementLineSchema = z.object({
  serviceType: z.enum(["activity", "hotel", "restaurant", "spa"]),
  productId: z.string().optional().nullable(),
  serviceDate: z.coerce.date(),
  paxCount: z.number().int().min(1).default(1),
  saleAmount: z.coerce.number().min(0),
  commissionPercentage: z.coerce.number().min(0).max(100),
  commissionAmount: z.coerce.number().min(0),
  reservationId: z.string().optional().nullable(),
  invoiceId: z.string().optional().nullable(),
});

// ==================== SETTLEMENT DOCUMENT ====================

export const createSettlementDocumentSchema = z.object({
  url: z.string().url().min(1),
});
