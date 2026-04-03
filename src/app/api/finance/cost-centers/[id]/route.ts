export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, updateCostCenterSchema } from "@/lib/validation";

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
  const log = logger.child({ tenantId, path: `/api/finance/cost-centers/${id}` });

  try {
    const existing = await prisma.costCenter.findFirst({ where: { id, tenantId } });
    if (!existing) return NextResponse.json({ error: "Centro de coste no encontrado" }, { status: 404 });

    const body = await request.json();
    const validated = validateBody(body, updateCostCenterSchema);
    if (!validated.ok) return NextResponse.json({ error: validated.error }, { status: 400 });

    const costCenter = await prisma.costCenter.update({ where: { id, tenantId }, data: validated.data });
    log.info({ costCenterId: id }, "Cost center updated");
    return NextResponse.json({ costCenter });
  } catch (error) {
    return apiError(error, { publicMessage: "Error al actualizar centro de coste", code: "COST_CENTER_ERROR", logContext: { tenantId } });
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
  const log = logger.child({ tenantId, path: `/api/finance/cost-centers/${id}` });

  try {
    const existing = await prisma.costCenter.findFirst({ where: { id, tenantId } });
    if (!existing) return NextResponse.json({ error: "Centro de coste no encontrado" }, { status: 404 });
    await prisma.costCenter.delete({ where: { id, tenantId } });
    log.info({ costCenterId: id }, "Cost center deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, { publicMessage: "Error al eliminar centro de coste", code: "COST_CENTER_ERROR", logContext: { tenantId } });
  }
}
