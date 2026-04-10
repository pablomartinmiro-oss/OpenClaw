import { z } from "zod";

// ==================== AUTH ====================
export const registerSchema = z.object({
  email: z.string().trim().email("Formato de email inválido").transform((v) => v.toLowerCase()),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(128)
    .regex(/[A-Z]/, "La contraseña debe contener al menos una letra mayúscula")
    .regex(/[a-z]/, "La contraseña debe contener al menos una letra minúscula")
    .regex(/[0-9]/, "La contraseña debe contener al menos un número"),
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

// ==================== CONTACT FORM ====================
export const contactFormSchema = z.object({
  nombre: z.string().min(1).max(200),
  email: z.string().email(),
  telefono: z.string().max(30).optional(),
  asunto: z.string().max(200).default("Informacion general"),
  mensaje: z.string().min(1).max(10000),
  website: z.string().max(0).optional(), // honeypot — must be empty
});
