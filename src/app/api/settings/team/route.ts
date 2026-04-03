export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";

export async function GET() {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const log = logger.child({ tenantId, path: "/api/settings/team" });

  try {
    const [users, roles] = await Promise.all([
      prisma.user.findMany({
        where: { tenantId },
        select: {
          id: true,
          email: true,
          name: true,
          roleId: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          role: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.role.findMany({
        where: { tenantId },
        select: {
          id: true,
          name: true,
          isSystem: true,
          permissions: true,
        },
        orderBy: { name: "asc" },
      }),
    ]);

    log.info({ userCount: users.length }, "Team data fetched");
    return NextResponse.json({ users, roles });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to fetch team",
      code: "TEAM_ERROR",
      logContext: { tenantId },
    });
  }
}
