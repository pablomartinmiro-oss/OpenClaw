export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, updateRecurringExpenseSchema } from "@/lib/validation";

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
  const log = logger.child({ tenantId, path: `/api/finance/recurring/${id}` });

  try {
    const existing = await prisma.recurringExpense.findFirst({ where: { id, tenantId } });
    if (!existing) return NextResponse.json({ error: "Gasto recurrente no encontrado" }, { status: 404 });

    const body = await request.json();
    const validated = validateBody(body, updateRecurringExpenseSchema);
    if (!validated.ok) return NextResponse.json({ error: validated.error }, { status: 400 });

    const recurring = await prisma.recurringExpense.update({ where: { id, tenantId }, data: validated.data });
    log.info({ recurringId: id }, "Recurring expense updated");
    return NextResponse.json({ recurring });
  } catch (error) {
    return apiError(error, { publicMessage: "Error al actualizar gasto recurrente", code: "RECURRING_ERROR", logContext: { tenantId } });
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
  const log = logger.child({ tenantId, path: `/api/finance/recurring/${id}` });

  try {
    const existing = await prisma.recurringExpense.findFirst({ where: { id, tenantId } });
    if (!existing) return NextResponse.json({ error: "Gasto recurrente no encontrado" }, { status: 404 });
    await prisma.recurringExpense.delete({ where: { id, tenantId } });
    log.info({ recurringId: id }, "Recurring expense deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, { publicMessage: "Error al eliminar gasto recurrente", code: "RECURRING_ERROR", logContext: { tenantId } });
  }
}
