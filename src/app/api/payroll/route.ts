export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, createPayrollSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const modError = await requireModule(tenantId, "finance");
  if (modError) return modError;

  const log = logger.child({ tenantId, path: "/api/payroll" });
  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get("year") ?? new Date().getFullYear().toString());
  const month = parseInt(searchParams.get("month") ?? (new Date().getMonth() + 1).toString());

  try {
    const records = await prisma.payrollRecord.findMany({
      where: { tenantId, year, month },
      include: {
        user: { select: { id: true, name: true, email: true } },
        extras: true,
      },
      orderBy: { user: { name: "asc" } },
    });

    log.info({ year, month, count: records.length }, "Payroll records fetched");
    return NextResponse.json({ records });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener nominas",
      code: "PAYROLL_LIST_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const modError = await requireModule(tenantId, "finance");
  if (modError) return modError;

  const log = logger.child({ tenantId, path: "/api/payroll" });

  try {
    const body = await request.json();
    const validated = validateBody(body, createPayrollSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const data = validated.data;

    // Verify user belongs to tenant
    const user = await prisma.user.findFirst({
      where: { id: data.userId, tenantId },
    });
    if (!user) {
      return NextResponse.json({ error: "Empleado no encontrado" }, { status: 404 });
    }

    const record = await prisma.payrollRecord.create({
      data: {
        tenantId,
        userId: data.userId,
        year: data.year,
        month: data.month,
        baseSalary: data.baseSalary,
        totalAmount: data.baseSalary,
        notes: data.notes ?? null,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        extras: true,
      },
    });

    log.info({ recordId: record.id }, "Payroll record created");
    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al crear nomina",
      code: "PAYROLL_CREATE_ERROR",
      logContext: { tenantId },
    });
  }
}
