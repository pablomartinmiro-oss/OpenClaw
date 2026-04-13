-- PORT-05: CMS Enhancement
-- 3 new models (GalleryItem, MediaFile, HomeModuleItem)
-- SlideshowItem enriched with 7 fields
-- PageBlock type comment updated (no column change needed — type is free string)

-- ==================== GALLERY ITEMS ====================

CREATE TABLE "GalleryItem" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "fileKey" TEXT,
    "title" TEXT,
    "category" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GalleryItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "GalleryItem_tenantId_isActive_idx" ON "GalleryItem"("tenantId", "isActive");
ALTER TABLE "GalleryItem" ADD CONSTRAINT "GalleryItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ==================== MEDIA FILES ====================

CREATE TABLE "MediaFile" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileKey" TEXT,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER,
    "type" TEXT NOT NULL DEFAULT 'image',
    "altText" TEXT,
    "uploadedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaFile_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "MediaFile_tenantId_type_idx" ON "MediaFile"("tenantId", "type");
ALTER TABLE "MediaFile" ADD CONSTRAINT "MediaFile_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ==================== HOME MODULE ITEMS ====================

CREATE TABLE "HomeModuleItem" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "moduleKey" TEXT NOT NULL,
    "productId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HomeModuleItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "HomeModuleItem_tenantId_moduleKey_idx" ON "HomeModuleItem"("tenantId", "moduleKey");
ALTER TABLE "HomeModuleItem" ADD CONSTRAINT "HomeModuleItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ==================== SLIDESHOW ITEM ENRICHMENT ====================

ALTER TABLE "SlideshowItem" ADD COLUMN "badge" TEXT;
ALTER TABLE "SlideshowItem" ADD COLUMN "title" TEXT;
ALTER TABLE "SlideshowItem" ADD COLUMN "subtitle" TEXT;
ALTER TABLE "SlideshowItem" ADD COLUMN "description" TEXT;
ALTER TABLE "SlideshowItem" ADD COLUMN "ctaText" TEXT;
ALTER TABLE "SlideshowItem" ADD COLUMN "ctaUrl" TEXT;
ALTER TABLE "SlideshowItem" ADD COLUMN "reserveUrl" TEXT;

-- Rollback (manual):
-- DROP TABLE "HomeModuleItem";
-- DROP TABLE "MediaFile";
-- DROP TABLE "GalleryItem";
-- ALTER TABLE "SlideshowItem" DROP COLUMN "badge", DROP COLUMN "title",
--   DROP COLUMN "subtitle", DROP COLUMN "description",
--   DROP COLUMN "ctaText", DROP COLUMN "ctaUrl", DROP COLUMN "reserveUrl";
