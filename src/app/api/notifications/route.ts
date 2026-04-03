export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { apiError } from "@/lib/api-response";

export async function GET() {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { userId, tenantId } = session;

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;
    return NextResponse.json({ notifications, unreadCount });
  } catch (err) {
    return apiError(err, {
      publicMessage: "Error al cargar notificaciones",
      code: "NOTIFICATIONS_FETCH_FAILED",
      logContext: { tenantId },
    });
  }
}

/** Mark all as read */
export async function PATCH() {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { userId, tenantId } = session;

  try {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return apiError(err, {
      publicMessage: "Error al marcar notificaciones",
      code: "NOTIFICATIONS_MARK_FAILED",
      logContext: { tenantId },
    });
  }
}
