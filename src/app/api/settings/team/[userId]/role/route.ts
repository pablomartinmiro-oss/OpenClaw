export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody } from "@/lib/validation";
import { z } from "zod";

const updateRoleSchema = z.object({
  roleId: z.string().min(1, "roleId is required"),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const { userId } = await params;
  const log = logger.child({ tenantId, userId, path: `/api/settings/team/${userId}/role` });

  try {
    const body = await req.json();
    const validated = validateBody(body, updateRoleSchema);
    if (!validated.ok) return NextResponse.json({ error: validated.error }, { status: 400 });
    const data = validated.data;

    // Verify user belongs to same tenant
    const targetUser = await prisma.user.findFirst({
      where: { id: userId, tenantId },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Verify role belongs to same tenant
    const role = await prisma.role.findFirst({
      where: { id: data.roleId, tenantId },
    });

    if (!role) {
      return NextResponse.json(
        { error: "Role not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { roleId: data.roleId },
      select: {
        id: true,
        email: true,
        name: true,
        roleId: true,
        role: { select: { id: true, name: true } },
      },
    });

    log.info({ newRoleId: data.roleId, roleName: role.name }, "User role updated");
    return NextResponse.json({ user: updated });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to update role",
      code: "TEAM_ERROR",
      logContext: { tenantId, userId },
    });
  }
}
