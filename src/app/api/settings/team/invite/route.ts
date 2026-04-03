export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody } from "@/lib/validation";
import { randomBytes } from "crypto";
import { sendEmail } from "@/lib/email/client";
import { z } from "zod";

// Simplified schema for this route — only email needed (name/role assigned later)
const inviteEmailSchema = z.object({
  email: z.string().email("Email inválido"),
});

function buildInviteEmailHTML(inviteUrl: string): string {
  return `
    <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #FAF9F7;">
      <h2 style="color: #2D2A26; font-size: 20px; margin-bottom: 8px;">Bienvenido al equipo de Skicenter</h2>
      <p style="color: #8A8580; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
        Te han invitado a unirte al Dashboard de gestión de Skicenter.<br>
        Haz clic en el botón para crear tu cuenta y empezar.
      </p>
      <a href="${inviteUrl}" style="display: inline-block; background: #E87B5A; color: #fff; font-weight: 600; font-size: 15px; padding: 12px 28px; border-radius: 10px; text-decoration: none;">
        Crear mi cuenta
      </a>
      <p style="color: #8A8580; font-size: 12px; margin-top: 24px;">
        El enlace expira en 7 días. Si no esperabas este email, ignóralo.
      </p>
    </div>
  `;
}

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const log = logger.child({ tenantId, path: "/api/settings/team/invite" });

  try {
    const body = await request.json();
    const validated = validateBody(body, inviteEmailSchema);
    if (!validated.ok) return NextResponse.json({ error: validated.error }, { status: 400 });
    const data = validated.data;

    const email = data.email;

    // Check if user already exists in this tenant
    const existing = await prisma.user.findUnique({
      where: { email_tenantId: { email: email.toLowerCase(), tenantId } },
    });
    if (existing) {
      return NextResponse.json({ error: "Este email ya pertenece a tu equipo" }, { status: 409 });
    }

    // Generate invite token
    const inviteToken = randomBytes(32).toString("hex");
    const inviteExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Find default role
    const defaultRole = await prisma.role.findFirst({
      where: { tenantId, name: "Sales Rep" },
    });
    if (!defaultRole) {
      return NextResponse.json({ error: "No se encontró el rol por defecto" }, { status: 500 });
    }

    // Create placeholder user with invite token
    await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        tenantId,
        roleId: defaultRole.id,
        inviteToken,
        inviteExpires,
        isActive: false,
      },
    });

    // Build invite URL
    const baseUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
    const inviteUrl = `${baseUrl}/register?invite=${inviteToken}`;

    // Send invite email (non-blocking — return success even if email fails)
    try {
      await sendEmail({
        tenantId,
        contactId: null,
        to: email.toLowerCase(),
        subject: "Has sido invitado al Dashboard de Skicenter",
        html: buildInviteEmailHTML(inviteUrl),
      });
      log.info({ email }, "Invite email sent");
    } catch (emailErr) {
      log.warn({ error: emailErr, email }, "Invite email failed — invite still created");
    }

    log.info({ email, inviteToken }, "Team invite created");
    return NextResponse.json({ inviteUrl }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al crear la invitación",
      code: "INVITE_ERROR",
      logContext: { tenantId },
    });
  }
}
