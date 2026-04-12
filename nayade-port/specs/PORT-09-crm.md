# PORT-09: CRM Enhancement (Leads + Pipeline)

## Decision: 🔧 Adaptar | Complejidad: XL

## Estado actual OpenClaw

CRM orientado a GHL: CachedContact, CachedConversation, CachedOpportunity, CachedPipeline. Sync bidireccional con GHL. Quotes y Reservations propios. No hay lead pipeline interno.

## Que aporta Nayade

### Lead Pipeline completo
- Leads con estados (nuevo/contactado/qualified/propuesta/negociacion/ganado/perdido)
- Priority levels, assignment, internal notes (JSON array), activity log
- Auto-generation de quotes desde leads (`activitiesJson`)
- Preview de lineas antes de generar
- Conversion metrics y counters

### Quote Enhancement
- `quoteNumber` secuencial (FAC-2026-XXXX)
- `paymentLinkToken` + `paymentLinkUrl` (link unico para pagar)
- Transfer payment confirmation (proof upload + admin validation)
- Auto-reminders (48h, max 2)
- Status workflow rico: borrador → enviado → visto → aceptado → pago_pendiente → pagado → facturado

### Activity Log
- Audit trail per entity (lead, quote, reservation, invoice)
- Actions: created, updated, status_changed, email_sent, payment_received, etc.

### Pending Payments
- Tracking de pagos pendientes con due date
- Reminder emails automaticos
- Admin dashboard de pagos por cobrar

### Clients Enhancement
- Nayade `clients` tiene: nif, address, city, postalCode, country, tags, isConverted, totalBookings, totalSpent, lastBookingAt
- Upsert automatico from reservations

## Archivos fuente Nayade

| Archivo | Proposito |
|---------|-----------|
| `server/routers/crm.ts` | Router principal: leads (7 endpoints), quotes (12+), reservations (8+), invoices (6+), clients (5), dashboard, pendingPayments, timeline |
| `server/db.ts` → funciones CRM | `createLead`, `createBooking`, `createReservation`, `getAllReservations`, `upsertClientFromReservation`, `postConfirmOperation` |
| `server/reservationEmails.ts` | Post-payment notifications |
| `server/quoteReminderJob.ts` | Cron: resend quotes after 48h |
| `drizzle/schema.ts` → `leads`, `crm_activity_log`, `pending_payments` | Schema |
| `client/src/pages/admin/crm/CRMDashboard.tsx` | CRM hub UI |
| `client/src/pages/admin/crm/ClientsManager.tsx` | Clients UI |

## Tablas Drizzle → Prisma (+ tenantId)

### Modelos nuevos

```prisma
model Lead {
  id                String    @id @default(cuid())
  tenantId          String
  name              String
  email             String?
  phone             String?
  company           String?
  message           String?
  experienceId      String?   // Product they're interested in
  locationId        String?
  preferredDate     DateTime?
  numberOfPersons   Int?
  numberOfAdults    Int?
  numberOfChildren  Int?
  budget            Float?
  source            String?   // "web" | "phone" | "referral" | "partner"
  selectedCategory  String?
  selectedProduct   String?
  activitiesJson    Json?     // Raw activity preferences for auto-quote
  status            String    @default("nuevo") // nuevo | contactado | qualified | propuesta | negociacion | ganado | perdido
  opportunityStatus String?
  priority          String    @default("media") // baja | media | alta | urgente
  assignedTo        String?   // userId
  lastContactAt     DateTime?
  lostReason        String?
  seenAt            DateTime?
  internalNotes     Json?     @default("[]") // [{text, author, date}]
  ghlContactId      String?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId, status])
  @@index([tenantId, assignedTo])
  @@index([tenantId, createdAt])
}

model CrmActivityLog {
  id         String   @id @default(cuid())
  tenantId   String
  entityType String   // "lead" | "quote" | "reservation" | "invoice"
  entityId   String
  action     String   // "created" | "updated" | "status_changed" | "email_sent" | "payment_received"
  actorId    String?
  actorName  String?
  details    Json?    // {oldStatus, newStatus, note, etc.}
  createdAt  DateTime @default(now())

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId, entityType, entityId])
  @@index([tenantId, createdAt])
}

model PendingPayment {
  id              String    @id @default(cuid())
  tenantId        String
  quoteId         String?
  reservationId   String?
  clientName      String
  clientEmail     String?
  clientPhone     String?
  productName     String?
  amountCents     Int
  dueDate         DateTime?
  reason          String?
  status          String    @default("pending") // "pending" | "reminded" | "paid" | "cancelled"
  paymentMethod   String?
  paymentNote     String?
  transferProofUrl String?
  paidAt          DateTime?
  reminderSentAt  DateTime?
  createdBy       String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId, status])
  @@index([tenantId, dueDate])
}
```

### Campos a añadir a modelos existentes

```prisma
// Quote — add:
quoteNumber       String?   // Sequential "PRE-2026-0001"
leadId            String?   // Link to Lead
agentId           String?   // Sales agent who created
invoiceNumber     String?
paymentLinkToken  String?   @unique
paymentLinkUrl    String?
transferProofUrl  String?
transferConfirmedAt DateTime?
transferConfirmedBy String?
isAutoGenerated   Boolean   @default(false)

// Client — add:
nif               String?
city              String?
postalCode        String?
country           String?
tags              Json?     @default("[]")
isConverted       Boolean   @default(false)
totalBookings     Int       @default(0)
totalSpent        Float     @default(0)
lastBookingAt     DateTime?

// Reservation — add:
reservationNumber String?   // Sequential "RES-2026-0001"
channel           String?   // "web" | "tpv" | "presupuesto" | "cupon" | "telefono" | "walkin"
statusReservation String?   // "pendiente" | "confirmada" | "completada" | "cancelada" | "no_show"
statusPayment     String?   // "pendiente" | "pagado" | "parcial" | "devuelto"
reavExpedientId   String?
selectedTimeSlotId String?
```

## Endpoints tRPC → Next.js API Routes

### Leads (NEW)

| Nayade tRPC | OpenClaw API | Metodo |
|-------------|-------------|--------|
| `crm.leads.list` | `GET /api/crm/leads` | GET |
| `crm.leads.counters` | `GET /api/crm/leads/counters` | GET |
| `crm.leads.get` | `GET /api/crm/leads/[id]` | GET |
| `crm.leads.update` | `PATCH /api/crm/leads/[id]` | PATCH |
| `crm.leads.addNote` | `POST /api/crm/leads/[id]/notes` | POST |
| `crm.leads.markLost` | `POST /api/crm/leads/[id]/lost` | POST |
| `crm.leads.convertToQuote` | `POST /api/crm/leads/[id]/convert` | POST |
| `crm.leads.generateFromLead` | `POST /api/crm/leads/[id]/auto-quote` | POST |
| `crm.leads.previewFromLead` | `GET /api/crm/leads/[id]/preview-quote` | GET |

### Activity Log (NEW)

| Nayade tRPC | OpenClaw API | Metodo |
|-------------|-------------|--------|
| — | `GET /api/crm/activity-log?entityType=X&entityId=Y` | GET |

### Pending Payments (NEW)

| Nayade tRPC | OpenClaw API | Metodo |
|-------------|-------------|--------|
| `crm.pendingPayments.list` | `GET /api/crm/pending-payments` | GET |
| `crm.pendingPayments.create` | `POST /api/crm/pending-payments` | POST |
| `crm.pendingPayments.markPaid` | `POST /api/crm/pending-payments/[id]/paid` | POST |
| `crm.pendingPayments.sendReminder` | `POST /api/crm/pending-payments/[id]/remind` | POST |

### Quote Enhancement (existing routes)

| Nayade tRPC | OpenClaw API | Estado |
|-------------|-------------|--------|
| `crm.quotes.sendPaymentLink` | `POST /api/quotes/[id]/send` | ✅ Existe — enriquecer |
| `crm.quotes.confirmTransfer` | `POST /api/quotes/[id]/confirm-transfer` | Nuevo |

## Paginas admin a portar

| Nayade | OpenClaw | Estado |
|--------|----------|--------|
| `CRMDashboard.tsx` (tabs: Leads, Quotes, etc.) | Nuevo: `src/app/(dashboard)/crm/` | Nuevo tab para leads |
| `ClientsManager.tsx` | `src/app/(dashboard)/clients/` | ✅ Existe — enriquecer |

## PR Checklist

- [ ] Prisma migration: add `Lead`, `CrmActivityLog`, `PendingPayment`, enrich `Quote`, `Client`, `Reservation`
- [ ] API routes: `/api/crm/leads` (9 endpoints)
- [ ] API routes: `/api/crm/activity-log` (GET with filters)
- [ ] API routes: `/api/crm/pending-payments` (4 endpoints)
- [ ] API routes: `POST /api/quotes/[id]/confirm-transfer`
- [ ] Validation: `src/lib/validation/core.ts` — lead, activity log, pending payment schemas
- [ ] Service: `src/lib/crm/activity-log.ts` — helper to log CRM actions
- [ ] Service: `src/lib/crm/auto-quote.ts` — generate quote from lead's activitiesJson
- [ ] Cron: `/api/cron/quote-reminders` — resend quotes after 48h (max 2)
- [ ] UI: Leads pipeline page with kanban or list view
- [ ] UI: Activity log timeline on lead/quote detail pages
- [ ] UI: Pending payments dashboard widget
- [ ] UI: Transfer confirmation modal (upload proof + validate)
- [ ] Wire: update public contact/budget forms to create Lead instead of just Quote
- [ ] Wire: use DocumentNumbering for quoteNumber and reservationNumber
