export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, createExpenseCategorySchema } from "@/lib/validation";

export async function GET() {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "finance");
  if (modErr) return modErr;

  try {
    const categories = await prisma.expenseCategory.findMany({ where: { tenantId }, orderBy: { name: "asc" } });
    return NextResponse.json({ categories });
  } catch (error) {
    return apiError(error, { publicMessage: "Error al obtener categorías de gasto", code: "EXPENSE_CAT_ERROR", logContext: { tenantId } });
  }
}

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "finance");
  if (modErr) return modErr;
  const log = logger.child({ tenantId, path: "/api/finance/expense-categories" });

  try {
    const body = await request.json();
    const validated = validateBody(body, createExpenseCategorySchema);
    if (!validated.ok) return NextResponse.json({ error: validated.error }, { status: 400 });

    const category = await prisma.expenseCategory.create({ data: { tenantId, ...validated.data } });
    log.info({ categoryId: category.id }, "Expense category created");
    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    return apiError(error, { publicMessage: "Error al crear categoría de gasto", code: "EXPENSE_CAT_ERROR", logContext: { tenantId } });
  }
}
