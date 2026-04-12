# PORT-05: CMS Enhancement

## Decision: 🔧 Adaptar | Complejidad: M

## Estado actual OpenClaw

CMS basico con: SiteSetting, SlideshowItem (simple), CmsMenuItem, StaticPage, PageBlock. API routes y admin UI existentes.

## Que aporta Nayade

1. **SlideshowItem enriquecido**: badge, title, subtitle, description, ctaText, ctaUrl, reserveUrl
2. **Gallery publica**: CRUD de imagenes con categorias, drag & drop reorder
3. **Home modules**: selector de productos por seccion del homepage
4. **Media library**: browser de archivos multimedia subidos
5. **Page blocks enriquecidos**: hero, text, image, CTA, FAQ, video, gallery (OpenClaw solo tiene text, image, gallery, video, html)
6. **Reorder endpoints** para slideshow y menus

## Archivos fuente Nayade

| Archivo | Proposito |
|---------|-----------|
| `server/galleryDb.ts` | Gallery CRUD: `getActiveGalleryItems`, `createGalleryItem`, `updateGalleryItem`, `deleteGalleryItem`, `reorderGalleryItems` |
| `server/routers.ts` → inline `cms` router | Slideshow, menus, pages, settings, media |
| `drizzle/schema.ts` → `gallery_items`, `media_files`, `home_module_items` | Schema |
| `client/src/pages/admin/cms/GalleryManager.tsx` | Gallery admin |
| `client/src/pages/admin/cms/HomeModulesManager.tsx` | Home modules admin |
| `client/src/pages/admin/cms/MultimediaManager.tsx` | Media browser |
| `client/src/pages/admin/cms/SlideshowManager.tsx` | Slideshow admin (enriched) |
| `client/src/pages/admin/cms/MenusManager.tsx` | Menu admin |
| `client/src/pages/admin/cms/PagesManager.tsx` | Pages admin (enriched blocks) |

## Tablas Drizzle → Prisma (+ tenantId)

| Nayade | OpenClaw | Cambios |
|--------|----------|---------|
| `gallery_items` | `GalleryItem` (NEW) | + tenantId |
| `media_files` | `MediaFile` (NEW) | + tenantId |
| `home_module_items` | `HomeModuleItem` (NEW) | + tenantId |

### Prisma models nuevos

```prisma
model GalleryItem {
  id        String   @id @default(cuid())
  tenantId  String
  imageUrl  String
  fileKey   String?
  title     String?
  category  String?
  sortOrder Int      @default(0)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId, isActive])
}

model MediaFile {
  id           String   @id @default(cuid())
  tenantId     String
  filename     String
  originalName String
  url          String
  fileKey      String?
  mimeType     String
  size         Int
  type         String   @default("image") // "image" | "video" | "document"
  altText      String?
  uploadedBy   String?
  createdAt    DateTime @default(now())

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId, type])
}

model HomeModuleItem {
  id           String   @id @default(cuid())
  tenantId     String
  moduleKey    String   // "featured" | "popular" | "seasonal"
  productId    String?
  sortOrder    Int      @default(0)
  createdAt    DateTime @default(now())

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId, moduleKey])
}
```

### Campos a añadir a modelos existentes

```prisma
// SlideshowItem — add:
badge       String?
title       String?
subtitle    String?
description String?
ctaText     String?
ctaUrl      String?
reserveUrl  String?
```

## Endpoints tRPC → Next.js API Routes

| Nayade tRPC | OpenClaw API | Estado |
|-------------|-------------|--------|
| `cms.getSlideshowItems` | `GET /api/cms/slideshow` | ✅ Existe — enriquecer response |
| `cms.reorderSlideshowItems` | `PATCH /api/cms/slideshow/reorder` | Nuevo |
| `cms.getMediaFiles` | `GET /api/cms/media` | Nuevo |
| `cms.deleteMediaFile` | `DELETE /api/cms/media/[id]` | Nuevo |
| `cms.reorderMenuItems` | `PATCH /api/cms/menu-items/reorder` | Nuevo |
| gallery.* (7 endpoints) | `/api/cms/gallery` | Nuevo (GET, POST, PATCH, DELETE, reorder) |
| homeModules.* | `/api/cms/home-modules` | Nuevo (GET, POST, DELETE) |

## Paginas admin a portar

| Nayade | OpenClaw | Estado |
|--------|----------|--------|
| `GalleryManager.tsx` | `src/app/(dashboard)/cms/_components/GalleryManager.tsx` | Nuevo |
| `HomeModulesManager.tsx` | `src/app/(dashboard)/cms/_components/HomeModulesManager.tsx` | Nuevo |
| `MultimediaManager.tsx` | `src/app/(dashboard)/cms/_components/MediaManager.tsx` | Nuevo |
| `SlideshowManager.tsx` | Ya existe — enriquecer | Adaptar |
| `PagesManager.tsx` | Ya existe — añadir block types | Adaptar |

## PR Checklist

- [ ] Prisma migration: add `GalleryItem`, `MediaFile`, `HomeModuleItem`, enrich `SlideshowItem`
- [ ] API routes: `/api/cms/gallery` (CRUD + reorder)
- [ ] API routes: `/api/cms/media` (GET, DELETE)
- [ ] API routes: `/api/cms/home-modules` (GET, POST, DELETE)
- [ ] API routes: add reorder endpoints for slideshow and menu items
- [ ] Validation: `src/lib/validation/cms.ts` — gallery, media, home module schemas
- [ ] UI: GalleryManager (drag & drop grid)
- [ ] UI: MediaManager (file browser with type filter)
- [ ] UI: HomeModulesManager (product selector per section)
- [ ] UI: enrich SlideshowItem form with badge, title, subtitle, CTA fields
- [ ] UI: add hero, CTA, FAQ block types to page editor
- [ ] Public: gallery page in storefront
