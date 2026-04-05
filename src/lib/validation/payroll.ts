import { z } from "zod";

// ==================== PAYROLL RECORD ====================

export const createPayrollSchema = z.object({
  userId: z.string().min(1, "El empleado es obligatorio"),
  year: z.number().int().min(2020).max(2050),
  month: z.number().int().min(1).max(12),
  baseSalary: z.coerce.number().min(0).default(0),
  notes: z.string().max(2000).optional().nullable(),
});

export const updatePayrollSchema = z.object({
  baseSalary: z.coerce.number().min(0).optional(),
  status: z.enum(["draft", "approved", "paid"]).optional(),
  notes: z.string().max(2000).optional().nullable(),
});

// ==================== PAYROLL EXTRA ====================

export const createPayrollExtraSchema = z.object({
  concept: z.string().min(1, "El concepto es obligatorio").max(200),
  type: z.enum(["bonus", "deduction", "commission", "overtime"]).default("bonus"),
  amount: z.coerce.number(),
});
