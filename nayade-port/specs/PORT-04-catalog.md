# PORT-04: Catalog Enhancement

## Decision: 🔧 Adaptar | Complejidad: M

## Estado actual OpenClaw

Catálogo ski-specific con 93 productos, 10 categorías, 3 estaciones. Modelo `Product` tiene: category, station, personType, tier, priceType, pricingMatrix. Categories y Locations separados. ExperienceVariants y ProductTimeSlots.

## Que aporta Nayade

Campos de `experiences` no presentes en `Product`:
- `slug` (UNIQUE — para routing publico)
- `fiscalRegime` (enum: reav/general_21/mixed)
- `productType` (enum: 8 valores)
- `providerPercent`, `agencyMarginPercent`, `supplierCommissionPercent`
- `supplierCostType`, `settlementFrequency`, `isSettlable`
- `isFeatured`, `isPublished`, `isPresentialSale`
- `metaTitle`, `metaDescription` (SEO)
- `discountPercent`, `discountExpiresAt`
- `includes`, `excludes` (JSON arrays)
- `coverImageUrl`, `image1-4`, `gallery` (multiple images)
- `difficulty` enum

## Archivos fuente Nayade

| Archivo | Proposito |
|---------|-----------|
| `drizzle/schema.ts` → tabla `experiences` | Schema completo con todos los campos |
| `server/db.ts` → `getAllExperiences`, `createExperience`, `updateExperience` | CRUD |
| `server/routers.ts` → inline `products` router | Endpoints CRUD + clone + reorder |
| `client/src/pages/admin/products/ExperiencesManager.tsx` | Admin UI |

## Tablas Drizzle → Prisma

No tablas nuevas. Enriquecer modelo `Product` existente:

### Campos a añadir a Product

```prisma
// Add to existing Product model:
slug              String?   // Unique per tenant for public URLs
fiscalRegime      String    @default("general") // "general" | "reav" | "mixed"
productType       String?   // "experiencia" | "actividad" | "transporte" | etc.
providerPercent   Float?
agencyMarginPercent Float?
supplierCommissionPercent Float?
supplierCostType  String?   // "percentage" | "fixed" | "margin" | "hybrid"
settlementFrequency String? // "biweekly" | "monthly" | "quarterly"
isSettlable       Boolean   @default(false)
isFeatured        Boolean   @default(false)
isPublished       Boolean   @default(true)
isPresentialSale  Boolean   @default(false)
discountPercent   Float?
discountExpiresAt DateTime?
coverImageUrl     String?
images            Json      @default("[]") // gallery array
includes          Json?     // ["Seguro", "Material"] string array
excludes          Json?     // ["Transporte"] string array
metaTitle         String?
metaDescription   String?
```

## Endpoints tRPC → Next.js API Routes

| Nayade tRPC | OpenClaw API | Estado |
|-------------|-------------|--------|
| `products.getAll` | `GET /api/products` | ✅ Ya existe |
| `products.create` | `POST /api/products` | ✅ Ya existe — ampliar schema |
| `products.update` | `PATCH /api/products/[id]` | ✅ Ya existe — ampliar schema |
| `products.delete` | `DELETE /api/products/[id]` | ✅ Ya existe |
| `products.clone` | `POST /api/products/[id]/clone` | Nuevo |
| `products.toggleActive` | `PATCH /api/products/[id]` (body: isActive) | ✅ Ya existe |
| `products.reorder` | — | No necesario (OpenClaw tiene sortOrder) |
| `public.getExperiences` | `GET /api/storefront/[slug]/products` | ✅ Ya existe |
| `public.getExperienceBySlug` | `GET /api/storefront/[slug]/products/[productSlug]` | Nuevo |

## Paginas admin a portar

| Nayade | OpenClaw | Estado |
|--------|----------|--------|
| `ExperiencesManager.tsx` | `src/app/(dashboard)/catalogo/` | ✅ Ya existe — enriquecer formulario |
| `CategoriesManager.tsx` | `src/app/(dashboard)/catalogo/_components/` | ✅ Ya existe |
| `LocationsManager.tsx` | `src/app/(dashboard)/catalogo/_components/` | ✅ Ya existe |
| `VariantsManager.tsx` | `src/app/(dashboard)/catalogo/_components/` | ✅ Ya existe |

## PR Checklist

- [ ] Prisma migration: add ~15 fields to Product model
- [ ] Update `src/lib/validation/catalog.ts` — extend product schemas with new fields
- [ ] Update product API routes to accept/return new fields
- [ ] Add `POST /api/products/[id]/clone` endpoint
- [ ] Add `GET /api/storefront/[slug]/products/[productSlug]` for slug-based lookup
- [ ] Update catalogo UI to show fiscal/supplier fields (collapsible section)
- [ ] Add `@@unique([tenantId, slug])` index on Product (nullable slug)
- [ ] Seed: update demo products with fiscal regime and supplier linkage
