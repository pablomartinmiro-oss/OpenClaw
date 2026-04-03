export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody } from "@/lib/validation";
import { z } from "zod";

const roleAssignmentsSchema = z.object({
  assignments: z.record(z.string().min(1), z.string().min(1)),
});

export async function POST(req: Request) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const log = logger.child({ tenantId, action: "onboarding.roles" });

  try {
    const body = await req.json();
    const validated = validateBody(body, roleAssignmentsSchema);
    if (!validated.ok) return NextResponse.json({ error: validated.error }, { status: 400 });
    const data = validated.data;

    const assignments = data.assignments;

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
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al asignar roles",
      code: "ONBOARDING_ROLES_ERROR",
      logContext: { tenantId },
    });
  }
}
