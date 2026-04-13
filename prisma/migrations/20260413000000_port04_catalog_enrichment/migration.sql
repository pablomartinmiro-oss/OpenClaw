-- PORT-04: Catalog enrichment — add Nayade experience fields to Product
-- All columns are nullable or have defaults, so this is a metadata-only change (no table rewrite)

-- Catalog enrichment fields
ALTER TABLE "Product" ADD COLUMN "slug" TEXT;
ALTER TABLE "Product" ADD COLUMN "fiscalRegime" TEXT NOT NULL DEFAULT 'general';
ALTER TABLE "Product" ADD COLUMN "productType" TEXT;
ALTER TABLE "Product" ADD COLUMN "providerPercent" DOUBLE PRECISION;
ALTER TABLE "Product" ADD COLUMN "agencyMarginPercent" DOUBLE PRECISION;
ALTER TABLE "Product" ADD COLUMN "supplierCommissionPercent" DOUBLE PRECISION;
ALTER TABLE "Product" ADD COLUMN "supplierCostType" TEXT;
ALTER TABLE "Product" ADD COLUMN "settlementFrequency" TEXT;
ALTER TABLE "Product" ADD COLUMN "isSettlable" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Product" ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Product" ADD COLUMN "isPublished" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Product" ADD COLUMN "isPresentialSale" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Product" ADD COLUMN "discountPercent" DOUBLE PRECISION;
ALTER TABLE "Product" ADD COLUMN "discountExpiresAt" TIMESTAMP(3);
ALTER TABLE "Product" ADD COLUMN "coverImageUrl" TEXT;
ALTER TABLE "Product" ADD COLUMN "images" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "Product" ADD COLUMN "includes" JSONB;
ALTER TABLE "Product" ADD COLUMN "excludes" JSONB;
ALTER TABLE "Product" ADD COLUMN "metaTitle" TEXT;
ALTER TABLE "Product" ADD COLUMN "metaDescription" TEXT;
ALTER TABLE "Product" ADD COLUMN "difficulty" TEXT;

-- Unique constraint: slug per tenant (nullable slug allowed — only enforced when set)
CREATE UNIQUE INDEX "Product_tenantId_slug_key" ON "Product"("tenantId", "slug");

-- Index for published product queries (storefront)
CREATE INDEX "Product_tenantId_isPublished_idx" ON "Product"("tenantId", "isPublished");

-- Rollback (manual):
-- DROP INDEX "Product_tenantId_isPublished_idx";
-- DROP INDEX "Product_tenantId_slug_key";
-- ALTER TABLE "Product" DROP COLUMN "slug", DROP COLUMN "fiscalRegime", DROP COLUMN "productType",
--   DROP COLUMN "providerPercent", DROP COLUMN "agencyMarginPercent", DROP COLUMN "supplierCommissionPercent",
--   DROP COLUMN "supplierCostType", DROP COLUMN "settlementFrequency", DROP COLUMN "isSettlable",
--   DROP COLUMN "isFeatured", DROP COLUMN "isPublished", DROP COLUMN "isPresentialSale",
--   DROP COLUMN "discountPercent", DROP COLUMN "discountExpiresAt", DROP COLUMN "coverImageUrl",
--   DROP COLUMN "images", DROP COLUMN "includes", DROP COLUMN "excludes",
--   DROP COLUMN "metaTitle", DROP COLUMN "metaDescription", DROP COLUMN "difficulty";
