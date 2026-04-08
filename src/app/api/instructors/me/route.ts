export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { apiError } from "@/lib/api-response";

/**
 * Returns the current user's instructor profile (if any).
 * Used by the UI to detect if the user is an instructor and auto-filter views.
 */
export async function GET() {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId, userId } = session;
  const modError = await requireModule(tenantId, "instructors");
  if (modError) return modError;

  try {
    const instructor = await prisma.instructor.findFirst({
      where: { tenantId, userId },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    });

    return NextResponse.json({ instructor, isInstructor: !!instructor });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener perfil de instructor",
      code: "INSTRUCTOR_ME_ERROR",
      logContext: { tenantId },
    });
  }
}
