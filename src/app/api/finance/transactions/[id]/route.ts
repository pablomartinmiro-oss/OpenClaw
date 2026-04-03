export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, updateTransactionSchema } from "@/lib/validation";

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
  const log = logger.child({ tenantId, path: `/api/finance/transactions/${id}` });

  try {
    const existing = await prisma.transaction.findFirst({ where: { id, tenantId } });
    if (!existing) return NextResponse.json({ error: "Transacción no encontrada" }, { status: 404 });

    const body = await request.json();
    const validated = validateBody(body, updateTransactionSchema);
    if (!validated.ok) return NextResponse.json({ error: validated.error }, { status: 400 });

    const transaction = await prisma.transaction.update({ where: { id, tenantId }, data: validated.data });
    log.info({ transactionId: id }, "Transaction updated");
    return NextResponse.json({ transaction });
  } catch (error) {
    return apiError(error, { publicMessage: "Error al actualizar transacción", code: "TRANSACTION_ERROR", logContext: { tenantId } });
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
  const log = logger.child({ tenantId, path: `/api/finance/transactions/${id}` });

  try {
    const existing = await prisma.transaction.findFirst({ where: { id, tenantId } });
    if (!existing) return NextResponse.json({ error: "Transacción no encontrada" }, { status: 404 });
    await prisma.transaction.delete({ where: { id, tenantId } });
    log.info({ transactionId: id }, "Transaction deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, { publicMessage: "Error al eliminar transacción", code: "TRANSACTION_ERROR", logContext: { tenantId } });
  }
}
