# NAYADE → OPENCLAW PORT PLAN

> Generated: 2026-04-12
> Source audit: `nayade-port/audit/NAYADE-FULL-AUDIT.md` (1622 lines, 87 tables, 250+ endpoints, 20 modules)
> Target: OpenClaw multi-tenant platform (Prisma/Postgres, Next.js App Router, 83+ models)

---

## RESUMEN EJECUTIVO

De los **20 módulos funcionales** de Nayade:
- **❌ Descartar:** 1 módulo (Auth — OpenClaw ya tiene NextAuth multi-tenant superior)
- **✅ Portar tal cual:** 3 módulos (infraestructura nueva que no existe en OpenClaw)
- **🔧 Adaptar:** 16 módulos (existen en OpenClaw pero Nayade aporta funcionalidad extra)

**Total specs:** 19 módulos → 19 archivos `PORT-NN-[modulo].md`

---

## DECISIÓN POR MÓDULO

| # | Módulo Nayade | Decisión | Complejidad | Justificación |
|---|---------------|----------|-------------|---------------|
| 01 | Document Numbering | ✅ Portar | M | OpenClaw usa cuid(). Nayade tiene numeración secuencial (`FAC-2026-0001`) con reset anual. Imprescindible para facturación legal española |
| 02 | Email + PDF Templates | ✅ Portar | XL | OpenClaw no tiene sistema de plantillas email/PDF. Nayade tiene 19 builders HTML + editor CRUD + PDF vía puppeteer |
| 03 | Payments (Redsys) | ✅ Portar | L | OpenClaw tiene stubs. Nayade tiene implementación completa: 3DES + HMAC-SHA256, form builder, IPN validator, callbacks |
| 04 | Catalog | 🔧 Adaptar | M | Añadir campos fiscales (régimen REAV/general), supplier linkage, slug-based routing, public storefront views |
| 05 | CMS | 🔧 Adaptar | M | Añadir gallery pública, home modules selector, media library, block editor enriquecido (hero, CTA, FAQ, video) |
| 06 | Finance / Accounting | 🔧 Adaptar | L | Añadir P&L report, accounting dashboard con KPIs, transaction ledger avanzado, informes por canal/método pago |
| 07 | Discounts | 🔧 Adaptar | S | Añadir validación en checkout/TPV, integración con vouchers de compensación, duplicación de códigos |
| 08 | Reviews | 🔧 Adaptar | S | Añadir verified booking check, admin stats globales, entityType expandido |
| 09 | CRM | 🔧 Adaptar | XL | Añadir lead pipeline completo, auto-generación quotes desde leads, activity log, pending payments, timeline |
| 10 | Hotel | 🔧 Adaptar | L | Añadir booking público con Redsys, calendar view, campos enriquecidos (surface, amenities, gallery, fiscal) |
| 11 | Spa | 🔧 Adaptar | L | Añadir booking público con Redsys, slot auto-generation desde templates, campos enriquecidos |
| 12 | Restaurant | 🔧 Adaptar | L | Añadir booking público, depósitos con Redsys, global calendar, staff management avanzado, email notificaciones |
| 13 | Suppliers + Settlements | 🔧 Adaptar | M | Añadir auto-generación settlements, XLSX export, periods preview, status workflow enriquecido |
| 14 | REAV | 🔧 Adaptar | M | Añadir calculation engine puro, campos enriquecidos (destination, pax, channel), estados fiscales/operativos |
| 15 | Lego Packs | 🔧 Adaptar | M | Añadir pricing snapshots, public views por categoría, price calculation endpoint, estadísticas |
| 16 | Operations | 🔧 Adaptar | L | Añadir calendar operativo, daily activities view, monitor management (docs, payroll), reservation operational |
| 17 | Cancellations | 🔧 Adaptar | L | Añadir workflow completo (7 estados operativos, 4 resolución, 7 financieros), voucher generation, impact preview |
| 18 | Ticketing / Coupons | 🔧 Adaptar | L | Añadir multi-coupon submissions, OCR pipeline completo, platform settlements, dashboard KPIs |
| 19 | TPV | 🔧 Adaptar | L | Añadir split payments, auto-create reservation + transaction + REAV + invoice, ticket email, backoffice reports |

**Módulo descartado:**

| Módulo | Razón |
|--------|-------|
| Auth + Users | OpenClaw tiene NextAuth v5 multi-tenant con JWT, RBAC con 4 roles, invite system, module-scoped permissions. Superior a Nayade (JWT local single-tenant). No hay nada que portar. |

---

## ORDEN DE PORTADO (por dependencias)

### Fase 0 — Infraestructura base (sin dependencias)

Estos 3 módulos son **prerequisitos** para muchos otros. Portarlos primero.

```
PORT-01: Document Numbering ←── Finance, CRM, TPV, Ticketing, Cancellations necesitan esto
PORT-02: Email + PDF Templates ←── CRM, Cancellations, TPV, Restaurant envían emails/PDFs
PORT-03: Redsys Payments ←── Hotel, Spa, Restaurant, CRM necesitan pagos online
```

### Fase 1 — Módulos base (dependen solo de Fase 0)

```
PORT-04: Catalog ←── Enriquecer Product model con campos fiscales/supplier
PORT-05: CMS ←── Gallery, home modules, media library
PORT-06: Finance ←── P&L, dashboard, reports (usa Document Numbering)
PORT-07: Discounts ←── Validación en checkout/TPV
PORT-08: Reviews ←── Verified booking check, admin stats
```

### Fase 2 — Módulos intermedios (dependen de Fase 1)

```
PORT-09: CRM ←── Lead pipeline, activity log (usa Catalog, Finance, Redsys, Email Templates)
PORT-10: Hotel ←── Public booking (usa Redsys, Email Templates)
PORT-11: Spa ←── Public booking (usa Redsys, Email Templates)
PORT-12: Restaurant ←── Public booking, deposits (usa Redsys, Email Templates)
PORT-13: Suppliers ←── Auto-generation (usa Catalog, Finance)
PORT-14: REAV ←── Calculation engine (usa Finance)
```

### Fase 3 — Módulos top-level (dependen de Fase 2)

```
PORT-15: Lego Packs ←── Snapshots (usa Catalog)
PORT-16: Operations ←── Calendar, daily activities (usa CRM, Instructors)
PORT-17: Cancellations ←── Full workflow (usa CRM, Discounts, Email Templates)
PORT-18: Ticketing ←── OCR pipeline, settlements (usa Catalog, CRM, Suppliers)
PORT-19: TPV ←── Split payments (usa Catalog, Finance, REAV, Document Numbering)
```

---

## MAPA DE DEPENDENCIAS

```
                    ┌──────────────┐
                    │  PORT-01     │
                    │  Doc Numbers │
                    └──────┬───┬──┘
                           │   │
          ┌────────────────┘   └──────────────────┐
          │                                        │
   ┌──────▼──────┐  ┌──────────────┐  ┌───────────▼───────┐
   │  PORT-06    │  │  PORT-02     │  │  PORT-03          │
   │  Finance    │  │  Email/PDF   │  │  Redsys           │
   └──────┬──────┘  └──────┬───┬──┘  └──┬────────┬───────┘
          │                │   │        │        │
   ┌──────▼──────┐  ┌──────▼───▼──────▼─▼──┐    │
   │  PORT-14    │  │  PORT-09  CRM        │    │
   │  REAV       │  │  (leads, quotes)     │    │
   └──────┬──────┘  └──────────┬───────────┘    │
          │                    │                 │
   ┌──────▼──────┐  ┌─────────▼──┐  ┌──────────▼──────────┐
   │  PORT-19    │  │  PORT-17   │  │  PORT-10/11/12      │
   │  TPV        │  │  Cancell.  │  │  Hotel/Spa/Rest     │
   └─────────────┘  └────────────┘  └─────────────────────┘
```

---

## TABLAS NAYADE → PRISMA (resumen de cambios)

### Tablas nuevas a crear en Prisma (no existen en OpenClaw)

| Nayade table | Nuevo modelo Prisma | Módulo |
|--------------|---------------------|--------|
| `document_counters` | `DocumentCounter` | PORT-01 |
| `document_number_logs` | `DocumentNumberLog` | PORT-01 |
| `email_templates` | `EmailTemplate` | PORT-02 |
| `pdf_templates` | `PdfTemplate` | PORT-02 |
| `leads` | `Lead` | PORT-09 |
| `crm_activity_log` | `CrmActivityLog` | PORT-09 |
| `pending_payments` | `PendingPayment` | PORT-09 |
| `gallery_items` | `GalleryItem` | PORT-05 |
| `media_files` | `MediaFile` | PORT-05 |
| `home_module_items` | `HomeModuleItem` | PORT-05 |
| `restaurant_booking_logs` | `RestaurantBookingLog` | PORT-12 |
| `lego_pack_snapshots` | `LegoPackSnapshot` | PORT-15 |
| `reservation_operational` | `ReservationOperational` | PORT-16 |
| `platform_settlements` | `PlatformSettlement` | PORT-18 |
| `tpv_sale_payments` | `TpvSalePayment` | PORT-19 |
| `password_reset_tokens` | — (NextAuth handles this) | — |
| `pack_cross_sells` | `PackCrossSell` | PORT-15 |

### Modelos existentes a enriquecer

| Modelo OpenClaw | Campos nuevos de Nayade | Módulo |
|-----------------|------------------------|--------|
| `Product` | `slug`, `fiscalRegime`, `providerPercent`, `agencyMarginPercent`, `supplierCommissionPercent`, `supplierCostType`, `settlementFrequency`, `isSettlable`, `isFeatured`, `isPublished`, `isPresentialSale`, `metaTitle`, `metaDescription` | PORT-04 |
| `Quote` | `quoteNumber`, `leadId`, `agentId`, `invoiceNumber`, `paymentLinkToken`, `transferProofUrl`, `reminderCount`, `lastReminderAt`, `isAutoGenerated` | PORT-09 |
| `Invoice` | `invoiceNumber` (sequential), `invoiceType`, `creditNoteForId`, `creditNoteReason`, `sentAt`, `sentCount` | PORT-06 |
| `Transaction` | `transactionNumber`, `type`, `saleChannel`, `taxBase`, `taxAmount`, `reavMargin`, `fiscalRegime`, `tpvSaleId`, `reservationRef` | PORT-06 |
| `Reservation` | `reservationNumber` (sequential), `channel` (13 values), `statusReservation`, `statusPayment`, `reavExpedientId`, `selectedTimeSlotId` | PORT-09 |
| `RoomType` | `shortDescription`, `maxAdults`, `maxChildren`, `surfaceM2`, `amenities`, `gallery`, `discountPercent`, `fiscalRegime`, `metaTitle/Description` | PORT-10 |
| `SpaTreatment` | `benefits`, `coverImageUrl`, `gallery`, `cabinRequired`, `discountPercent`, `fiscalRegime`, `metaTitle/Description` | PORT-11 |
| `Restaurant` | `cuisine`, `heroImage`, `galleryImages`, `menuUrl`, `phone`, `email`, `badge`, `minAdvanceHours`, `maxAdvanceDays`, `cancellationHours`, `cancellationPolicy`, `legalText`, `operativeEmail` | PORT-12 |
| `RestaurantBooking` | `locator`, `guestLastName`, `highchair`, `allergies`, `birthday`, `accessibility`, `isVip`, `cancellationReason`, `channel`, `paymentStatus`, `merchantOrder` | PORT-12 |
| `CancellationRequest` | `fullName`, `email`, `phone`, `activityDate`, `locator`, `operationalStatus` (7 values), `resolutionStatus` (4), `financialStatus` (7), `compensationType`, `cancellationNumber`, `assignedUserId` | PORT-17 |
| `ReavExpedient` | `expedientNumber`, `clientId`, `agentId`, `serviceDescription`, `serviceDate`, `destination`, `numberOfPax`, `fiscalStatus` (5 values), `operativeStatus` (4), channel | PORT-14 |
| `TpvSale` | `taxBase`, `taxAmount`, `taxRate`, `reavMargin`, `reavCost`, `reavTax`, `fiscalSummary`, `saleChannel`, `sellerUserId`, `operativeCenter` | PORT-19 |
| `TpvSaleItem` | `eventDate`, `eventTime`, `participants`, `fiscalRegime`, `taxBase`, `taxAmount`, `reavCost`, `reavMargin` | PORT-19 |
| `CouponRedemption` | `provider`, `productTicketingId`, `securityCode`, `attachmentUrl`, `requestedDate`, `station`, `participants`, `ocrConfidenceScore`, `ocrStatus`, `ocrRawData`, `duplicateFlag`, `settlementId`, `submissionId`, `channelEntry` | PORT-18 |
| `Supplier` | `fiscalAddress`, `contactPerson`, `settlementDayOfMonth`, `autoGenerateSettlements` | PORT-13 |
| `SupplierSettlement` | `settlementNumber` (sequential), `pdfKey`, `sentAt` | PORT-13 |
| `LegoPack` | `subtitle`, `shortDescription`, `coverImageUrl`, `image1-4`, `gallery`, `badge`, `priceLabel`, `availabilityMode`, `isOnlineSale`, `metaTitle/Description` | PORT-15 |
| `LegoPackLine` | `sourceType` (experience/pack), `internalName`, `groupLabel`, `isClientVisible`, `defaultQuantity`, `isQuantityEditable`, `discountType/Value`, `overridePriceLabel`, `frontendNote` | PORT-15 |
| `SlideshowItem` | `badge`, `title`, `subtitle`, `description`, `ctaText`, `ctaUrl`, `reserveUrl` | PORT-05 |
| `DiscountCode` | `name`, `description`, `discountType` (percent/fixed), `observations`, `origin` (manual/voucher), `compensationVoucherId`, `clientEmail/Name` | PORT-07 |

---

## ENDPOINTS NUEVOS (resumen)

| Módulo | Endpoints nuevos aprox. | Tipo |
|--------|------------------------|------|
| PORT-01 Document Numbering | 5 | Servicio interno + admin CRUD |
| PORT-02 Email/PDF Templates | 14 | Admin CRUD + preview + test |
| PORT-03 Redsys | 4 | Payment form + IPN callbacks |
| PORT-04 Catalog | 3 | Public storefront queries |
| PORT-05 CMS | 12 | Gallery CRUD + home modules + media |
| PORT-06 Finance | 6 | P&L + reports + dashboard stats |
| PORT-07 Discounts | 3 | Validate + verify voucher + duplicate |
| PORT-08 Reviews | 2 | Verified check + global stats |
| PORT-09 CRM | 25+ | Full lead pipeline + pending payments |
| PORT-10 Hotel | 4 | Public booking + calendar + search |
| PORT-11 Spa | 4 | Public booking + slot availability |
| PORT-12 Restaurant | 10 | Public booking + global calendar + staff |
| PORT-13 Suppliers | 5 | Auto-generate + XLSX + periods |
| PORT-14 REAV | 3 | Calculation engine + enriched CRUD |
| PORT-15 Lego Packs | 8 | Public views + snapshots + pricing |
| PORT-16 Operations | 8 | Calendar + daily activities + monitor mgmt |
| PORT-17 Cancellations | 15 | Full workflow with 12 mutation endpoints |
| PORT-18 Ticketing | 10 | Multi-coupon + OCR + platform settlements |
| PORT-19 TPV | 5 | Split payments + ticket email + backoffice |

**Total endpoints nuevos estimados: ~145**

---

## ESTIMACIÓN DE ESFUERZO

| Fase | Módulos | Complejidad | PRs |
|------|---------|-------------|-----|
| Fase 0 | 01, 02, 03 | M + XL + L | 3 |
| Fase 1 | 04, 05, 06, 07, 08 | M + M + L + S + S | 3-5 |
| Fase 2 | 09, 10, 11, 12, 13, 14 | XL + L + L + L + M + M | 6 |
| Fase 3 | 15, 16, 17, 18, 19 | M + L + L + L + L | 5 |
| **Total** | **19 módulos** | | **17-19 PRs** |

---

## REGLAS DE PORTADO

1. **Multi-tenant:** Todo modelo nuevo lleva `tenantId` + `@@index([tenantId])`. Nayade es single-tenant → añadir tenant scope everywhere.
2. **IDs:** Nayade usa `int autoincrement`. OpenClaw usa `String @id @default(cuid())`. Convertir todos los IDs.
3. **Timestamps:** Nayade mezcla `timestamp` y `bigint` para fechas. OpenClaw usa `DateTime` siempre.
4. **Enums:** Nayade define enums inline en schema. OpenClaw usa `String` con comentarios de valores válidos. Mantener convención OpenClaw.
5. **API auth:** Nayade tiene `publicProcedure`, `protectedProcedure`, `adminProcedure`. OpenClaw usa `requireTenant()` + `requireModule()`. Adaptar a patrón OpenClaw.
6. **Validación:** Nayade usa zod inline en tRPC. OpenClaw usa schemas en `src/lib/validation/*.ts`. Crear schemas en archivos de validación correspondientes.
7. **No tocar:** Auth, GHL integration, mock mode, demo system, planning engine, instructor module, rental module — son propios de OpenClaw.
8. **UI en español:** Nayade ya está en español. Mantener todos los textos.
9. **Module guard:** Todo endpoint de módulo no-core usa `requireModule()`.
10. **Max 300 líneas por archivo.**

---

## SPECS INDIVIDUALES

Cada módulo tiene su spec detallado en `nayade-port/specs/`:

| Spec | Archivo |
|------|---------|
| PORT-01 | `specs/PORT-01-document-numbering.md` |
| PORT-02 | `specs/PORT-02-email-pdf-templates.md` |
| PORT-03 | `specs/PORT-03-redsys-payments.md` |
| PORT-04 | `specs/PORT-04-catalog.md` |
| PORT-05 | `specs/PORT-05-cms.md` |
| PORT-06 | `specs/PORT-06-finance.md` |
| PORT-07 | `specs/PORT-07-discounts.md` |
| PORT-08 | `specs/PORT-08-reviews.md` |
| PORT-09 | `specs/PORT-09-crm.md` |
| PORT-10 | `specs/PORT-10-hotel.md` |
| PORT-11 | `specs/PORT-11-spa.md` |
| PORT-12 | `specs/PORT-12-restaurant.md` |
| PORT-13 | `specs/PORT-13-suppliers.md` |
| PORT-14 | `specs/PORT-14-reav.md` |
| PORT-15 | `specs/PORT-15-lego-packs.md` |
| PORT-16 | `specs/PORT-16-operations.md` |
| PORT-17 | `specs/PORT-17-cancellations.md` |
| PORT-18 | `specs/PORT-18-ticketing.md` |
| PORT-19 | `specs/PORT-19-tpv.md` |
