import { z } from "zod";

// ==================== DISCOUNT CODES ====================
export const createDiscountCodeSchema = z.object({
  code: z
    .string()
    .min(1, "El codigo es obligatorio")
    .max(50)
    .transform((v) => v.toUpperCase().trim()),
  type: z.enum(["percentage", "fixed"]),
  value: z.coerce.number().positive("El valor debe ser mayor a 0"),
  expirationDate: z.coerce.date().optional().nullable(),
  maxUses: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const updateDiscountCodeSchema = createDiscountCodeSchema.partial();

export const applyDiscountSchema = z.object({
  code: z
    .string()
    .min(1, "El codigo es obligatorio")
    .transform((v) => v.toUpperCase().trim()),
  amount: z.coerce.number().positive("El importe debe ser mayor a 0"),
});

// ==================== COMPENSATION VOUCHERS ====================
export const createCompensationVoucherSchema = z.object({
  cancellationId: z.string().optional().nullable(),
  type: z.enum(["activity", "monetary", "service"]),
  value: z.coerce.number().positive("El valor debe ser mayor a 0"),
  expirationDate: z.coerce.date().optional().nullable(),
  linkedDiscountCodeId: z.string().optional().nullable(),
});

export const updateCompensationVoucherSchema = z.object({
  isUsed: z.boolean().optional(),
  type: z.enum(["activity", "monetary", "service"]).optional(),
  value: z.coerce.number().positive().optional(),
  expirationDate: z.coerce.date().optional().nullable(),
  linkedDiscountCodeId: z.string().optional().nullable(),
});

// ==================== STOREFRONT CART ====================
export const addToCartSchema = z.object({
  cartId: z.string().optional(),
  productId: z.string().min(1),
  productName: z.string().min(1).max(200),
  quantity: z.number().int().min(1).max(50).default(1),
  unitPrice: z.coerce.number().min(0),
  variant: z.string().max(200).optional(),
  date: z.string().optional(),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1).max(50),
});

export const checkoutSchema = z.object({
  cartId: z.string().min(1),
  clientName: z.string().min(1).max(200),
  clientEmail: z.string().email(),
  clientPhone: z.string().max(30).optional(),
});
