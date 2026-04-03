export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { apiError } from "@/lib/api-response";

export async function GET() {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;

  try {
    const users = await prisma.user.findMany({
      where: { tenantId, isActive: true },
      include: { role: true },
      orderBy: { createdAt: "asc" },
    });

    const members = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      roleName: u.role.name,
    }));

    return NextResponse.json({ members });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener el equipo",
      code: "ONBOARDING_TEAM_ERROR",
      logContext: { tenantId },
    });
  }
}
