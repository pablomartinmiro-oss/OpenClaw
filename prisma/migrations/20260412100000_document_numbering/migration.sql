-- DocumentCounter
CREATE TABLE "DocumentCounter" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "currentNumber" INTEGER NOT NULL DEFAULT 0,
    "prefix" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DocumentCounter_pkey" PRIMARY KEY ("id")
);

-- DocumentNumberLog
CREATE TABLE "DocumentNumberLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "documentNumber" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "sequence" INTEGER NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "generatedBy" TEXT,
    "context" TEXT,
    CONSTRAINT "DocumentNumberLog_pkey" PRIMARY KEY ("id")
);

-- Unique Constraints
CREATE UNIQUE INDEX "DocumentCounter_tenantId_documentType_year_key" ON "DocumentCounter"("tenantId", "documentType", "year");

-- Indexes
CREATE INDEX "DocumentCounter_tenantId_idx" ON "DocumentCounter"("tenantId");
CREATE INDEX "DocumentNumberLog_tenantId_documentType_idx" ON "DocumentNumberLog"("tenantId", "documentType");
CREATE INDEX "DocumentNumberLog_tenantId_generatedAt_idx" ON "DocumentNumberLog"("tenantId", "generatedAt");

-- Foreign Keys
ALTER TABLE "DocumentCounter" ADD CONSTRAINT "DocumentCounter_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DocumentNumberLog" ADD CONSTRAINT "DocumentNumberLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
