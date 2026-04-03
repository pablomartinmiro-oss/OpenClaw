export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";

type Params = { params: Promise<{ id: string; costId: string }> };

export async function DELETE(_request: NextRequest, { params }: Params) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "reav");
  if (modErr) return modErr;

  const { id, costId } = await params;
  const log = logger.child({
    tenantId,
    path: `/api/reav/expedients/${id}/costs/${costId}`,
  });

  try {
    // Verify cost belongs to tenant and expedient
    const cost = await prisma.reavCost.findFirst({
      where: { id: costId, expedientId: id, tenantId },
      select: { id: true },
    });
    if (!cost) {
      return NextResponse.json(
        { error: "Coste no encontrado" },
        { status: 404 }
      );
    }

    await prisma.reavCost.delete({ where: { id: costId } });

    log.info({ costId }, "REAV cost deleted");
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al eliminar coste REAV",
      code: "REAV_COST_DELETE_ERROR",
      logContext: { tenantId, expedientId: id, costId },
    });
  }
}
