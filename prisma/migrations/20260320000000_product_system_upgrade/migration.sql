-- AlterTable: Add per-product variables to QuoteItem
ALTER TABLE "QuoteItem" ADD COLUMN "category" TEXT;
ALTER TABLE "QuoteItem" ADD COLUMN "numDays" INTEGER;
ALTER TABLE "QuoteItem" ADD COLUMN "numPersons" INTEGER;
ALTER TABLE "QuoteItem" ADD COLUMN "ageDetails" JSONB;
ALTER TABLE "QuoteItem" ADD COLUMN "horario" TEXT;
ALTER TABLE "QuoteItem" ADD COLUMN "puntoEncuentro" TEXT;
ALTER TABLE "QuoteItem" ADD COLUMN "tipoCliente" TEXT;
ALTER TABLE "QuoteItem" ADD COLUMN "gama" TEXT;
ALTER TABLE "QuoteItem" ADD COLUMN "casco" BOOLEAN;
ALTER TABLE "QuoteItem" ADD COLUMN "tipoActividad" TEXT;
ALTER TABLE "QuoteItem" ADD COLUMN "tallaBotas" TEXT;
ALTER TABLE "QuoteItem" ADD COLUMN "alturaPeso" TEXT;
ALTER TABLE "QuoteItem" ADD COLUMN "dni" TEXT;
ALTER TABLE "QuoteItem" ADD COLUMN "regimen" TEXT;
ALTER TABLE "QuoteItem" ADD COLUMN "alojamientoNombre" TEXT;
ALTER TABLE "QuoteItem" ADD COLUMN "seguroIncluido" BOOLEAN;

-- AlterTable: Add cancellation fields to Quote
ALTER TABLE "Quote" ADD COLUMN "cancelType" TEXT;
ALTER TABLE "Quote" ADD COLUMN "cancelNotes" TEXT;
ALTER TABLE "Quote" ADD COLUMN "refundIban" TEXT;
ALTER TABLE "Quote" ADD COLUMN "refundTitular" TEXT;
ALTER TABLE "Quote" ADD COLUMN "refundStatus" TEXT;
ALTER TABLE "Quote" ADD COLUMN "bonoCode" TEXT;
ALTER TABLE "Quote" ADD COLUMN "bonoAmount" DOUBLE PRECISION;
ALTER TABLE "Quote" ADD COLUMN "bonoExpiresAt" TIMESTAMP(3);

-- CreateTable: Task
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "quoteItemId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "dueDate" TIMESTAMP(3),
    "assignedTo" TEXT,
    "completedAt" TIMESTAMP(3),
    "completedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Task_tenantId_status_idx" ON "Task"("tenantId", "status");
CREATE INDEX "Task_quoteId_idx" ON "Task"("quoteId");
CREATE INDEX "Task_tenantId_dueDate_idx" ON "Task"("tenantId", "dueDate");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Task" ADD CONSTRAINT "Task_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Task" ADD CONSTRAINT "Task_quoteItemId_fkey" FOREIGN KEY ("quoteItemId") REFERENCES "QuoteItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
