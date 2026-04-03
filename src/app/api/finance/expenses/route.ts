export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, createExpenseSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "finance");
  if (modErr) return modErr;
  const log = logger.child({ tenantId, path: "/api/finance/expenses" });
  const { searchParams } = request.nextUrl;

  try {
    const where: Record<string, unknown> = { tenantId };
    if (searchParams.get("categoryId")) where.categoryId = searchParams.get("categoryId");
    if (searchParams.get("costCenterId")) where.costCenterId = searchParams.get("costCenterId");
    if (searchParams.get("status")) where.status = searchParams.get("status");
    if (searchParams.get("supplierId")) where.supplierId = searchParams.get("supplierId");

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        category: { select: { id: true, name: true } },
        costCenter: { select: { id: true, name: true } },
        supplier: { select: { id: true, fiscalName: true } },
      },
      orderBy: { date: "desc" },
    });

    log.info({ count: expenses.length }, "Expenses fetched");
    return NextResponse.json({ expenses });
  } catch (error) {
    return apiError(error, { publicMessage: "Error al obtener gastos", code: "EXPENSES_ERROR", logContext: { tenantId } });
  }
}

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "finance");
  if (modErr) return modErr;
  const log = logger.child({ tenantId, path: "/api/finance/expenses" });

  try {
    const body = await request.json();
    const validated = validateBody(body, createExpenseSchema);
    if (!validated.ok) return NextResponse.json({ error: validated.error }, { status: 400 });
    const data = validated.data;

    // Verify category belongs to tenant
    const category = await prisma.expenseCategory.findFirst({ where: { id: data.categoryId, tenantId } });
    if (!category) return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });

    const expense = await prisma.expense.create({
      data: {
        tenantId,
        date: data.date,
        categoryId: data.categoryId,
        costCenterId: data.costCenterId ?? null,
        concept: data.concept,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        status: data.status,
        supplierId: data.supplierId ?? null,
      },
    });

    log.info({ expenseId: expense.id }, "Expense created");
    return NextResponse.json({ expense }, { status: 201 });
  } catch (error) {
    return apiError(error, { publicMessage: "Error al crear gasto", code: "EXPENSE_CREATE_ERROR", logContext: { tenantId } });
  }
}
