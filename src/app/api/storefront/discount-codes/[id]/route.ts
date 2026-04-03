export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, updateDiscountCodeSchema } from "@/lib/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { id } = await params;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "storefront");
  if (modErr) return modErr;

  const log = logger.child({
    tenantId,
    path: `/api/storefront/discount-codes/${id}`,
  });

  try {
    const existing = await prisma.discountCode.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Codigo de descuento no encontrado" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = validateBody(body, updateDiscountCodeSchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }
    const data = validated.data;

    // Check duplicate code if changed
    if (data.code && data.code !== existing.code) {
      const dup = await prisma.discountCode.findUnique({
        where: { tenantId_code: { tenantId, code: data.code } },
      });
      if (dup) {
        return NextResponse.json(
          { error: "Ya existe un codigo con ese nombre" },
          { status: 409 }
        );
      }
    }

    const code = await prisma.discountCode.update({
      where: { id },
      data: {
        ...(data.code !== undefined && { code: data.code }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.value !== undefined && { value: data.value }),
        ...(data.expirationDate !== undefined && {
          expirationDate: data.expirationDate ?? null,
        }),
        ...(data.maxUses !== undefined && { maxUses: data.maxUses }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    log.info({ codeId: id }, "Discount code updated");
    return NextResponse.json({ code });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al actualizar codigo de descuento",
      code: "DISCOUNT_CODE_UPDATE_ERROR",
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
  const modErr = await requireModule(tenantId, "storefront");
  if (modErr) return modErr;

  const log = logger.child({
    tenantId,
    path: `/api/storefront/discount-codes/${id}`,
  });

  try {
    const existing = await prisma.discountCode.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Codigo de descuento no encontrado" },
        { status: 404 }
      );
    }

    await prisma.discountCode.delete({ where: { id } });

    log.info({ codeId: id }, "Discount code deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al eliminar codigo de descuento",
      code: "DISCOUNT_CODE_DELETE_ERROR",
      logContext: { tenantId },
    });
  }
}
