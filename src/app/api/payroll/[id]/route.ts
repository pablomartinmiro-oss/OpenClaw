export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, updatePayrollSchema } from "@/lib/validation";

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
      include: {
        user: { select: { id: true, name: true, email: true } },
        extras: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!record) {
      return NextResponse.json({ error: "Nomina no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ record });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener nomina",
      code: "PAYROLL_GET_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function PATCH(request: NextRequest, context: Ctx) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const modError = await requireModule(tenantId, "finance");
  if (modError) return modError;

  const { id } = await context.params;
  const log = logger.child({ tenantId, path: `/api/payroll/${id}` });

  try {
    const existing = await prisma.payrollRecord.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Nomina no encontrada" }, { status: 404 });
    }

    const body = await request.json();
    const validated = validateBody(body, updatePayrollSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const data = validated.data;

    const updateData: Record<string, unknown> = {};
    if (data.baseSalary !== undefined) updateData.baseSalary = data.baseSalary;
    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === "paid") updateData.paidAt = new Date();
    }
    if (data.notes !== undefined) updateData.notes = data.notes;

    // Recalculate total if baseSalary changed
    if (data.baseSalary !== undefined) {
      const extras = await prisma.payrollExtra.findMany({
        where: { payrollId: id, tenantId },
      });
      const totalExtras = extras.reduce((sum, e) => {
        return e.type === "deduction" ? sum - e.amount : sum + e.amount;
      }, 0);
      updateData.totalExtras = totalExtras;
      updateData.totalAmount = data.baseSalary + totalExtras;
    }

    const record = await prisma.payrollRecord.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true } },
        extras: true,
      },
    });

    log.info({ recordId: id }, "Payroll record updated");
    return NextResponse.json({ record });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al actualizar nomina",
      code: "PAYROLL_UPDATE_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function DELETE(_request: NextRequest, context: Ctx) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const modError = await requireModule(tenantId, "finance");
  if (modError) return modError;

  const { id } = await context.params;
  const log = logger.child({ tenantId, path: `/api/payroll/${id}` });

  try {
    const existing = await prisma.payrollRecord.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Nomina no encontrada" }, { status: 404 });
    }

    await prisma.payrollRecord.delete({ where: { id } });

    log.info({ recordId: id }, "Payroll record deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al eliminar nomina",
      code: "PAYROLL_DELETE_ERROR",
      logContext: { tenantId },
    });
  }
}
