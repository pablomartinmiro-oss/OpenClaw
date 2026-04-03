export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, createCostCenterSchema } from "@/lib/validation";

export async function GET() {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "finance");
  if (modErr) return modErr;

  try {
    const costCenters = await prisma.costCenter.findMany({ where: { tenantId }, orderBy: { name: "asc" } });
    return NextResponse.json({ costCenters });
  } catch (error) {
    return apiError(error, { publicMessage: "Error al obtener centros de coste", code: "COST_CENTERS_ERROR", logContext: { tenantId } });
  }
}

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "finance");
  if (modErr) return modErr;
  const log = logger.child({ tenantId, path: "/api/finance/cost-centers" });

  try {
    const body = await request.json();
    const validated = validateBody(body, createCostCenterSchema);
    if (!validated.ok) return NextResponse.json({ error: validated.error }, { status: 400 });

    const costCenter = await prisma.costCenter.create({ data: { tenantId, ...validated.data } });
    log.info({ costCenterId: costCenter.id }, "Cost center created");
    return NextResponse.json({ costCenter }, { status: 201 });
  } catch (error) {
    return apiError(error, { publicMessage: "Error al crear centro de coste", code: "COST_CENTER_ERROR", logContext: { tenantId } });
  }
}
