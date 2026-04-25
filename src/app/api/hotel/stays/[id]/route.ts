export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, updateLodgeStaySchema } from "@/lib/validation";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, ctx: Ctx) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "hotel");
  if (moduleError) return moduleError;

  const { id } = await ctx.params;
  const log = logger.child({ tenantId, path: "/api/hotel/stays/[id]" });

  try {
    const existing = await prisma.lodgeStay.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await request.json();
    const validated = validateBody(body, updateLodgeStaySchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }
    const data = validated.data;

    const stay = await prisma.lodgeStay.update({
      where: { id },
      data: {
        ...(data.guestName !== undefined && { guestName: data.guestName }),
        ...(data.guestEmail !== undefined && { guestEmail: data.guestEmail }),
        ...(data.guestPhone !== undefined && { guestPhone: data.guestPhone }),
        ...(data.roomTypeId !== undefined && { roomTypeId: data.roomTypeId }),
        ...(data.checkIn !== undefined && { checkIn: data.checkIn }),
        ...(data.checkOut !== undefined && { checkOut: data.checkOut }),
        ...(data.adults !== undefined && { adults: data.adults }),
        ...(data.children !== undefined && { children: data.children }),
        ...(data.totalAmount !== undefined && { totalAmount: data.totalAmount }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    });

    log.info({ stayId: stay.id }, "Stay updated");
    return NextResponse.json({ stay });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to update stay",
      code: "STAYS_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function DELETE(_request: NextRequest, ctx: Ctx) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "hotel");
  if (moduleError) return moduleError;

  const { id } = await ctx.params;
  const log = logger.child({ tenantId, path: "/api/hotel/stays/[id]" });

  try {
    const existing = await prisma.lodgeStay.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.lodgeStay.delete({ where: { id } });
    log.info({ stayId: id }, "Stay deleted");
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to delete stay",
      code: "STAYS_ERROR",
      logContext: { tenantId },
    });
  }
}
