export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";

type RouteParams = { params: Promise<{ id: string }> };

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { id } = await params;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "cms");
  if (modErr) return modErr;

  const log = logger.child({ tenantId, path: `/api/cms/media/${id}` });

  try {
    const existing = await prisma.mediaFile.findFirst({ where: { id, tenantId } });
    if (!existing) return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });

    // If file was uploaded to S3, delete from storage too
    if (existing.fileKey) {
      try {
        const { deleteFile } = await import("@/lib/storage/s3");
        await deleteFile(existing.fileKey);
      } catch {
        log.warn({ fileKey: existing.fileKey }, "Failed to delete file from S3 — removing DB record anyway");
      }
    }

    await prisma.mediaFile.delete({ where: { id } });
    log.info({ fileId: id }, "Media file deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, { publicMessage: "Error al eliminar archivo", code: "CMS_MEDIA_ERROR", logContext: { tenantId } });
  }
}
