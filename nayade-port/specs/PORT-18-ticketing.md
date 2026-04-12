# PORT-18: Ticketing / Coupons Enhancement

## Decision: 🔧 Adaptar | Complejidad: L

## Estado actual OpenClaw

Ticketing module con: ExternalPlatform, PlatformProduct, CouponRedemption, CouponEmailConfig. API CRUD en `/api/ticketing`. Batch redemptions. Voucher reader (Claude AI OCR).

## Que aporta Nayade

1. **CouponRedemption enriquecido**: provider, productTicketingId, securityCode, attachmentUrl (mediumtext), requestedDate, station, participants, children, comments, ocrConfidenceScore, ocrStatus, ocrRawData, duplicateFlag, duplicateNotes, realAmount, settlementJustificantUrl, settledAt, submissionId, originSource (web/admin), channelEntry (6 valores), createdByAdminId, adminUserId
2. **Multi-coupon submissions**: agrupar varios cupones en una sola submission
3. **OCR pipeline completo**: upload attachment → OCR → confidence score → auto-fill → admin review
4. **Platform settlements**: liquidaciones por plataforma (Groupon, Smartbox) con estado y justificante
5. **Dashboard KPIs**: estadisticas de cupones por estado, proveedor, conversion
6. **Convert to reservation**: crear reserva directamente desde cupon validado
7. **Re-run OCR**: volver a procesar OCR si el primer intento fallo
8. **Postpone coupon**: posponer + enviar email al cliente
9. **Platform enriquecida**: slug (UNIQUE), logoUrl, settlementFrequency, commissionPct, externalUrl, notes
10. **Platform product enriquecido**: externalLink, externalProductName, pvpPrice, netPrice, expiresAt

## Archivos fuente Nayade

| Archivo | Proposito |
|---------|-----------|
| `server/routers/ticketing.ts` | 25+ endpoints: listProducts, createProduct, uploadCouponAttachment, createSubmission, createManualRedemption, listCoupons, getRedemption, updateCouponStatus, postponeCoupon, markIncidence, convertToReservation, rerunOcr, getDashboardStats, markAsRedeemed, deleteRedemption, platform CRUD, platform products CRUD, platform settlements, product stats |
| `drizzle/schema.ts` → ticketing tables + `platform_settlements` | Schema |
| `client/src/pages/admin/marketing/CuponesManager.tsx` | Coupon pipeline |
| `client/src/pages/admin/marketing/PlatformsManager.tsx` | Platform admin |
| `client/src/pages/CanjearCupon.tsx` | Public coupon form |

## Tablas Drizzle → Prisma (+ tenantId)

### Modelo nuevo

```prisma
model PlatformSettlement {
  id              String    @id @default(cuid())
  tenantId        String
  platformId      String
  periodLabel     String?   // "Marzo 2026"
  periodFrom      DateTime
  periodTo        DateTime
  totalCoupons    Int       @default(0)
  totalAmount     Float     @default(0)
  netTotal        Float     @default(0)
  status          String    @default("pending") // "pending" | "received" | "paid"
  justificantUrl  String?
  invoiceRef      String?
  couponIds       Json      @default("[]") // IDs of included coupons
  notes           String?
  emittedAt       DateTime?
  paidAt          DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  tenant   Tenant           @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  platform ExternalPlatform @relation(fields: [platformId], references: [id], onDelete: Cascade)

  @@index([tenantId, platformId])
  @@index([tenantId, status])
}
```

### Campos a añadir

```prisma
// CouponRedemption — add:
provider              String?   // "groupon" | "smartbox" | etc.
productTicketingId    String?
securityCode          String?
attachmentUrl         String?   @db.Text
requestedDate         DateTime?
station               String?
participants          Int?
children              Int?
comments              String?
ocrConfidenceScore    Float?
ocrStatus             String?   // "pending" | "success" | "failed"
ocrRawData            Json?
duplicateFlag         Boolean   @default(false)
duplicateNotes        String?
realAmount            Float?
settlementJustificantUrl String?
settledAt             DateTime?
submissionId          String?
originSource          String?   // "web" | "admin"
channelEntry          String?   // "web" | "email" | "phone" | "tpv" | "walkin" | "other"
createdByAdminId      String?
adminUserId           String?
platformProductId     String?
platformSettlementId  String?
notes                 String?

// ExternalPlatform — add:
slug                  String?   @unique
logoUrl               String?
settlementFrequency   String?   // "monthly" | "biweekly" | "quarterly"
commissionPct         Float?
externalUrl           String?
notes                 String?

// PlatformProduct — add:
externalLink          String?
externalProductName   String?
pvpPrice              Float?
netPrice              Float?
expiresAt             DateTime?
```

## Endpoints tRPC → Next.js API Routes

| Nayade tRPC | OpenClaw API | Estado |
|-------------|-------------|--------|
| `ticketing.listCoupons` | `GET /api/ticketing/redemptions` | ✅ Existe — enriquecer |
| `ticketing.getRedemption` | `GET /api/ticketing/redemptions/[id]` | ✅ Existe |
| `ticketing.createSubmission` (public, multi-coupon) | `POST /api/ticketing/redemptions` | ✅ Existe — enriquecer |
| `ticketing.createManualRedemption` | `POST /api/ticketing/redemptions/manual` | Nuevo |
| `ticketing.updateCouponStatus` | `PATCH /api/ticketing/redemptions/[id]` | ✅ Existe |
| `ticketing.postponeCoupon` | `POST /api/ticketing/redemptions/[id]/postpone` | Nuevo |
| `ticketing.markIncidence` | `POST /api/ticketing/redemptions/[id]/incidence` | Nuevo |
| `ticketing.convertToReservation` | `POST /api/ticketing/redemptions/[id]/convert` | Nuevo |
| `ticketing.rerunOcr` | `POST /api/ticketing/redemptions/[id]/rerun-ocr` | Nuevo |
| `ticketing.getDashboardStats` | `GET /api/ticketing/dashboard` | Nuevo |
| `ticketing.markAsRedeemed` | `POST /api/ticketing/redemptions/[id]/redeemed` | Nuevo |
| Platform settlements CRUD | `/api/ticketing/platform-settlements` | Nuevo (CRUD) |
| `ticketing.getProductStats` | `GET /api/ticketing/platforms/[id]/stats` | Nuevo |

## Paginas a portar

| Nayade | OpenClaw | Estado |
|--------|----------|--------|
| `CuponesManager.tsx` | `src/app/(dashboard)/ticketing/` | ✅ Existe — enriquecer |
| `PlatformsManager.tsx` | `src/app/(dashboard)/ticketing/` | ✅ Existe — enriquecer |
| `CanjearCupon.tsx` | Public page | Adaptar (ya existe el voucher reader) |

## PR Checklist

- [ ] Prisma migration: add `PlatformSettlement`, enrich CouponRedemption, ExternalPlatform, PlatformProduct
- [ ] API: 6 new mutation endpoints for coupon workflow
- [ ] API: `GET /api/ticketing/dashboard` — KPI stats
- [ ] API: Platform settlements CRUD
- [ ] API: `GET /api/ticketing/platforms/[id]/stats` — product stats
- [ ] Enrich coupon submission to support multi-coupon grouping
- [ ] Service: duplicate detection on coupon codes
- [ ] Service: convert coupon to reservation helper
- [ ] UI: enrich coupon pipeline with more status columns
- [ ] UI: platform settlements tab
- [ ] UI: dashboard KPIs (pending, validated, converted, incidence)
- [ ] UI: convert-to-reservation modal
- [ ] UI: postpone + re-run OCR actions
