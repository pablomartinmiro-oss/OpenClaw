export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireOwner } from "@/lib/auth/guard";
import { apiError, badRequest, notFound } from "@/lib/api-response";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email/mailer";
import { z } from "zod";
import { validateBody } from "@/lib/validation";

const testEmailSchema = z.object({
  email: z.string().email(),
});

export async function POST(
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
    const parsed = validateBody(body, testEmailSchema);
    if (!parsed.ok) return badRequest(parsed.error);

    const template = await prisma.emailTemplate.findFirst({
      where: { id, tenantId },
    });
    if (!template) return notFound("Plantilla");

    const result = await sendEmail({
      to: parsed.data.email,
      subject: `[TEST] ${template.subject}`,
      html: template.bodyHtml,
    });

    if (result.success) {
      log.info({ to: parsed.data.email }, "Test email sent");
      return NextResponse.json({ success: true, provider: result.provider });
    }

    return NextResponse.json(
      { error: "No se pudo enviar el email de prueba", detail: result.error },
      { status: 502 }
    );
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al enviar email de prueba",
      code: "EMAIL_TEMPLATE_TEST_ERROR",
    });
  }
}
