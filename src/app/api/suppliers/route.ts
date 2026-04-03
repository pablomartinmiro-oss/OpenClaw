export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, createSupplierSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "suppliers");
  if (modErr) return modErr;

  const log = logger.child({ tenantId, path: "/api/suppliers" });
  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status");

  try {
    const where: Record<string, unknown> = { tenantId };
    if (status) where.status = status;

    const suppliers = await prisma.supplier.findMany({
      where,
      include: {
        _count: { select: { settlements: true } },
      },
      orderBy: { fiscalName: "asc" },
    });

    log.info({ count: suppliers.length }, "Suppliers fetched");
    return NextResponse.json({ suppliers });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener proveedores",
      code: "SUPPLIERS_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "suppliers");
  if (modErr) return modErr;

  const log = logger.child({ tenantId, path: "/api/suppliers" });

  try {
    const body = await request.json();
    const validated = validateBody(body, createSupplierSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const data = validated.data;

    const supplier = await prisma.supplier.create({
      data: {
        tenantId,
        fiscalName: data.fiscalName,
        commercialName: data.commercialName ?? null,
        nif: data.nif,
        iban: data.iban ?? null,
        email: data.email ?? null,
        phone: data.phone ?? null,
        commissionPercentage: data.commissionPercentage,
        paymentMethod: data.paymentMethod,
        settlementFrequency: data.settlementFrequency,
        status: data.status,
      },
    });

    log.info({ supplierId: supplier.id }, "Supplier created");
    return NextResponse.json({ supplier }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al crear proveedor",
      code: "SUPPLIER_CREATE_ERROR",
      logContext: { tenantId },
    });
  }
}
