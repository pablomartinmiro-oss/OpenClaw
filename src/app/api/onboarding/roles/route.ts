export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tenantId } = session.user;
  const body = await req.json();
  const assignments: Record<string, string> = body.assignments;

  if (!assignments || typeof assignments !== "object") {
    return NextResponse.json(
      { error: "Invalid assignments" },
      { status: 400 }
    );
  }

  const log = logger.child({ tenantId, action: "onboarding.roles" });

  for (const [userId, roleName] of Object.entries(assignments)) {
    // Find the role by name for this tenant
    const role = await prisma.role.findFirst({
      where: { tenantId, name: roleName },
    });

    if (!role) {
      log.warn({ roleName }, "Role not found, skipping assignment");
      continue;
    }

    // Verify user belongs to this tenant
    const user = await prisma.user.findFirst({
      where: { id: userId, tenantId },
    });

    if (!user) {
      log.warn({ userId }, "User not found in tenant, skipping");
      continue;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { roleId: role.id },
    });

    log.info({ userId, roleName }, "Role assigned");
  }

  return NextResponse.json({ ok: true });
}
