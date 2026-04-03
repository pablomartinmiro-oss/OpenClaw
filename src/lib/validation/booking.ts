import { z } from "zod";

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

// ==================== SEASON CALENDAR ====================
export const seasonCalendarSchema = z.object({
  station: z.string().min(1).max(100),
  season: z.enum(["media", "alta"]),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  label: z.string().max(100).optional().nullable(),
});
