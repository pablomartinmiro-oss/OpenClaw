export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, createReavDocumentSchema } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "reav");
  if (modErr) return modErr;

  const { id } = await params;
  const log = logger.child({
    tenantId,
    path: `/api/reav/expedients/${id}/documents`,
  });

  try {
    const expedient = await prisma.reavExpedient.findFirst({
      where: { id, tenantId },
      select: { id: true },
    });
    if (!expedient) {
      return NextResponse.json(
        { error: "Expediente no encontrado" },
        { status: 404 }
      );
    }

    const documents = await prisma.reavDocument.findMany({
      where: { expedientId: id, tenantId },
      orderBy: { uploadedAt: "desc" },
    });

    log.info({ count: documents.length }, "REAV documents fetched");
    return NextResponse.json({ documents });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener documentos REAV",
      code: "REAV_DOCUMENTS_ERROR",
      logContext: { tenantId, expedientId: id },
    });
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "reav");
  if (modErr) return modErr;

  const { id } = await params;
  const log = logger.child({
    tenantId,
    path: `/api/reav/expedients/${id}/documents`,
  });

  try {
    const expedient = await prisma.reavExpedient.findFirst({
      where: { id, tenantId },
      select: { id: true },
    });
    if (!expedient) {
      return NextResponse.json(
        { error: "Expediente no encontrado" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = validateBody(body, createReavDocumentSchema);
    if (!validated.ok)
      return NextResponse.json({ error: validated.error }, { status: 400 });

    const document = await prisma.reavDocument.create({
      data: {
        tenantId,
        expedientId: id,
        type: validated.data.type,
        url: validated.data.url,
      },
    });

    log.info({ documentId: document.id }, "REAV document created");
    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al crear documento REAV",
      code: "REAV_DOCUMENT_CREATE_ERROR",
      logContext: { tenantId, expedientId: id },
    });
  }
}
