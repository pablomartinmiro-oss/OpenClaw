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

// ==================== EMAIL TEMPLATES ====================
export const createEmailTemplateSchema = z.object({
  templateKey: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  category: z.string().max(50).optional(),
  recipient: z.enum(["client", "admin", "both"]).optional(),
  subject: z.string().min(1).max(500),
  headerImageUrl: z.string().url().optional().or(z.literal("")),
  headerTitle: z.string().max(200).optional(),
  headerSubtitle: z.string().max(200).optional(),
  bodyHtml: z.string().min(1),
  footerText: z.string().max(500).optional(),
  ctaLabel: z.string().max(100).optional(),
  ctaUrl: z.string().url().optional().or(z.literal("")),
  variables: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const updateEmailTemplateSchema = createEmailTemplateSchema.partial();

export const createPdfTemplateSchema = z.object({
  templateKey: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  category: z.string().max(50).optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  headerColor: z.string().max(20).optional(),
  accentColor: z.string().max(20).optional(),
  companyName: z.string().max(200).optional(),
  companyAddress: z.string().max(500).optional(),
  companyPhone: z.string().max(30).optional(),
  companyEmail: z.string().email().optional().or(z.literal("")),
  companyNif: z.string().max(20).optional(),
  footerText: z.string().max(500).optional(),
  legalText: z.string().max(2000).optional(),
  showLogo: z.boolean().optional(),
  showWatermark: z.boolean().optional(),
  bodyHtml: z.string().min(1),
  variables: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const updatePdfTemplateSchema = createPdfTemplateSchema.partial();
// ==================== CONTACT FORM ====================
export const contactFormSchema = z.object({
  nombre: z.string().min(1).max(200),
  email: z.string().email(),
  telefono: z.string().max(30).optional(),
  asunto: z.string().max(200).default("Informacion general"),
  mensaje: z.string().min(1).max(10000),
  website: z.string().max(0).optional(), // honeypot — must be empty
});
