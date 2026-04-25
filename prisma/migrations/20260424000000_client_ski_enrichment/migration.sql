-- Client model: ski-specific enrichment + lifetime metrics
ALTER TABLE "Client" ADD COLUMN "skiLevel" TEXT;
ALTER TABLE "Client" ADD COLUMN "preferredStation" TEXT;
ALTER TABLE "Client" ADD COLUMN "bootSize" TEXT;
ALTER TABLE "Client" ADD COLUMN "height" INTEGER;
ALTER TABLE "Client" ADD COLUMN "weight" INTEGER;
ALTER TABLE "Client" ADD COLUMN "helmetSize" TEXT;
ALTER TABLE "Client" ADD COLUMN "language" TEXT;
ALTER TABLE "Client" ADD COLUMN "dni" TEXT;
ALTER TABLE "Client" ADD COLUMN "totalSpent" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Client" ADD COLUMN "visitCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Client" ADD COLUMN "lastVisit" TIMESTAMP(3);

CREATE INDEX "Client_tenantId_skiLevel_idx" ON "Client"("tenantId", "skiLevel");
CREATE INDEX "Client_tenantId_preferredStation_idx" ON "Client"("tenantId", "preferredStation");
