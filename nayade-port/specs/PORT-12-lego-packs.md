# PORT-12: Lego Packs Enhancement

## Decision: 🔧 Adaptar | Complejidad: M

## Estado actual OpenClaw

Packs module con: LegoPack (title, slug, categoryId, price, images, description, isActive), LegoPackLine (packId, productId, roomTypeId, treatmentId, quantity, isRequired, isOptional, isClientEditable, overridePrice, sortOrder). API CRUD en `/api/packs`.

## Que aporta Nayade

1. **Pack enriquecido**: subtitle, shortDescription, coverImageUrl, image1-4, gallery, badge, priceLabel, category enum (dia/escolar/empresa/estancia), targetAudience, availabilityMode (strict/flexible), discountPercent, isOnlineSale, isFeatured, isPresentialSale, metaTitle/metaDescription
2. **Line enriquecida**: sourceType (experience/pack — permite packs dentro de packs), internalName, groupLabel, isClientVisible, defaultQuantity, isQuantityEditable, discountType/Value, overridePriceLabel, frontendNote
3. **Pricing snapshots**: foto fija del pricing en momento de compra (para historico)
4. **Public views**: listado por categoria, detalle por slug, calculo precio dinamico
5. **Pack cross-sells**: packs relacionados
6. **Sales stats**: estadisticas de ventas por pack

## Archivos fuente Nayade

| Archivo | Proposito |
|---------|-----------|
| `server/routers/legoPacks.ts` | 19 endpoints: list, CRUD, public views, pricing, snapshots, stats |
| `drizzle/schema.ts` → `lego_packs`, `lego_pack_lines`, `lego_pack_snapshots`, `pack_cross_sells` | Schema |
| `client/src/pages/admin/products/LegoPacksManager.tsx` | Admin UI |
| `client/src/pages/LegoPacksHome.tsx` | Public landing |
| `client/src/pages/LegoPacksList.tsx` | Public listing by category |
| `client/src/pages/LegoPackDetail.tsx` | Public detail |

## Tablas Drizzle → Prisma (+ tenantId)

### Modelos nuevos

```prisma
model LegoPackSnapshot {
  id              String   @id @default(cuid())
  tenantId        String
  legoPackId      String
  legoPackTitle   String
  operationType   String   // "reservation" | "quote" | "tpv_sale" | "checkout"
  operationId     String
  linesSnapshot   Json     // Frozen line details with prices
  totalOriginal   Float
  totalDiscount   Float
  totalFinal      Float
  createdAt       DateTime @default(now())

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId, operationType, operationId])
  @@index([tenantId, legoPackId])
}

model PackCrossSell {
  id            String   @id @default(cuid())
  tenantId      String
  packId        String
  relatedPackId String
  sortOrder     Int      @default(0)

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId, packId, relatedPackId])
  @@index([tenantId, packId])
}
```

### Campos a añadir

```prisma
// LegoPack — add:
subtitle            String?
shortDescription    String?
coverImageUrl       String?
gallery             Json      @default("[]")
badge               String?
priceLabel          String?
category            String?   // "dia" | "escolar" | "empresa" | "estancia"
targetAudience      String?
availabilityMode    String    @default("flexible") // "strict" | "flexible"
discountPercent     Float?
discountExpiresAt   DateTime?
isFeatured          Boolean   @default(false)
isPresentialSale    Boolean   @default(false)
isOnlineSale        Boolean   @default(false)
metaTitle           String?
metaDescription     String?

// LegoPackLine — add:
sourceType          String    @default("experience") // "experience" | "pack"
internalName        String?
groupLabel          String?
isClientVisible     Boolean   @default(true)
defaultQuantity     Int       @default(1)
isQuantityEditable  Boolean   @default(false)
discountType        String?   // "percent" | "fixed"
discountValue       Float?
overridePriceLabel  String?
frontendNote        String?
```

## Endpoints tRPC → Next.js API Routes

| Nayade tRPC | OpenClaw API | Estado |
|-------------|-------------|--------|
| `legoPacks.list` | `GET /api/packs` | ✅ Existe |
| `legoPacks.listPublic` | `GET /api/storefront/[slug]/packs` | ✅ Existe |
| `legoPacks.listPublicByCategory` | `GET /api/storefront/[slug]/packs?category=X` | Adaptar |
| `legoPacks.getBySlug` | `GET /api/storefront/[slug]/packs/[packSlug]` | Nuevo |
| `legoPacks.calculatePrice` | `GET /api/packs/[id]/calculate-price` | Nuevo |
| `legoPacks.saveSnapshot` | `POST /api/packs/[id]/snapshot` | Nuevo |
| `legoPacks.getSnapshot` | `GET /api/packs/snapshot?operationType=X&operationId=Y` | Nuevo |
| `legoPacks.stats` | `GET /api/packs/stats` | Nuevo |
| Pack CRUD + Lines | `/api/packs` | ✅ Existe |

## Paginas a portar

| Nayade | OpenClaw | Estado |
|--------|----------|--------|
| `LegoPacksManager.tsx` | `src/app/(dashboard)/packs/` | ✅ Existe — enriquecer |
| `LegoPacksHome.tsx` | Public storefront | Nuevo |
| `LegoPacksList.tsx` | Public storefront by category | Nuevo |
| `LegoPackDetail.tsx` | Public storefront detail | Nuevo |

## PR Checklist

- [ ] Prisma migration: add `LegoPackSnapshot`, `PackCrossSell`, enrich LegoPack and LegoPackLine
- [ ] API: `GET /api/packs/[id]/calculate-price?activeLineIds=X,Y,Z`
- [ ] API: `POST /api/packs/[id]/snapshot`
- [ ] API: `GET /api/packs/snapshot?operationType=X&operationId=Y`
- [ ] API: `GET /api/packs/stats` — sales statistics
- [ ] Enrich storefront packs endpoint with category filter and slug lookup
- [ ] UI: enrich pack form with all new fields
- [ ] UI: enrich line form with sourceType, groupLabel, frontend note, etc.
- [ ] UI: pricing calculator tool
- [ ] Public: packs landing + category listing + detail pages
