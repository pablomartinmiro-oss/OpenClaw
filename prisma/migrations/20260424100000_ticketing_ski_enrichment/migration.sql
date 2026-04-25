-- Ticketing: ski-specific enrichment for CouponRedemption
ALTER TABLE "CouponRedemption" ADD COLUMN "customerName" TEXT;
ALTER TABLE "CouponRedemption" ADD COLUMN "platformId" TEXT;
ALTER TABLE "CouponRedemption" ADD COLUMN "productId" TEXT;
ALTER TABLE "CouponRedemption" ADD COLUMN "skiLevel" TEXT;
ALTER TABLE "CouponRedemption" ADD COLUMN "bootSize" TEXT;
ALTER TABLE "CouponRedemption" ADD COLUMN "height" INTEGER;
ALTER TABLE "CouponRedemption" ADD COLUMN "numPeople" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "CouponRedemption" ADD COLUMN "preferredDate" TIMESTAMP(3);
ALTER TABLE "CouponRedemption" ADD COLUMN "notes" TEXT;

CREATE INDEX "CouponRedemption_tenantId_platformId_idx" ON "CouponRedemption"("tenantId", "platformId");
CREATE INDEX "CouponRedemption_tenantId_redeemedAt_idx" ON "CouponRedemption"("tenantId", "redeemedAt");

ALTER TABLE "CouponRedemption"
  ADD CONSTRAINT "CouponRedemption_platformId_fkey"
  FOREIGN KEY ("platformId") REFERENCES "ExternalPlatform"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CouponRedemption"
  ADD CONSTRAINT "CouponRedemption_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
