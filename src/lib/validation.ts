import { z } from "zod";

// ==================== PRODUCTS ====================
export const createProductSchema = z.object({
  category: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  station: z.string().max(50).default("all"),
  description: z.string().max(2000).nullable().optional(),
  personType: z.enum(["adulto", "infantil", "baby"]).nullable().optional(),
  tier: z.enum(["media_quality", "alta_quality"]).nullable().optional(),
  includesHelmet: z.boolean().default(false),
  price: z.coerce.number().min(0).max(100000),
  priceType: z.enum(["per_day", "per_person_per_hour", "per_session", "fixed"]),
  pricingMatrix: z.record(z.unknown()).nullable().optional(),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema.partial();

export const bulkImportProductSchema = z.object({
  products: z
    .array(
      z.object({
        name: z.string().min(1),
        category: z.string().optional(),
        station: z.string().optional(),
        price: z.number().min(0),
        priceType: z.string().optional(),
      })
    )
    .min(1)
    .max(500),
});

// ==================== QUOTES ====================
export const createQuoteSchema = z.object({
  clientName: z.string().min(1).max(200),
  clientEmail: z.string().email().optional().nullable(),
  clientPhone: z.string().max(30).optional().nullable(),
  clientNotes: z.string().max(5000).optional().nullable(),
  destination: z.string().min(1).max(100),
  checkIn: z.coerce.date(),
  checkOut: z.coerce.date(),
  adults: z.number().int().min(0).max(50).default(2),
  children: z.number().int().min(0).max(50).default(0),
  wantsAccommodation: z.boolean().default(false),
  wantsForfait: z.boolean().default(false),
  wantsClases: z.boolean().default(false),
  wantsEquipment: z.boolean().default(false),
  ghlContactId: z.string().optional().nullable(),
});

export const quoteItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(100),
  unitPrice: z.coerce.number().min(0),
  totalPrice: z.coerce.number().min(0),
  description: z.string().max(500).optional(),
  startDate: z.coerce.date().optional().nullable(),
  numDays: z.number().int().min(1).max(30).optional().nullable(),
  numPersons: z.number().int().min(1).max(50).optional().nullable(),
});

// ==================== RESERVATIONS ====================
export const createReservationSchema = z.object({
  clientName: z.string().min(1).max(200),
  clientEmail: z.string().email().optional().nullable(),
  clientPhone: z.string().max(30).optional().nullable(),
  station: z.string().min(1).max(100),
  date: z.coerce.date(),
  endDate: z.coerce.date().optional().nullable(),
  adultos: z.number().int().min(0).max(50).default(0),
  infantil: z.number().int().min(0).max(50).default(0),
  baby: z.number().int().min(0).max(50).default(0),
  notes: z.string().max(5000).optional().nullable(),
  source: z.string().max(100).optional().nullable(),
  totalPrice: z.coerce.number().min(0).optional(),
  status: z.enum(["pendiente", "confirmada", "cancelada", "no_disponible"]).default("pendiente"),
});

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

export const seasonCalendarSchema = z.object({
  station: z.string().min(1).max(100),
  season: z.enum(["media", "alta"]),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  label: z.string().max(100).optional().nullable(),
});

// ==================== CONTACT FORM ====================
export const contactFormSchema = z.object({
  nombre: z.string().min(1).max(200),
  email: z.string().email(),
  telefono: z.string().max(30).optional(),
  asunto: z.string().max(200).default("Información general"),
  mensaje: z.string().min(1).max(10000),
  website: z.string().max(0).optional(), // honeypot — must be empty
});

// ==================== HELPER ====================
/**
 * Validate request body against a Zod schema.
 * Returns { data } on success, { error, status: 400 } on failure.
 */
export function validateBody<T>(
  body: unknown,
  schema: z.ZodSchema<T>
): { ok: true; data: T } | { ok: false; error: string } {
  const result = schema.safeParse(body);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    return { ok: false, error: issues };
  }
  return { ok: true, data: result.data };
}
