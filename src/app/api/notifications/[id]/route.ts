export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { apiError } from "@/lib/api-response";

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { id } = await params;
  const { userId, tenantId } = session;

  try {
    await prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al actualizar notificación",
      code: "NOTIFICATION_UPDATE_FAILED",
      logContext: { tenantId },
    });
  }
}
