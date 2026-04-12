# PORT-11: Spa Enhancement

## Decision: 🔧 Adaptar | Complejidad: L

## Estado actual OpenClaw

Spa module con: SpaCategory, SpaTreatment (title, slug, duration, capacity, price, images), SpaResource (cabin/therapist), SpaSlot, SpaScheduleTemplate. API CRUD completo.

## Que aporta Nayade

1. **Treatment enriquecido**: benefits (JSON), coverImageUrl, image1-2, gallery, cabinRequired, discountPercent/Label/ExpiresAt, fiscal fields, meta SEO
2. **Public booking flow**: browse treatments → select slot → guest info → Redsys payment
3. **Slot availability by month**: monthly view of available slots
4. **Auto-generate slots** from schedule templates (select date range → bulk create)
5. **Spa booking** (crea reserva + form Redsys)

## Archivos fuente Nayade

| Archivo | Proposito |
|---------|-----------|
| `server/spaDb.ts` | CRUD + `generateSlotsFromTemplates` |
| `server/routers/spa.ts` | 23 endpoints: public (categories, treatments, slots, booking) + admin CRUD |
| `drizzle/schema.ts` → spa tables | Schema |
| `client/src/pages/Spa.tsx` | Public listing |
| `client/src/pages/SpaDetail.tsx` | Public treatment detail + slot picker + booking |
| `client/src/pages/admin/spa/SpaManager.tsx` | Admin UI |

## Tablas Drizzle → Prisma

No tablas nuevas. Enriquecer SpaTreatment:

```prisma
// SpaTreatment — add:
shortDescription    String?
benefits            Json      @default("[]") // ["Relajacion", "Detox"]
coverImageUrl       String?
gallery             Json      @default("[]")
cabinRequired       Boolean   @default(false)
discountPercent     Float?
discountLabel       String?
discountExpiresAt   DateTime?
fiscalRegime        String    @default("general")
providerPercent     Float?
agencyMarginPercent Float?
supplierId          String?
isPresentialSale    Boolean   @default(false)
metaTitle           String?
metaDescription     String?
```

## Endpoints tRPC → Next.js API Routes

| Nayade tRPC | OpenClaw API | Estado |
|-------------|-------------|--------|
| `spa.getCategories` | `GET /api/storefront/[slug]/spa` | ✅ Existe |
| `spa.getTreatments` | `GET /api/storefront/[slug]/spa` | ✅ Existe |
| `spa.getTreatmentBySlug` | `GET /api/storefront/[slug]/spa/[treatmentSlug]` | Nuevo |
| `spa.getSlotsByMonth` | `GET /api/spa/slots?month=X` | Adaptar endpoint existente |
| `spa.getAvailableSlots` | `GET /api/spa/slots?date=X&treatmentId=Y` | Adaptar |
| `spa.adminGenerateSlots` | `POST /api/spa/slots/generate` | Nuevo |
| `spa.createSpaBooking` | `POST /api/storefront/[slug]/spa/book` | ✅ Existe — add Redsys |
| `spa.admin*` (CRUD) | `/api/spa/*` | ✅ Existe |

## Paginas a portar

| Nayade | OpenClaw | Estado |
|--------|----------|--------|
| `Spa.tsx` | Public storefront spa listing | Adaptar storefront |
| `SpaDetail.tsx` | Public treatment detail + slot picker | Nuevo |
| `SpaManager.tsx` | `src/app/(dashboard)/spa/` | ✅ Existe — enriquecer |

## PR Checklist

- [ ] Prisma migration: enrich SpaTreatment with new fields
- [ ] API: `POST /api/spa/slots/generate` — bulk generate from templates
- [ ] Enrich slot queries with monthly availability view
- [ ] Integrate Redsys (PORT-03) into spa booking flow
- [ ] UI: enrich treatment form with benefits, gallery, fiscal, discount
- [ ] UI: slot generation tool (select treatment + date range → preview → generate)
- [ ] Public: treatment detail page with slot picker in storefront
