export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireOwner } from "@/lib/auth/guard";
import { apiError, badRequest, notFound } from "@/lib/api-response";
import { validateBody, updatePdfTemplateSchema } from "@/lib/validation";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [session, authError] = await requireOwner();
    if (authError) return authError;

    const { tenantId } = session;
    const { id } = await params;

    const template = await prisma.pdfTemplate.findFirst({
      where: { id, tenantId },
    });
    if (!template) return notFound("Plantilla PDF");

    return NextResponse.json({ template });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener plantilla PDF",
      code: "PDF_TEMPLATE_GET_ERROR",
    });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [session, authError] = await requireOwner();
    if (authError) return authError;

    const { tenantId } = session;
    const { id } = await params;
    const log = logger.child({ tenantId, templateId: id });

    const body = await request.json();
    const parsed = validateBody(body, updatePdfTemplateSchema);
    if (!parsed.ok) return badRequest(parsed.error);

    const template = await prisma.pdfTemplate.update({
      where: { id, tenantId },
      data: parsed.data,
    });

    log.info("PDF template updated");
    return NextResponse.json({ template });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al actualizar plantilla PDF",
      code: "PDF_TEMPLATE_UPDATE_ERROR",
    });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [session, authError] = await requireOwner();
    if (authError) return authError;

    const { tenantId } = session;
    const { id } = await params;
    const log = logger.child({ tenantId, templateId: id });

    await prisma.pdfTemplate.delete({
      where: { id, tenantId },
    });

    log.info("PDF template deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al eliminar plantilla PDF",
      code: "PDF_TEMPLATE_DELETE_ERROR",
    });
  }
}
