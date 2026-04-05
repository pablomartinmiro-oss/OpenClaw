export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";

type Ctx = { params: Promise<{ id: string; extraId: string }> };

export async function DELETE(_request: NextRequest, context: Ctx) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const modError = await requireModule(tenantId, "finance");
  if (modError) return modError;

  const { id, extraId } = await context.params;
  const log = logger.child({ tenantId, path: `/api/payroll/${id}/extras/${extraId}` });

  try {
    const extra = await prisma.payrollExtra.findFirst({
      where: { id: extraId, payrollId: id, tenantId },
    });
    if (!extra) {
      return NextResponse.json({ error: "Extra no encontrado" }, { status: 404 });
    }

    await prisma.payrollExtra.delete({ where: { id: extraId } });

    // Recalculate payroll totals
    const record = await prisma.payrollRecord.findFirst({
      where: { id, tenantId },
    });
    if (record) {
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
    }

    log.info({ extraId }, "Payroll extra deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al eliminar extra",
      code: "PAYROLL_EXTRAS_ERROR",
      logContext: { tenantId },
    });
  }
}
