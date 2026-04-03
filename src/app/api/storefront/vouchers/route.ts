export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import {
  validateBody,
  createCompensationVoucherSchema,
} from "@/lib/validation";

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "storefront");
  if (modErr) return modErr;

  const log = logger.child({
    tenantId,
    path: "/api/storefront/vouchers",
  });
  const { searchParams } = request.nextUrl;
  const isUsed = searchParams.get("isUsed");

  try {
    const where: Record<string, unknown> = { tenantId };
    if (isUsed !== null) where.isUsed = isUsed === "true";

    const vouchers = await prisma.compensationVoucher.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    log.info({ count: vouchers.length }, "Compensation vouchers fetched");
    return NextResponse.json({ vouchers });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener bonos de compensacion",
      code: "VOUCHERS_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "storefront");
  if (modErr) return modErr;

  const log = logger.child({
    tenantId,
    path: "/api/storefront/vouchers",
  });

  try {
    const body = await request.json();
    const validated = validateBody(body, createCompensationVoucherSchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }
    const data = validated.data;

    // Auto-generate BON-YYYY-XXXX code
    const year = new Date().getFullYear();
    const last = await prisma.compensationVoucher.findFirst({
      where: { tenantId, code: { startsWith: `BON-${year}-` } },
      orderBy: { code: "desc" },
      select: { code: true },
    });
    const seq = last
      ? parseInt(last.code.split("-")[2]) + 1
      : 1;
    const code = `BON-${year}-${String(seq).padStart(4, "0")}`;

    const voucher = await prisma.compensationVoucher.create({
      data: {
        tenantId,
        code,
        cancellationId: data.cancellationId ?? null,
        type: data.type,
        value: data.value,
        expirationDate: data.expirationDate ?? null,
        linkedDiscountCodeId: data.linkedDiscountCodeId ?? null,
      },
    });

    log.info(
      { voucherId: voucher.id, code: voucher.code },
      "Compensation voucher created"
    );
    return NextResponse.json({ voucher }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al crear bono de compensacion",
      code: "VOUCHER_CREATE_ERROR",
      logContext: { tenantId },
    });
  }
}
