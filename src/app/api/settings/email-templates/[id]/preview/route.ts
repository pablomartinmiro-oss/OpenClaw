export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { apiError, notFound } from "@/lib/api-response";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [session, authError] = await requireTenant();
    if (authError) return authError;

    const { tenantId } = session;
    const { id } = await params;

    const template = await prisma.emailTemplate.findFirst({
      where: { id, tenantId },
    });
    if (!template) return notFound("Plantilla");

    // Return the HTML directly for preview rendering
    return new NextResponse(template.bodyHtml, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al previsualizar plantilla",
      code: "EMAIL_TEMPLATE_PREVIEW_ERROR",
    });
  }
}
