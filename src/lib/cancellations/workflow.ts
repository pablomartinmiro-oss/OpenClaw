import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

const log = logger.child({ module: "cancellations" });

// ==================== TYPES ====================

interface CreateCancellationData {
  reservationId?: string | null;
  quoteId?: string | null;
  reason?: string | null;
}

interface UpdateStatusData {
  status: string;
  resolution?: string;
  financialStatus?: string;
  refundAmount?: number;
  notes?: string;
}

interface ResolveData {
  resolution: "rejected" | "fully_accepted" | "partially_accepted";
  refundAmount?: number;
  issueVoucher?: boolean;
  voucherType?: "activity" | "monetary" | "service";
  voucherValue?: number;
  voucherExpiration?: Date | null;
  notes?: string;
}

// ==================== CREATE ====================

export async function createCancellationRequest(
  tenantId: string,
  actorId: string,
  data: CreateCancellationData
) {
  const request = await prisma.cancellationRequest.create({
    data: {
      tenantId,
      reservationId: data.reservationId ?? null,
      quoteId: data.quoteId ?? null,
      reason: data.reason ?? null,
      status: "recibida",
    },
  });

  // First log entry
  await prisma.cancellationLog.create({
    data: {
      tenantId,
      requestId: request.id,
      previousStatus: "",
      newStatus: "recibida",
      actorId,
      notes: data.reason ?? "Solicitud de cancelacion creada",
    },
  });

  log.info(
    { tenantId, requestId: request.id },
    "Cancellation request created"
  );
  return request;
}

// ==================== UPDATE STATUS ====================

export async function updateCancellationStatus(
  tenantId: string,
  requestId: string,
  actorId: string,
  data: UpdateStatusData
) {
  const existing = await prisma.cancellationRequest.findFirst({
    where: { id: requestId, tenantId },
  });
  if (!existing) throw new Error("Solicitud no encontrada");

  const previousStatus = existing.status;

  const updateData: Record<string, unknown> = {
    status: data.status,
  };
  if (data.resolution !== undefined) updateData.resolution = data.resolution;
  if (data.financialStatus !== undefined)
    updateData.financialStatus = data.financialStatus;
  if (data.refundAmount !== undefined) updateData.refundAmount = data.refundAmount;
  if (data.status === "resuelta") updateData.resolvedAt = new Date();
  if (data.status === "cerrada") updateData.closedAt = new Date();

  const updated = await prisma.cancellationRequest.update({
    where: { id: requestId },
    data: updateData,
  });

  await prisma.cancellationLog.create({
    data: {
      tenantId,
      requestId,
      previousStatus,
      newStatus: data.status,
      actorId,
      notes: data.notes ?? null,
    },
  });

  log.info(
    { tenantId, requestId, from: previousStatus, to: data.status },
    "Cancellation status updated"
  );
  return updated;
}

// ==================== RESOLVE ====================

export async function resolveCancellation(
  tenantId: string,
  requestId: string,
  actorId: string,
  data: ResolveData
) {
  const existing = await prisma.cancellationRequest.findFirst({
    where: { id: requestId, tenantId },
  });
  if (!existing) throw new Error("Solicitud no encontrada");

  const previousStatus = existing.status;
  let financialStatus: string | null = null;
  let creditNoteNumber: string | null = null;
  let voucherId: string | null = null;

  // Generate credit note number if refund
  if (
    data.resolution !== "rejected" &&
    data.refundAmount &&
    data.refundAmount > 0
  ) {
    creditNoteNumber = await generateCreditNoteNumber(tenantId);
    financialStatus = "pendiente_devolucion";
  }

  // Issue voucher if requested
  if (data.issueVoucher && data.voucherType && data.voucherValue) {
    const voucher = await createCompensationVoucherForCancellation(
      tenantId,
      requestId,
      data.voucherType,
      data.voucherValue,
      data.voucherExpiration ?? null
    );
    voucherId = voucher.id;
    financialStatus = "bono_emitido";
  }

  const updated = await prisma.cancellationRequest.update({
    where: { id: requestId },
    data: {
      status: "resuelta",
      resolution: data.resolution,
      resolvedAt: new Date(),
      refundAmount: data.refundAmount ?? null,
      creditNoteNumber,
      financialStatus,
    },
  });

  await prisma.cancellationLog.create({
    data: {
      tenantId,
      requestId,
      previousStatus,
      newStatus: "resuelta",
      actorId,
      notes:
        data.notes ??
        `Resolucion: ${data.resolution}${voucherId ? " + bono emitido" : ""}`,
    },
  });

  log.info(
    { tenantId, requestId, resolution: data.resolution, voucherId },
    "Cancellation resolved"
  );
  return updated;
}

// ==================== HELPERS ====================

async function generateCreditNoteNumber(tenantId: string): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `ANU-${year}-`;
  const last = await prisma.cancellationRequest.findFirst({
    where: {
      tenantId,
      creditNoteNumber: { startsWith: prefix },
    },
    orderBy: { creditNoteNumber: "desc" },
    select: { creditNoteNumber: true },
  });

  const seq = last?.creditNoteNumber
    ? parseInt(last.creditNoteNumber.split("-")[2]) + 1
    : 1;
  return `${prefix}${String(seq).padStart(4, "0")}`;
}

async function createCompensationVoucherForCancellation(
  tenantId: string,
  cancellationId: string,
  type: "activity" | "monetary" | "service",
  value: number,
  expirationDate: Date | null
) {
  // Generate BON-YYYY-XXXX code
  const year = new Date().getFullYear();
  const last = await prisma.compensationVoucher.findFirst({
    where: { tenantId, code: { startsWith: `BON-${year}-` } },
    orderBy: { code: "desc" },
    select: { code: true },
  });
  const seq = last ? parseInt(last.code.split("-")[2]) + 1 : 1;
  const code = `BON-${year}-${String(seq).padStart(4, "0")}`;

  // Create linked discount code
  const discountCode = await prisma.discountCode.create({
    data: {
      tenantId,
      code,
      type: "fixed",
      value,
      expirationDate,
      maxUses: 1,
      isActive: true,
    },
  });

  const voucher = await prisma.compensationVoucher.create({
    data: {
      tenantId,
      code,
      cancellationId,
      type,
      value,
      expirationDate,
      linkedDiscountCodeId: discountCode.id,
    },
  });

  log.info(
    { tenantId, voucherId: voucher.id, code },
    "Compensation voucher created for cancellation"
  );
  return voucher;
}
