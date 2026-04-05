export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, createPayrollExtraSchema } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Ctx) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const modError = await requireModule(tenantId, "finance");
  if (modError) return modError;

  const { id } = await context.params;

  try {
    const record = await prisma.payrollRecord.findFirst({
      where: { id, tenantId },
    });
    if (!record) {
      return NextResponse.json({ error: "Nomina no encontrada" }, { status: 404 });
    }

    const extras = await prisma.payrollExtra.findMany({
      where: { payrollId: id, tenantId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ extras });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener extras",
      code: "PAYROLL_EXTRAS_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function POST(request: NextRequest, context: Ctx) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const modError = await requireModule(tenantId, "finance");
  if (modError) return modError;

  const { id } = await context.params;
  const log = logger.child({ tenantId, path: `/api/payroll/${id}/extras` });

  try {
    const record = await prisma.payrollRecord.findFirst({
      where: { id, tenantId },
    });
    if (!record) {
      return NextResponse.json({ error: "Nomina no encontrada" }, { status: 404 });
    }

    const body = await request.json();
    const validated = validateBody(body, createPayrollExtraSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const data = validated.data;

    const extra = await prisma.payrollExtra.create({
      data: {
        tenantId,
        payrollId: id,
        concept: data.concept,
        type: data.type,
        amount: data.amount,
      },
    });

    // Recalculate payroll totals
    const allExtras = await prisma.payrollExtra.findMany({
      where: { payrollId: id, tenantId },
    });
    const totalExtras = allExtras.reduce((sum, e) => {
      return e.type === "deduction" ? sum - e.amount : sum + e.amount;
    }, 0);

    await prisma.payrollRecord.update({
      where: { id },
      data: {
        totalExtras,
        totalAmount: record.baseSalary + totalExtras,
      },
    });

    log.info({ extraId: extra.id }, "Payroll extra created");
    return NextResponse.json({ extra }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al crear extra",
      code: "PAYROLL_EXTRAS_ERROR",
      logContext: { tenantId },
    });
  }
}
