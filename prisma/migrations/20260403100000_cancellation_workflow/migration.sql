-- CreateTable
CREATE TABLE "CancellationRequest" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "reservationId" TEXT,
    "quoteId" TEXT,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'recibida',
    "resolution" TEXT,
    "operationalStatus" TEXT,
    "financialStatus" TEXT,
    "refundAmount" DOUBLE PRECISION,
    "creditNoteNumber" TEXT,
    "submissionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CancellationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CancellationLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "previousStatus" TEXT NOT NULL,
    "newStatus" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "notes" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CancellationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CancellationRequest_tenantId_status_idx" ON "CancellationRequest"("tenantId", "status");

-- CreateIndex
CREATE INDEX "CancellationRequest_tenantId_reservationId_idx" ON "CancellationRequest"("tenantId", "reservationId");

-- CreateIndex
CREATE INDEX "CancellationLog_tenantId_requestId_idx" ON "CancellationLog"("tenantId", "requestId");

-- AddForeignKey
ALTER TABLE "CancellationRequest" ADD CONSTRAINT "CancellationRequest_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CancellationLog" ADD CONSTRAINT "CancellationLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CancellationLog" ADD CONSTRAINT "CancellationLog_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "CancellationRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey (CompensationVoucher -> CancellationRequest)
ALTER TABLE "CompensationVoucher" ADD CONSTRAINT "CompensationVoucher_cancellationId_fkey" FOREIGN KEY ("cancellationId") REFERENCES "CancellationRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
