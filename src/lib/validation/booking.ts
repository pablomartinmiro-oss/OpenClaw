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

export const updateQuoteSchema = z.object({
  status: z.enum(["nuevo", "borrador", "enviado", "pagado", "expirado", "cancelado"]).optional(),
  totalAmount: z.coerce.number().min(0).optional(),
  expiresAt: z.coerce.date().optional().nullable(),
  sentAt: z.coerce.date().optional().nullable(),
  clientNotes: z.string().max(5000).optional().nullable(),
});

const quoteItemReplaceSchema = z.object({
  productId: z.string().optional().nullable(),
  name: z.string().min(1).max(500),
  description: z.string().max(500).optional().nullable(),
  category: z.string().max(100).optional().nullable(),
  unitPrice: z.coerce.number().min(0),
  quantity: z.coerce.number().int().min(1).max(100).optional(),
  discount: z.coerce.number().min(0).max(100).optional(),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
  numDays: z.coerce.number().int().min(1).max(30).optional().nullable(),
  numPersons: z.coerce.number().int().min(1).max(50).optional().nullable(),
  ageDetails: z.unknown().optional(),
  modalidad: z.string().max(100).optional().nullable(),
  nivel: z.string().max(100).optional().nullable(),
  sector: z.string().max(100).optional().nullable(),
  idioma: z.string().max(100).optional().nullable(),
  horario: z.string().max(100).optional().nullable(),
  puntoEncuentro: z.string().max(200).optional().nullable(),
  tipoCliente: z.string().max(100).optional().nullable(),
  gama: z.string().max(100).optional().nullable(),
  casco: z.boolean().optional().nullable(),
  tipoActividad: z.string().max(100).optional().nullable(),
  regimen: z.string().max(100).optional().nullable(),
  alojamientoNombre: z.string().max(200).optional().nullable(),
  seguroIncluido: z.boolean().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const bulkReplaceQuoteItemsSchema = z.object({
  items: z.array(quoteItemReplaceSchema).max(50),
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

// ==================== ACTIVITY BOOKINGS ====================
export const createActivityBookingSchema = z.object({
  reservationId: z.string().min(1),
  activityDate: z.coerce.date(),
  status: z.enum(["scheduled", "pending", "confirmed", "cancelled"]).default("scheduled"),
  operationalNotes: z.string().max(2000).optional().nullable(),
});
export const updateActivityBookingSchema = z.object({
  status: z.enum(["scheduled", "pending", "confirmed", "cancelled", "incident"]).optional(),
  operationalNotes: z.string().max(2000).optional().nullable(),
  arrivedClient: z.boolean().optional(),
});

// ==================== BOOKING MONITORS ====================
export const assignMonitorSchema = z.object({
  bookingId: z.string().min(1),
  userId: z.string().min(1),
});

// ==================== DAILY ORDERS ====================
export const createDailyOrderSchema = z.object({
  date: z.coerce.date(),
  notes: z.string().max(5000).optional().nullable(),
});
export const updateDailyOrderSchema = z.object({
  notes: z.string().max(5000).optional().nullable(),
});

// ==================== APPLY DISCOUNT ====================
export const applyReservationDiscountSchema = z.object({
  code: z.string().min(1).max(50),
});

// ==================== ACTIVITY INCIDENT ====================
export const flagActivityIncidentSchema = z.object({
  incidentNotes: z.string().min(1).max(2000),
});

// ==================== CLIENTS ====================
export const createClientSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  birthDate: z.coerce.date().optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
  conversionSource: z.string().max(100).optional().nullable(),
});
export const updateClientSchema = createClientSchema.partial();
