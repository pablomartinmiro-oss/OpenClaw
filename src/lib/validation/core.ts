import { z } from "zod";

// ==================== AUTH ====================
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(200),
  companyName: z.string().min(1).max(200).optional(),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens")
    .optional(),
  inviteToken: z.string().optional(),
});

// ==================== SETTINGS ====================
export const updateTenantSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  dataMode: z.enum(["mock", "live"]).optional(),
});

export const inviteTeamMemberSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(200),
  roleId: z.string().min(1),
});

// ==================== DOCUMENT NUMBERING ====================
export const updateDocNumberPrefixSchema = z.object({
  prefix: z
    .string()
    .min(1, "El prefijo no puede estar vacío")
    .max(10, "El prefijo no puede superar 10 caracteres")
    .regex(/^[A-Z0-9-]+$/, "Solo mayúsculas, números y guiones"),
});

export const resetDocCounterSchema = z.object({
  newValue: z
    .number()
    .int("Debe ser un número entero")
    .min(0, "El valor no puede ser negativo"),
});

// ==================== CONTACT FORM ====================
export const contactFormSchema = z.object({
  nombre: z.string().min(1).max(200),
  email: z.string().email(),
  telefono: z.string().max(30).optional(),
  asunto: z.string().max(200).default("Informacion general"),
  mensaje: z.string().min(1).max(10000),
  website: z.string().max(0).optional(), // honeypot — must be empty
});
