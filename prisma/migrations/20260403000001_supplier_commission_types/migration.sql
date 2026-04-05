-- AlterTable: Add flexible commission type fields to Supplier
ALTER TABLE "Supplier" ADD COLUMN "commissionType" TEXT NOT NULL DEFAULT 'percentage';
ALTER TABLE "Supplier" ADD COLUMN "fixedCostPerUnit" DOUBLE PRECISION;
ALTER TABLE "Supplier" ADD COLUMN "marginPercentage" DOUBLE PRECISION;
