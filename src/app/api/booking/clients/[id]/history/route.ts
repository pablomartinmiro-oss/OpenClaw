export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { id } = await params;
  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "booking");
  if (moduleError) return moduleError;

  const log = logger.child({
    tenantId,
    path: `/api/booking/clients/${id}/history`,
  });

  try {
    const client = await prisma.client.findFirst({
      where: { id, tenantId },
    });
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const emailFilter = client.email
      ? [{ clientEmail: { equals: client.email, mode: "insensitive" as const } }]
      : [];
    const phoneFilter = client.phone
      ? [{ clientPhone: client.phone }]
      : [];
    const matchOr = [...emailFilter, ...phoneFilter];

    const [reservations, quotes] = await Promise.all([
      matchOr.length
        ? prisma.reservation.findMany({
            where: { tenantId, OR: matchOr },
            orderBy: { activityDate: "desc" },
            take: 100,
            select: {
              id: true,
              clientName: true,
              station: true,
              activityDate: true,
              status: true,
              totalPrice: true,
              source: true,
              createdAt: true,
            },
          })
        : Promise.resolve([]),
      matchOr.length
        ? prisma.quote.findMany({
            where: {
              tenantId,
              OR: client.email
                ? [{ clientEmail: { equals: client.email, mode: "insensitive" } }]
                : phoneFilter.length
                  ? [{ clientPhone: client.phone! }]
                  : [],
            },
            orderBy: { createdAt: "desc" },
            take: 100,
            select: {
              id: true,
              clientName: true,
              destination: true,
              checkIn: true,
              checkOut: true,
              status: true,
              totalAmount: true,
              createdAt: true,
              paidAt: true,
            },
          })
        : Promise.resolve([]),
    ]);

    log.info(
      { clientId: id, reservations: reservations.length, quotes: quotes.length },
      "Client history fetched"
    );
    return NextResponse.json({ reservations, quotes });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to fetch client history",
      code: "BOOKING_CLIENTS_HISTORY_ERROR",
      logContext: { tenantId },
    });
  }
}
