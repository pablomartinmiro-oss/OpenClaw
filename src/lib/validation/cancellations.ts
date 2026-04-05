import { z } from "zod";

// ==================== CANCELLATION REQUEST ====================

export const createCancellationRequestSchema = z.object({
  reservationId: z.string().optional().nullable(),
  quoteId: z.string().optional().nullable(),
  reason: z.string().max(2000).optional().nullable(),
});

export const updateCancellationStatusSchema = z.object({
  status: z.enum([
    "recibida",
    "en_revision",
    "pendiente_documentacion",
    "pendiente_decision",
    "resuelta",
    "cerrada",
  ]),
  resolution: z
    .enum(["rejected", "fully_accepted", "partially_accepted"])
    .optional(),
  financialStatus: z
    .enum(["devuelta_economicamente", "pendiente_devolucion", "bono_emitido"])
    .optional(),
  refundAmount: z.number().min(0).optional(),
  notes: z.string().max(2000).optional(),
});

// ==================== RESOLVE ====================

export const resolveCancellationSchema = z.object({
  resolution: z.enum(["rejected", "fully_accepted", "partially_accepted"]),
  refundAmount: z.number().min(0).optional(),
  issueVoucher: z.boolean().default(false),
  voucherType: z.enum(["activity", "monetary", "service"]).optional(),
  voucherValue: z.number().min(0).optional(),
  voucherExpiration: z.coerce.date().optional().nullable(),
  notes: z.string().max(2000).optional(),
});

// ==================== VOUCHER LIFECYCLE ====================

export const extendVoucherSchema = z.object({
  newExpirationDate: z.coerce.date(),
});

export const resendVoucherEmailSchema = z.object({
  email: z.string().email(),
});
