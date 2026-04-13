export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireOwner } from "@/lib/auth/guard";
import { apiError, notFound } from "@/lib/api-response";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/db";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [session, authError] = await requireOwner();
    if (authError) return authError;

    const { tenantId } = session;
    const { id } = await params;
    const log = logger.child({ tenantId, templateId: id });

    const template = await prisma.emailTemplate.findFirst({
      where: { id, tenantId },
    });
    if (!template) return notFound("Plantilla");

    // Restore: re-activate a deactivated template
    const updated = await prisma.emailTemplate.update({
      where: { id, tenantId },
      data: { isActive: true },
    });

    log.info("Email template restored");
    return NextResponse.json({ template: updated });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al restaurar plantilla",
      code: "EMAIL_TEMPLATE_RESTORE_ERROR",
    });
  }
}
