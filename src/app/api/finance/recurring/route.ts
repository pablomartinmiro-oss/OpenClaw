export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, createRecurringExpenseSchema } from "@/lib/validation";

export async function GET() {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "finance");
  if (modErr) return modErr;

  try {
    const recurring = await prisma.recurringExpense.findMany({
      where: { tenantId },
      include: { expense: { include: { category: { select: { name: true } } } } },
      orderBy: { nextDueDate: "asc" },
    });
    return NextResponse.json({ recurring });
  } catch (error) {
    return apiError(error, { publicMessage: "Error al obtener gastos recurrentes", code: "RECURRING_ERROR", logContext: { tenantId } });
  }
}

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "finance");
  if (modErr) return modErr;
  const log = logger.child({ tenantId, path: "/api/finance/recurring" });

  try {
    const body = await request.json();
    const validated = validateBody(body, createRecurringExpenseSchema);
    if (!validated.ok) return NextResponse.json({ error: validated.error }, { status: 400 });
    const data = validated.data;

    const expense = await prisma.expense.findFirst({ where: { id: data.expenseId, tenantId } });
    if (!expense) return NextResponse.json({ error: "Gasto no encontrado" }, { status: 404 });

    const recurring = await prisma.recurringExpense.create({ data: { tenantId, ...data } });
    log.info({ recurringId: recurring.id }, "Recurring expense created");
    return NextResponse.json({ recurring }, { status: 201 });
  } catch (error) {
    return apiError(error, { publicMessage: "Error al crear gasto recurrente", code: "RECURRING_ERROR", logContext: { tenantId } });
  }
}
