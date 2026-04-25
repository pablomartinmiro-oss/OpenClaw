export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, createLodgeStaySchema } from "@/lib/validation";
import { Prisma } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "hotel");
  if (moduleError) return moduleError;

  const log = logger.child({ tenantId, path: "/api/hotel/stays" });
  const { searchParams } = request.nextUrl;
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const status = searchParams.get("status");
  const roomTypeId = searchParams.get("roomTypeId");

  try {
    const where: Prisma.LodgeStayWhereInput = { tenantId };
    if (status) where.status = status;
    if (roomTypeId) where.roomTypeId = roomTypeId;
    if (from || to) {
      where.checkIn = {};
      if (from) where.checkIn.gte = new Date(from);
      if (to) where.checkIn.lte = new Date(to);
    }

    const stays = await prisma.lodgeStay.findMany({
      where,
      include: { roomType: { select: { id: true, title: true } } },
      orderBy: { checkIn: "asc" },
    });

    log.info({ count: stays.length }, "Stays fetched");
    return NextResponse.json({ stays });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to fetch stays",
      code: "STAYS_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "hotel");
  if (moduleError) return moduleError;

  const log = logger.child({ tenantId, path: "/api/hotel/stays" });

  try {
    const body = await request.json();
    const validated = validateBody(body, createLodgeStaySchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }
    const data = validated.data;

    if (data.checkOut <= data.checkIn) {
      return NextResponse.json(
        { error: "checkOut debe ser posterior a checkIn" },
        { status: 400 }
      );
    }

    if (data.roomTypeId) {
      const rt = await prisma.roomType.findFirst({
        where: { id: data.roomTypeId, tenantId },
      });
      if (!rt) {
        return NextResponse.json(
          { error: "Tipo de alojamiento no encontrado" },
          { status: 404 }
        );
      }
    }

    const stay = await prisma.lodgeStay.create({
      data: {
        tenantId,
        roomTypeId: data.roomTypeId ?? null,
        guestName: data.guestName,
        guestEmail: data.guestEmail ?? null,
        guestPhone: data.guestPhone ?? null,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        adults: data.adults,
        children: data.children,
        totalAmount: data.totalAmount,
        status: data.status,
        notes: data.notes ?? null,
      },
    });

    log.info({ stayId: stay.id }, "Stay created");
    return NextResponse.json({ stay }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to create stay",
      code: "STAYS_ERROR",
      logContext: { tenantId },
    });
  }
}
