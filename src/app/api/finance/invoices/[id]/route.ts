export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, updateInvoiceSchema } from "@/lib/validation";
import { createReavFromInvoice } from "@/lib/finance/auto-reav";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { id } = await params;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "finance");
  if (modErr) return modErr;

  try {
    const invoice = await prisma.invoice.findFirst({
      where: { id, tenantId },
      include: {
        client: { select: { id: true, name: true, email: true } },
        lines: { orderBy: { createdAt: "asc" } },
        transactions: { orderBy: { date: "desc" } },
      },
    });
    if (!invoice) return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 });
    return NextResponse.json({ invoice });
  } catch (error) {
    return apiError(error, { publicMessage: "Error al obtener factura", code: "INVOICE_GET_ERROR", logContext: { tenantId } });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { id } = await params;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "finance");
  if (modErr) return modErr;
  const log = logger.child({ tenantId, path: `/api/finance/invoices/${id}` });

  try {
    const existing = await prisma.invoice.findFirst({ where: { id, tenantId } });
    if (!existing) return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 });

    const body = await request.json();
    const validated = validateBody(body, updateInvoiceSchema);
    if (!validated.ok) return NextResponse.json({ error: validated.error }, { status: 400 });
    const data = validated.data;

    const updateData: Record<string, unknown> = {};
    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === "sent" && !existing.issuedAt) updateData.issuedAt = new Date();
      if (data.status === "paid") updateData.paidAt = new Date();
    }
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.clientId !== undefined) updateData.clientId = data.clientId;

    const invoice = await prisma.invoice.update({ where: { id, tenantId }, data: updateData });
    log.info({ invoiceId: id }, "Invoice updated");

    // Auto-create REAV expedient when invoice is sent or paid
    if (data.status === "sent" || data.status === "paid") {
      createReavFromInvoice(tenantId, id).catch((err) => {
        log.error({ err, invoiceId: id }, "Auto-REAV creation failed — non-blocking");
      });
    }

    return NextResponse.json({ invoice });
  } catch (error) {
    return apiError(error, { publicMessage: "Error al actualizar factura", code: "INVOICE_UPDATE_ERROR", logContext: { tenantId } });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { id } = await params;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "finance");
  if (modErr) return modErr;
  const log = logger.child({ tenantId, path: `/api/finance/invoices/${id}` });

  try {
    const existing = await prisma.invoice.findFirst({ where: { id, tenantId } });
    if (!existing) return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 });
    if (existing.status !== "draft") return NextResponse.json({ error: "Solo se pueden eliminar borradores" }, { status: 400 });

    await prisma.invoice.delete({ where: { id, tenantId } });
    log.info({ invoiceId: id }, "Invoice deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, { publicMessage: "Error al eliminar factura", code: "INVOICE_DELETE_ERROR", logContext: { tenantId } });
  }
}
