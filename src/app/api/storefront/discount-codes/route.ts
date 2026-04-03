export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, createDiscountCodeSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "storefront");
  if (modErr) return modErr;

  const log = logger.child({ tenantId, path: "/api/storefront/discount-codes" });
  const { searchParams } = request.nextUrl;
  const isActive = searchParams.get("isActive");

  try {
    const where: Record<string, unknown> = { tenantId };
    if (isActive !== null) where.isActive = isActive === "true";

    const codes = await prisma.discountCode.findMany({
      where,
      include: { _count: { select: { uses: true } } },
      orderBy: { createdAt: "desc" },
    });

    log.info({ count: codes.length }, "Discount codes fetched");
    return NextResponse.json({ codes });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener codigos de descuento",
      code: "DISCOUNT_CODES_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId, userId } = session;
  const modErr = await requireModule(tenantId, "storefront");
  if (modErr) return modErr;

  const log = logger.child({ tenantId, path: "/api/storefront/discount-codes" });

  try {
    const body = await request.json();
    const validated = validateBody(body, createDiscountCodeSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const data = validated.data;

    // Check for duplicate code
    const existing = await prisma.discountCode.findUnique({
      where: { tenantId_code: { tenantId, code: data.code } },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Ya existe un codigo con ese nombre" },
        { status: 409 }
      );
    }

    const code = await prisma.discountCode.create({
      data: {
        tenantId,
        code: data.code,
        type: data.type,
        value: data.value,
        expirationDate: data.expirationDate ?? null,
        maxUses: data.maxUses,
        isActive: data.isActive,
        createdById: userId,
      },
    });

    log.info({ codeId: code.id, code: code.code }, "Discount code created");
    return NextResponse.json({ code }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al crear codigo de descuento",
      code: "DISCOUNT_CODE_CREATE_ERROR",
      logContext: { tenantId },
    });
  }
}
