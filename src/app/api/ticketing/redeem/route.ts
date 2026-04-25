export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError, badRequest } from "@/lib/api-response";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import { validateBody, publicRedeemSchema } from "@/lib/validation";

function makeLocator(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 8; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
}

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  const rateError = await rateLimit(`redeem:${ip}`, "submit");
  if (rateError) return rateError;

  const log = logger.child({ path: "/api/ticketing/redeem", ip });

  try {
    const body = await request.json();
    const validated = validateBody(body, publicRedeemSchema);
    if (!validated.ok) return badRequest(validated.error);
    const data = validated.data;

    if (data.website && data.website.length > 0) {
      log.warn({ ip }, "Honeypot triggered on public redeem");
      return NextResponse.json({ ok: true, locator: makeLocator() });
    }

    let tenantId = data.tenantId ?? null;
    if (!tenantId && data.tenantSlug) {
      const tenant = await prisma.tenant.findFirst({
        where: { slug: data.tenantSlug },
        select: { id: true },
      });
      tenantId = tenant?.id ?? null;
    }
    if (!tenantId) return badRequest("Tenant no encontrado");

    const platform = await prisma.externalPlatform.findFirst({
      where: { id: data.platformId, tenantId, active: true },
      select: { id: true, name: true },
    });
    if (!platform) return badRequest("Plataforma no valida");

    if (data.productId) {
      const platformProduct = await prisma.platformProduct.findFirst({
        where: {
          tenantId,
          platformId: platform.id,
          productId: data.productId,
          status: "active",
        },
        select: { id: true },
      });
      if (!platformProduct) {
        return badRequest("El producto no esta vinculado a esta plataforma");
      }
    }

    const existing = await prisma.couponRedemption.findFirst({
      where: { tenantId, code: data.code },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Este codigo ya ha sido canjeado" },
        { status: 409 }
      );
    }

    const locator = makeLocator();

    const redemption = await prisma.couponRedemption.create({
      data: {
        tenantId,
        code: data.code,
        platformId: platform.id,
        productId: data.productId ?? null,
        customerName: data.customerName,
        email: data.email,
        phone: data.phone ?? null,
        skiLevel: data.skiLevel ?? null,
        bootSize: data.bootSize ?? null,
        height: data.height ?? null,
        numPeople: data.numPeople,
        preferredDate: data.preferredDate ?? null,
        notes: data.notes ? `${data.notes}\nLocalizador: ${locator}` : `Localizador: ${locator}`,
        status: "pendiente",
        financialStatus: "pending",
        redeemedAt: new Date(),
      },
      select: { id: true, code: true, createdAt: true },
    });

    log.info(
      { redemptionId: redemption.id, tenantId, platform: platform.name },
      "Public coupon redeemed"
    );

    return NextResponse.json({
      ok: true,
      locator,
      redemptionId: redemption.id,
      message: "Hemos recibido tu canje. Te contactaremos para confirmar tu reserva.",
    });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al procesar el canje",
      code: "TICKETING_PUBLIC_REDEEM_ERROR",
    });
  }
}
