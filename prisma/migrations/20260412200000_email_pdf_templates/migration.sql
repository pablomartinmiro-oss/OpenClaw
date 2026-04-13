-- CreateTable
CREATE TABLE "EmailTemplate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "templateKey" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "recipient" TEXT,
    "subject" TEXT NOT NULL,
    "headerImageUrl" TEXT,
    "headerTitle" TEXT,
    "headerSubtitle" TEXT,
    "bodyHtml" TEXT NOT NULL,
    "footerText" TEXT,
    "ctaLabel" TEXT,
    "ctaUrl" TEXT,
    "variables" TEXT,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PdfTemplate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "templateKey" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "logoUrl" TEXT,
    "headerColor" TEXT DEFAULT '#E87B5A',
    "accentColor" TEXT DEFAULT '#5B8C6D',
    "companyName" TEXT,
    "companyAddress" TEXT,
    "companyPhone" TEXT,
    "companyEmail" TEXT,
    "companyNif" TEXT,
    "footerText" TEXT,
    "legalText" TEXT,
    "showLogo" BOOLEAN NOT NULL DEFAULT true,
    "showWatermark" BOOLEAN NOT NULL DEFAULT false,
    "bodyHtml" TEXT NOT NULL,
    "variables" TEXT,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PdfTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailTemplate_tenantId_templateKey_key" ON "EmailTemplate"("tenantId", "templateKey");

-- CreateIndex
CREATE INDEX "EmailTemplate_tenantId_idx" ON "EmailTemplate"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "PdfTemplate_tenantId_templateKey_key" ON "PdfTemplate"("tenantId", "templateKey");

-- CreateIndex
CREATE INDEX "PdfTemplate_tenantId_idx" ON "PdfTemplate"("tenantId");

-- AddForeignKey
ALTER TABLE "EmailTemplate" ADD CONSTRAINT "EmailTemplate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PdfTemplate" ADD CONSTRAINT "PdfTemplate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
