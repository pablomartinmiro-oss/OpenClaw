-- Rental: deposit + signature + overall damage notes
ALTER TABLE "RentalOrder" ADD COLUMN "depositCents" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "RentalOrder" ADD COLUMN "depositReturned" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "RentalOrder" ADD COLUMN "signatureUrl" TEXT;
ALTER TABLE "RentalOrder" ADD COLUMN "damageNotes" TEXT;

-- RentalInventory: pool condition + maintenance tracking
ALTER TABLE "RentalInventory" ADD COLUMN "condition" TEXT NOT NULL DEFAULT 'bueno';
ALTER TABLE "RentalInventory" ADD COLUMN "lastMaintenanceAt" TIMESTAMP(3);

CREATE INDEX "RentalInventory_tenantId_condition_idx" ON "RentalInventory"("tenantId", "condition");
