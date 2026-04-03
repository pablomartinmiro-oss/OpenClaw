export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";

type RouteParams = { params: Promise<{ id: string; movId: string }> };

export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { id, movId } = await params;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "tpv");
  if (modErr) return modErr;

  const log = logger.child({
    tenantId,
    path: `/api/tpv/sessions/${id}/movements/${movId}`,
  });

  try {
    // Verify session belongs to tenant
    const cashSession = await prisma.cashSession.findFirst({
      where: { id, tenantId },
    });
    if (!cashSession) {
      return NextResponse.json(
        { error: "Sesion no encontrada" },
        { status: 404 }
      );
    }
    if (cashSession.status === "closed") {
      return NextResponse.json(
        { error: "No se pueden eliminar movimientos de una sesion cerrada" },
        { status: 400 }
      );
    }

    // Verify movement exists and belongs to session
    const movement = await prisma.cashMovement.findFirst({
      where: { id: movId, tenantId, sessionId: id },
    });
    if (!movement) {
      return NextResponse.json(
        { error: "Movimiento no encontrado" },
        { status: 404 }
      );
    }

    await prisma.cashMovement.delete({ where: { id: movId } });

    log.info({ movementId: movId }, "Cash movement deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al eliminar movimiento",
      code: "MOVEMENT_DELETE_ERROR",
      logContext: { tenantId },
    });
  }
}
