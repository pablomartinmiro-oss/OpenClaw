export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { hash } from "bcryptjs";
import { DEFAULT_ROLES } from "@/lib/auth/permissions";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tenantId } = session.user;
  const body = await req.json();
  const invites: Array<{ email: string; name: string }> = body.invites;

  if (!Array.isArray(invites) || invites.length === 0) {
    return NextResponse.json(
      { error: "No invites provided" },
      { status: 400 }
    );
  }

  const log = logger.child({ tenantId, action: "onboarding.invite" });

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
        name: invite.name.trim() || null,
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
}
