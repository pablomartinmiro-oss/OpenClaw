import { z } from "zod";

// ==================== INVOICES ====================
export const createInvoiceSchema = z.object({
  clientId: z.string().optional().nullable(),
  reservationId: z.string().optional().nullable(),
  status: z.enum(["draft", "sent", "paid", "cancelled"]).default("draft"),
  notes: z.string().max(2000).optional().nullable(),
  lines: z.array(z.object({
    description: z.string().min(1).max(500),
    quantity: z.number().int().min(1).default(1),
    unitPrice: z.coerce.number(),
    taxRate: z.coerce.number().min(0).max(100).default(21),
    fiscalRegime: z.enum(["general", "reav"]).default("general"),
  })).min(1),
});
export const updateInvoiceSchema = z.object({
  status: z.enum(["draft", "sent", "paid", "cancelled"]).optional(),
  notes: z.string().max(2000).optional().nullable(),
  clientId: z.string().optional().nullable(),
});

// ==================== TRANSACTIONS ====================
export const createTransactionSchema = z.object({
  invoiceId: z.string().optional().nullable(),
  date: z.coerce.date(),
  amount: z.coerce.number(),
  method: z.enum(["card", "transfer", "cash", "bizum"]),
  status: z.enum(["pending", "completed", "failed"]).default("pending"),
  reference: z.string().max(200).optional().nullable(),
});
export const updateTransactionSchema = z.object({
  status: z.enum(["pending", "completed", "failed"]).optional(),
  reference: z.string().max(200).optional().nullable(),
});

// ==================== COST CENTERS ====================
export const createCostCenterSchema = z.object({
  name: z.string().min(1).max(200),
  code: z.string().min(1).max(50),
  active: z.boolean().default(true),
});
export const updateCostCenterSchema = createCostCenterSchema.partial();

// ==================== EXPENSE CATEGORIES ====================
export const createExpenseCategorySchema = z.object({
  name: z.string().min(1).max(200),
  code: z.string().min(1).max(50),
});
export const updateExpenseCategorySchema = createExpenseCategorySchema.partial();

// ==================== EXPENSES ====================
export const createExpenseSchema = z.object({
  date: z.coerce.date(),
  categoryId: z.string().min(1),
  costCenterId: z.string().optional().nullable(),
  concept: z.string().min(1).max(500),
  amount: z.coerce.number().min(0),
  paymentMethod: z.enum(["cash", "card", "transfer", "direct_debit"]).default("transfer"),
  status: z.enum(["pending", "justified", "accounted"]).default("pending"),
  supplierId: z.string().optional().nullable(),
});
export const updateExpenseSchema = createExpenseSchema.partial();

// ==================== RECURRING EXPENSES ====================
export const createRecurringExpenseSchema = z.object({
  expenseId: z.string().min(1),
  pattern: z.enum(["weekly", "biweekly", "monthly"]),
  nextDueDate: z.coerce.date(),
  active: z.boolean().default(true),
});
export const updateRecurringExpenseSchema = z.object({
  pattern: z.enum(["weekly", "biweekly", "monthly"]).optional(),
  nextDueDate: z.coerce.date().optional(),
  active: z.boolean().optional(),
});
