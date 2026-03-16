-- Step 8: Pricing Engine Schema Updates

-- Rename destination → station in Product
ALTER TABLE "Product" RENAME COLUMN "destination" TO "station";

-- Set default for station where null
UPDATE "Product" SET "station" = 'all' WHERE "station" IS NULL;
ALTER TABLE "Product" ALTER COLUMN "station" SET NOT NULL;
ALTER TABLE "Product" ALTER COLUMN "station" SET DEFAULT 'all';

-- Add new columns to Product
ALTER TABLE "Product" ADD COLUMN "personType" TEXT;
ALTER TABLE "Product" ADD COLUMN "tier" TEXT;
ALTER TABLE "Product" ADD COLUMN "includesHelmet" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Product" ADD COLUMN "pricingMatrix" JSONB;
ALTER TABLE "Product" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- Set price default
ALTER TABLE "Product" ALTER COLUMN "price" SET DEFAULT 0;

-- Drop old index and create new ones
DROP INDEX IF EXISTS "Product_tenantId_destination_idx";
CREATE INDEX "Product_tenantId_station_category_idx" ON "Product"("tenantId", "station", "category");

-- Create SeasonCalendar table
CREATE TABLE "SeasonCalendar" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "station" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeasonCalendar_pkey" PRIMARY KEY ("id")
);

-- Indexes for SeasonCalendar
CREATE INDEX "SeasonCalendar_tenantId_station_idx" ON "SeasonCalendar"("tenantId", "station");
CREATE UNIQUE INDEX "SeasonCalendar_tenantId_station_startDate_key" ON "SeasonCalendar"("tenantId", "station", "startDate");

-- Foreign key
ALTER TABLE "SeasonCalendar" ADD CONSTRAINT "SeasonCalendar_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
