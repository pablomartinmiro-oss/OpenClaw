export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, updateExpenseCategorySchema } from "@/lib/validation";

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

  try {
    const existing = await prisma.expenseCategory.findFirst({ where: { id, tenantId } });
    if (!existing) return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });

    const body = await request.json();
    const validated = validateBody(body, updateExpenseCategorySchema);
    if (!validated.ok) return NextResponse.json({ error: validated.error }, { status: 400 });

    const category = await prisma.expenseCategory.update({ where: { id, tenantId }, data: validated.data });
    return NextResponse.json({ category });
  } catch (error) {
    return apiError(error, { publicMessage: "Error al actualizar categoría", code: "EXPENSE_CAT_ERROR", logContext: { tenantId } });
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

  try {
    const existing = await prisma.expenseCategory.findFirst({ where: { id, tenantId } });
    if (!existing) return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });
    await prisma.expenseCategory.delete({ where: { id, tenantId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, { publicMessage: "Error al eliminar categoría", code: "EXPENSE_CAT_ERROR", logContext: { tenantId } });
  }
}
