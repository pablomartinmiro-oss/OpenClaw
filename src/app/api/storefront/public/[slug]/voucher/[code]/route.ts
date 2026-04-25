export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { rateLimit, getClientIP } from "@/lib/rate-limit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; code: string }> }
) {
  const rl = await rateLimit(getClientIP(request), "public");
  if (rl) return rl;

  const { slug, code } = await params;
  const log = logger.child({
    slug,
    path: "/api/storefront/public/voucher",
  });

  if (!code || code.length > 50) {
    return NextResponse.json({ error: "Codigo invalido" }, { status: 400 });
  }

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const voucher = await prisma.compensationVoucher.findFirst({
      where: { tenantId: tenant.id, code: code.toUpperCase() },
      select: {
        code: true,
        type: true,
        value: true,
        expirationDate: true,
        isUsed: true,
        createdAt: true,
      },
    });

    if (!voucher) {
      return NextResponse.json(
        {
          found: false,
          message: "No encontramos ningun bono con ese codigo",
        },
        { status: 404 }
      );
    }

    const now = new Date();
    const expired =
      voucher.expirationDate !== null && voucher.expirationDate < now;

    let state: "valid" | "used" | "expired";
    if (voucher.isUsed) {
      state = "used";
    } else if (expired) {
      state = "expired";
    } else {
      state = "valid";
    }

    log.info({ code: voucher.code, state }, "Public voucher checked");

    return NextResponse.json({
      found: true,
      state,
      voucher: {
        code: voucher.code,
        type: voucher.type,
        value: voucher.value,
        expirationDate: voucher.expirationDate,
        createdAt: voucher.createdAt,
      },
    });
  } catch (error) {
    log.error({ err: error }, "Failed to verify public voucher");
    return NextResponse.json(
      { error: "Error al verificar el bono" },
      { status: 500 }
    );
  }
}
