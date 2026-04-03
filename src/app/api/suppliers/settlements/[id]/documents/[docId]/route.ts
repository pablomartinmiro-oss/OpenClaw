export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";

type RouteParams = { params: Promise<{ id: string; docId: string }> };

export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { id, docId } = await params;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "suppliers");
  if (modErr) return modErr;

  const log = logger.child({
    tenantId,
    path: `/api/suppliers/settlements/${id}/documents/${docId}`,
  });

  try {
    const doc = await prisma.settlementDocument.findFirst({
      where: { id: docId, settlementId: id, tenantId },
    });
    if (!doc) {
      return NextResponse.json(
        { error: "Documento no encontrado" },
        { status: 404 }
      );
    }

    await prisma.settlementDocument.delete({ where: { id: docId } });

    log.info({ docId }, "Settlement document deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al eliminar documento de liquidacion",
      code: "SETTLEMENT_DOC_DELETE_ERROR",
      logContext: { tenantId },
    });
  }
}
