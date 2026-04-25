export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { apiError } from "@/lib/api-response";
import {
  validateBody,
  updateRestaurantReservationSchema,
} from "@/lib/validation";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, ctx: Ctx) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "restaurant");
  if (moduleError) return moduleError;

  const { id } = await ctx.params;

  try {
    const existing = await prisma.restaurantReservation.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await request.json();
    const validated = validateBody(body, updateRestaurantReservationSchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }
    const data = validated.data;

    const reservation = await prisma.restaurantReservation.update({
      where: { id },
      data: {
        ...(data.date !== undefined && { date: data.date }),
        ...(data.time !== undefined && { time: data.time }),
        ...(data.guestCount !== undefined && { guestCount: data.guestCount }),
        ...(data.guestName !== undefined && { guestName: data.guestName }),
        ...(data.guestPhone !== undefined && { guestPhone: data.guestPhone }),
        ...(data.guestEmail !== undefined && { guestEmail: data.guestEmail }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.status !== undefined && { status: data.status }),
      },
    });

    return NextResponse.json({ reservation });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to update reservation",
      code: "RESTAURANT_RESERVATION_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function DELETE(_request: NextRequest, ctx: Ctx) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "restaurant");
  if (moduleError) return moduleError;

  const { id } = await ctx.params;

  try {
    const existing = await prisma.restaurantReservation.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.restaurantReservation.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to delete reservation",
      code: "RESTAURANT_RESERVATION_ERROR",
      logContext: { tenantId },
    });
  }
}
