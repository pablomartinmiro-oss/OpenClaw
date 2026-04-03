export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, updateCashRegisterSchema } from "@/lib/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { id } = await params;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "tpv");
  if (modErr) return modErr;

  const log = logger.child({
    tenantId,
    path: `/api/tpv/registers/${id}`,
  });

  try {
    const existing = await prisma.cashRegister.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Caja registradora no encontrada" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = validateBody(body, updateCashRegisterSchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }
    const data = validated.data;

    const register = await prisma.cashRegister.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.location !== undefined && {
          location: data.location ?? null,
        }),
        ...(data.active !== undefined && { active: data.active }),
      },
    });

    log.info({ registerId: id }, "Cash register updated");
    return NextResponse.json({ register });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al actualizar caja registradora",
      code: "REGISTER_UPDATE_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { id } = await params;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "tpv");
  if (modErr) return modErr;

  const log = logger.child({
    tenantId,
    path: `/api/tpv/registers/${id}`,
  });

  try {
    const existing = await prisma.cashRegister.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Caja registradora no encontrada" },
        { status: 404 }
      );
    }

    await prisma.cashRegister.delete({ where: { id } });

    log.info({ registerId: id }, "Cash register deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al eliminar caja registradora",
      code: "REGISTER_DELETE_ERROR",
      logContext: { tenantId },
    });
  }
}
