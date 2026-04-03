export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, updateSupplierSchema } from "@/lib/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { id } = await params;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "suppliers");
  if (modErr) return modErr;

  const log = logger.child({ tenantId, path: `/api/suppliers/${id}` });

  try {
    const supplier = await prisma.supplier.findFirst({
      where: { id, tenantId },
      include: {
        _count: { select: { settlements: true, expenses: true } },
      },
    });

    if (!supplier) {
      return NextResponse.json(
        { error: "Proveedor no encontrado" },
        { status: 404 }
      );
    }

    log.info({ supplierId: id }, "Supplier fetched");
    return NextResponse.json({ supplier });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener proveedor",
      code: "SUPPLIER_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { id } = await params;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "suppliers");
  if (modErr) return modErr;

  const log = logger.child({ tenantId, path: `/api/suppliers/${id}` });

  try {
    const existing = await prisma.supplier.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Proveedor no encontrado" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = validateBody(body, updateSupplierSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const data = validated.data;

    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        ...(data.fiscalName !== undefined && {
          fiscalName: data.fiscalName,
        }),
        ...(data.commercialName !== undefined && {
          commercialName: data.commercialName ?? null,
        }),
        ...(data.nif !== undefined && { nif: data.nif }),
        ...(data.iban !== undefined && { iban: data.iban ?? null }),
        ...(data.email !== undefined && { email: data.email ?? null }),
        ...(data.phone !== undefined && { phone: data.phone ?? null }),
        ...(data.commissionPercentage !== undefined && {
          commissionPercentage: data.commissionPercentage,
        }),
        ...(data.paymentMethod !== undefined && {
          paymentMethod: data.paymentMethod,
        }),
        ...(data.settlementFrequency !== undefined && {
          settlementFrequency: data.settlementFrequency,
        }),
        ...(data.status !== undefined && { status: data.status }),
      },
    });

    log.info({ supplierId: id }, "Supplier updated");
    return NextResponse.json({ supplier });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al actualizar proveedor",
      code: "SUPPLIER_UPDATE_ERROR",
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
  const modErr = await requireModule(tenantId, "suppliers");
  if (modErr) return modErr;

  const log = logger.child({ tenantId, path: `/api/suppliers/${id}` });

  try {
    const existing = await prisma.supplier.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Proveedor no encontrado" },
        { status: 404 }
      );
    }

    await prisma.supplier.delete({ where: { id } });

    log.info({ supplierId: id }, "Supplier deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al eliminar proveedor",
      code: "SUPPLIER_DELETE_ERROR",
      logContext: { tenantId },
    });
  }
}
