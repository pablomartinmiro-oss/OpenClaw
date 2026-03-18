-- AlterTable: Add payment, PDF, email, GHL, and internal fields to Quote
ALTER TABLE "Quote" ADD COLUMN "redsysOrderId" TEXT;
ALTER TABLE "Quote" ADD COLUMN "redsysPaymentUrl" TEXT;
ALTER TABLE "Quote" ADD COLUMN "paymentMethod" TEXT;
ALTER TABLE "Quote" ADD COLUMN "paymentStatus" TEXT DEFAULT 'pending';
ALTER TABLE "Quote" ADD COLUMN "paidAt" TIMESTAMP(3);
ALTER TABLE "Quote" ADD COLUMN "paymentRef" TEXT;
ALTER TABLE "Quote" ADD COLUMN "pdfUrl" TEXT;
ALTER TABLE "Quote" ADD COLUMN "emailSentAt" TIMESTAMP(3);
ALTER TABLE "Quote" ADD COLUMN "emailSentTo" TEXT;
ALTER TABLE "Quote" ADD COLUMN "reminderSentAt" TIMESTAMP(3);
ALTER TABLE "Quote" ADD COLUMN "reminderCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Quote" ADD COLUMN "ghlOpportunityId" TEXT;
ALTER TABLE "Quote" ADD COLUMN "ghlPipelineId" TEXT;
ALTER TABLE "Quote" ADD COLUMN "ghlStageId" TEXT;
ALTER TABLE "Quote" ADD COLUMN "internalNotes" TEXT;
ALTER TABLE "Quote" ADD COLUMN "cancelledAt" TIMESTAMP(3);
ALTER TABLE "Quote" ADD COLUMN "cancelReason" TEXT;
ALTER TABLE "Quote" ADD COLUMN "createdBy" TEXT;

-- CreateIndex: Unique constraint on redsysOrderId
CREATE UNIQUE INDEX "Quote_redsysOrderId_key" ON "Quote"("redsysOrderId");

-- AlterTable: Add ski product fields to QuoteItem
ALTER TABLE "QuoteItem" ADD COLUMN "startDate" TIMESTAMP(3);
ALTER TABLE "QuoteItem" ADD COLUMN "endDate" TIMESTAMP(3);
ALTER TABLE "QuoteItem" ADD COLUMN "station" TEXT;
ALTER TABLE "QuoteItem" ADD COLUMN "modalidad" TEXT;
ALTER TABLE "QuoteItem" ADD COLUMN "nivel" TEXT;
ALTER TABLE "QuoteItem" ADD COLUMN "sector" TEXT;
ALTER TABLE "QuoteItem" ADD COLUMN "idioma" TEXT;
ALTER TABLE "QuoteItem" ADD COLUMN "notes" TEXT;
