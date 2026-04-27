export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import { apiError } from "@/lib/api-response";
import { validateBody, registerSchema } from "@/lib/validation";
import { ALL_MODULE_SLUGS } from "@/lib/modules/registry";
import { sendEmail } from "@/lib/email/resend";
import { buildWelcomeTenantHTML } from "@/lib/email/templates/welcome-tenant";

const DEFAULT_OWNER_PERMISSIONS = [
  "comms:view", "comms:send", "comms:assign",
  "pipelines:view", "pipelines:edit", "pipelines:create", "pipelines:delete",
  "analytics:view", "analytics:export",
  "contacts:view", "contacts:edit", "contacts:create", "contacts:delete",
  "reservations:view", "reservations:create", "reservations:edit",
  "settings:team", "settings:tenant",
];

const DEFAULT_REP_PERMISSIONS = [
  "comms:view", "comms:send",
  "pipelines:view", "pipelines:edit", "pipelines:create",
  "contacts:view",
  "reservations:view", "reservations:create",
];

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

export async function POST(request: NextRequest) {
  const rl = await rateLimit(getClientIP(request), "register");
  if (rl) return rl;

  const log = logger.child({ path: "/api/auth/register" });

  try {
    const body = await request.json();
    const validated = validateBody(body, registerSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const { name, email, password, companyName, slug: providedSlug, inviteToken } = validated.data;

    const passwordHash = await hash(password, 12);

    // INVITE FLOW: join existing tenant
    if (inviteToken) {
      const invitedUser = await prisma.user.findUnique({
        where: { inviteToken },
        include: { tenant: true },
      });

      if (!invitedUser || !invitedUser.inviteExpires || invitedUser.inviteExpires < new Date()) {
        return NextResponse.json({ error: "Invitación inválida o expirada" }, { status: 400 });
      }

      // Find default "Sales Rep" role for this tenant, or first role
      const repRole = await prisma.role.findFirst({
        where: { tenantId: invitedUser.tenantId, name: "Sales Rep" },
      });
      const fallbackRole = repRole || await prisma.role.findFirst({
        where: { tenantId: invitedUser.tenantId },
      });

      if (!fallbackRole) {
        return NextResponse.json({ error: "Error de configuración del equipo" }, { status: 500 });
      }

      // Update the invited user placeholder with real data
      await prisma.user.update({
        where: { id: invitedUser.id },
        data: {
          name,
          email: email.toLowerCase(),
          passwordHash,
          inviteToken: null,
          inviteExpires: null,
          roleId: fallbackRole.id,
          isActive: true,
        },
      });

      log.info({ email, tenantId: invitedUser.tenantId }, "User registered via invite");
      return NextResponse.json({ success: true, redirect: "/" });
    }

    // NEW TENANT FLOW
    if (!companyName) {
      return NextResponse.json({ error: "El nombre de la empresa es obligatorio" }, { status: 400 });
    }

    // Check if email already exists globally
    const existingUser = await prisma.user.findFirst({
      where: { email: email.toLowerCase() },
    });
    if (existingUser) {
      return NextResponse.json({ error: "Este email ya está registrado" }, { status: 409 });
    }

    // Use user-provided slug if valid, otherwise generate from company name
    let slug = providedSlug ? generateSlug(providedSlug) : generateSlug(companyName);
    if (!slug) {
      return NextResponse.json({ error: "Slug invalido" }, { status: 400 });
    }
    const existingTenant = await prisma.tenant.findUnique({ where: { slug } });
    if (existingTenant) {
      if (providedSlug) {
        return NextResponse.json({ error: "Ese identificador ya esta en uso" }, { status: 409 });
      }
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    // Create tenant + roles + user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: companyName,
          slug,
          onboardingComplete: false,
        },
      });

      const ownerRole = await tx.role.create({
        data: {
          name: "Owner / Manager",
          tenantId: tenant.id,
          isSystem: true,
          permissions: DEFAULT_OWNER_PERMISSIONS,
        },
      });

      // Create additional default roles
      await tx.role.createMany({
        data: [
          { name: "Sales Rep", tenantId: tenant.id, isSystem: true, permissions: DEFAULT_REP_PERMISSIONS },
          { name: "Marketing", tenantId: tenant.id, isSystem: true, permissions: ["analytics:view", "analytics:export", "contacts:view"] },
          { name: "VA / Admin", tenantId: tenant.id, isSystem: true, permissions: ["contacts:view", "contacts:edit", "contacts:create", "comms:view", "comms:send", "reservations:view", "reservations:create", "reservations:edit"] },
        ],
      });

      const user = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          name,
          passwordHash,
          tenantId: tenant.id,
          roleId: ownerRole.id,
        },
      });

      // Enable all modules by default for new tenants
      await tx.moduleConfig.createMany({
        data: ALL_MODULE_SLUGS.map((mod) => ({
          tenantId: tenant.id,
          module: mod,
          isEnabled: true,
        })),
      });

      return { tenant, user };
    });

    log.info({ email, tenantId: result.tenant.id }, "New tenant registered");

    // Send welcome email (non-blocking)
    const dashboardUrl = process.env.AUTH_URL ?? "https://skiinet.com";
    sendEmail({
      to: email.toLowerCase(),
      subject: "Bienvenido a Skiinet — Tu cuenta está lista",
      html: buildWelcomeTenantHTML({ ownerName: name, companyName, dashboardUrl }),
    }).catch((err) => log.error({ err, email }, "Welcome email failed"));

    return NextResponse.json({ success: true, redirect: "/onboarding" }, { status: 201 });
  } catch (error) {
    return apiError(error, { publicMessage: "Error al crear la cuenta", code: "REGISTER_FAILED" });
  }
}
