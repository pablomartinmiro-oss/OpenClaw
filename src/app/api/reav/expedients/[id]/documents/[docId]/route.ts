export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";

type Params = { params: Promise<{ id: string; docId: string }> };

export async function DELETE(_request: NextRequest, { params }: Params) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "reav");
  if (modErr) return modErr;

  const { id, docId } = await params;
  const log = logger.child({
    tenantId,
    path: `/api/reav/expedients/${id}/documents/${docId}`,
  });

  try {
    const document = await prisma.reavDocument.findFirst({
      where: { id: docId, expedientId: id, tenantId },
      select: { id: true },
    });
    if (!document) {
      return NextResponse.json(
        { error: "Documento no encontrado" },
        { status: 404 }
      );
    }

    await prisma.reavDocument.delete({ where: { id: docId } });

    log.info({ docId }, "REAV document deleted");
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al eliminar documento REAV",
      code: "REAV_DOCUMENT_DELETE_ERROR",
      logContext: { tenantId, expedientId: id, docId },
    });
  }
}
