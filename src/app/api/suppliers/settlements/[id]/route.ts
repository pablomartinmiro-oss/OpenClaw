export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, updateSettlementSchema } from "@/lib/validation";
import { sendEmail } from "@/lib/email/client";
import { buildSettlementNotificationHTML } from "@/lib/email/module-templates";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { id } = await params;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "suppliers");
  if (modErr) return modErr;

  const log = logger.child({
    tenantId,
    path: `/api/suppliers/settlements/${id}`,
  });

  try {
    const settlement = await prisma.supplierSettlement.findFirst({
      where: { id, tenantId },
      include: {
        supplier: {
          select: { id: true, fiscalName: true, commercialName: true },
        },
        lines: { orderBy: { serviceDate: "asc" } },
        documents: { orderBy: { uploadedAt: "desc" } },
        statusLog: { orderBy: { timestamp: "desc" } },
      },
    });

    if (!settlement) {
      return NextResponse.json(
        { error: "Liquidacion no encontrada" },
        { status: 404 }
      );
    }

    log.info({ settlementId: id }, "Settlement fetched");
    return NextResponse.json({ settlement });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener liquidacion",
      code: "SETTLEMENT_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { id } = await params;
  const { tenantId, userId } = session;
  const modErr = await requireModule(tenantId, "suppliers");
  if (modErr) return modErr;

  const log = logger.child({
    tenantId,
    path: `/api/suppliers/settlements/${id}`,
  });

  try {
    const existing = await prisma.supplierSettlement.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Liquidacion no encontrada" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = validateBody(body, updateSettlementSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const data = validated.data;

    const settlement = await prisma.$transaction(async (tx) => {
      const updateData: Record<string, unknown> = {};
      if (data.pdfUrl !== undefined) updateData.pdfUrl = data.pdfUrl ?? null;

      // Status change creates a log entry
      if (data.status && data.status !== existing.status) {
        const allowed: Record<string, string[]> = {
          draft: ["sent"],
          sent: ["accepted", "draft"],
          accepted: ["paid", "sent"],
          paid: [],
        };
        if (!allowed[existing.status]?.includes(data.status)) {
          throw new Error(
            `TRANSITION_INVALID:${existing.status}->${data.status}`
          );
        }
        updateData.status = data.status;
        if (data.status === "sent") updateData.sentAt = new Date();
        if (data.status === "paid") updateData.paidAt = new Date();

        await tx.settlementStatusLog.create({
          data: {
            tenantId,
            settlementId: id,
            previousStatus: existing.status,
            newStatus: data.status,
            actorId: userId,
            reason: data.reason ?? null,
          },
        });
      }

      return tx.supplierSettlement.update({
        where: { id },
        data: updateData,
      });
    });

    log.info({ settlementId: id }, "Settlement updated");

    // Send email to supplier when status changes to "sent"
    if (data.status === "sent") {
      (async () => {
        try {
          const full = await prisma.supplierSettlement.findFirst({
            where: { id, tenantId },
            include: {
              supplier: { select: { fiscalName: true, email: true } },
            },
          });
          if (!full?.supplier?.email) {
            log.info({ settlementId: id }, "Supplier has no email — skipping notification");
            return;
          }
          const tenantRow = await prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { name: true },
          });
          const startStr = new Date(full.startDate).toLocaleDateString("es-ES");
          const endStr = new Date(full.endDate).toLocaleDateString("es-ES");
          const html = buildSettlementNotificationHTML({
            tenant: { name: tenantRow?.name ?? "Empresa" },
            supplierName: full.supplier.fiscalName,
            settlementNumber: full.number,
            period: `${startStr} — ${endStr}`,
            grossAmount: full.grossAmount,
            commissionAmount: full.commissionAmount,
            netAmount: full.netAmount,
          });
          await sendEmail({
            tenantId,
            contactId: null,
            subject: `Liquidacion ${full.number} — ${tenantRow?.name ?? ""}`,
            html,
            to: full.supplier.email,
          });
          log.info({ settlementId: id, to: full.supplier.email }, "Settlement notification sent");
        } catch (emailErr) {
          log.error({ err: emailErr, settlementId: id }, "Settlement email failed — non-blocking");
        }
      })();
    }

    return NextResponse.json({ settlement });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("TRANSITION_INVALID:")) {
      return NextResponse.json(
        { error: "Transicion de estado no permitida" },
        { status: 400 }
      );
    }
    return apiError(error, {
      publicMessage: "Error al actualizar liquidacion",
      code: "SETTLEMENT_UPDATE_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { id } = await params;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "suppliers");
  if (modErr) return modErr;

  const log = logger.child({
    tenantId,
    path: `/api/suppliers/settlements/${id}`,
  });

  try {
    const existing = await prisma.supplierSettlement.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Liquidacion no encontrada" },
        { status: 404 }
      );
    }

    if (existing.status !== "draft") {
      return NextResponse.json(
        { error: "Solo se pueden eliminar liquidaciones en borrador" },
        { status: 400 }
      );
    }

    await prisma.supplierSettlement.delete({ where: { id } });

    log.info({ settlementId: id }, "Settlement deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al eliminar liquidacion",
      code: "SETTLEMENT_DELETE_ERROR",
      logContext: { tenantId },
    });
  }
}
