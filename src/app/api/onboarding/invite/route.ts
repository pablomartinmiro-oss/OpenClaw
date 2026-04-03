export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody } from "@/lib/validation";
import { hash } from "bcryptjs";
import { DEFAULT_ROLES } from "@/lib/auth/permissions";
import { z } from "zod";

const onboardingInviteSchema = z.object({
  invites: z.array(z.object({
    email: z.string().email(),
    name: z.string().max(200).default(""),
  })).min(1, "No invites provided"),
});

export async function POST(req: Request) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const log = logger.child({ tenantId, action: "onboarding.invite" });

  try {
    const body = await req.json();
    const validated = validateBody(body, onboardingInviteSchema);
    if (!validated.ok) return NextResponse.json({ error: validated.error }, { status: 400 });
    const data = validated.data;

    const invites = data.invites;

    // Get the default "Sales Rep" role for this tenant
    let salesRepRole = await prisma.role.findFirst({
      where: { tenantId, name: "Sales Rep" },
    });

    // If no roles exist yet (shouldn't happen with seed), create them
    if (!salesRepRole) {
      salesRepRole = await prisma.role.create({
        data: {
          name: "Sales Rep",
          tenantId,
          isSystem: true,
          permissions: DEFAULT_ROLES["Sales Rep"],
        },
      });
    }

    const created: string[] = [];
    // Generate a temporary password for invited users
    const tempPasswordHash = await hash("changeme123", 12);

    for (const invite of invites) {
      const email = invite.email.trim().toLowerCase();
      if (!email) continue;

      // Skip if user already exists for this tenant
      const existing = await prisma.user.findFirst({
        where: { email, tenantId },
      });
      if (existing) {
        log.info({ email }, "User already exists, skipping invite");
        continue;
      }

      await prisma.user.create({
        data: {
          email,
          name: invite.name?.trim() || null,
          tenantId,
          roleId: salesRepRole.id,
          passwordHash: tempPasswordHash,
          isActive: true,
        },
      });
      created.push(email);
    }

    log.info({ count: created.length }, "Team members invited");

    return NextResponse.json({ created, count: created.length });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al invitar miembros del equipo",
      code: "ONBOARDING_INVITE_ERROR",
      logContext: { tenantId },
    });
  }
}
