export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, updateExpenseSchema } from "@/lib/validation";

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
    const expense = await prisma.expense.findFirst({
      where: { id, tenantId },
      include: {
        category: { select: { id: true, name: true } },
        costCenter: { select: { id: true, name: true } },
        supplier: { select: { id: true, fiscalName: true } },
        files: { orderBy: { uploadedAt: "desc" } },
        recurring: true,
      },
    });
    if (!expense) return NextResponse.json({ error: "Gasto no encontrado" }, { status: 404 });
    return NextResponse.json({ expense });
  } catch (error) {
    return apiError(error, { publicMessage: "Error al obtener gasto", code: "EXPENSE_ERROR", logContext: { tenantId } });
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
  const log = logger.child({ tenantId, path: `/api/finance/expenses/${id}` });

  try {
    const existing = await prisma.expense.findFirst({ where: { id, tenantId } });
    if (!existing) return NextResponse.json({ error: "Gasto no encontrado" }, { status: 404 });

    const body = await request.json();
    const validated = validateBody(body, updateExpenseSchema);
    if (!validated.ok) return NextResponse.json({ error: validated.error }, { status: 400 });

    const expense = await prisma.expense.update({ where: { id, tenantId }, data: validated.data });
    log.info({ expenseId: id }, "Expense updated");
    return NextResponse.json({ expense });
  } catch (error) {
    return apiError(error, { publicMessage: "Error al actualizar gasto", code: "EXPENSE_ERROR", logContext: { tenantId } });
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
  const log = logger.child({ tenantId, path: `/api/finance/expenses/${id}` });

  try {
    const existing = await prisma.expense.findFirst({ where: { id, tenantId } });
    if (!existing) return NextResponse.json({ error: "Gasto no encontrado" }, { status: 404 });
    await prisma.expense.delete({ where: { id, tenantId } });
    log.info({ expenseId: id }, "Expense deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, { publicMessage: "Error al eliminar gasto", code: "EXPENSE_ERROR", logContext: { tenantId } });
  }
}
