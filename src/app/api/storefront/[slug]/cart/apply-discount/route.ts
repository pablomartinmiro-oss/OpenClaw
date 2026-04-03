export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { lookupTenant } from "@/lib/storefront/tenant-lookup";
import { getCart, saveCart } from "@/lib/storefront/cart";

type RouteCtx = { params: Promise<{ slug: string }> };

/**
 * POST — apply a discount code to a cart.
 * Body: { cartId, code }
 */
export async function POST(request: NextRequest, ctx: RouteCtx) {
  const { slug } = await ctx.params;
  const tenant = await lookupTenant(slug);
  if (!tenant) {
    return NextResponse.json(
      { error: "Tienda no encontrada" },
      { status: 404 }
    );
  }

  const log = logger.child({
    tenantId: tenant.id,
    path: `/api/storefront/${slug}/cart/apply-discount`,
  });

  try {
    const body = await request.json();
    const { cartId, code } = body as {
      cartId?: string;
      code?: string;
    };

    if (!cartId || !code) {
      return NextResponse.json(
        { error: "cartId y code son obligatorios" },
        { status: 400 }
      );
    }

    const cart = await getCart(cartId);
    if (!cart || cart.tenantId !== tenant.id) {
      return NextResponse.json(
        { error: "Carrito no encontrado" },
        { status: 404 }
      );
    }

    if (cart.items.length === 0) {
      return NextResponse.json(
        { error: "El carrito esta vacio" },
        { status: 400 }
      );
    }

    const normalizedCode = code.toUpperCase().trim();

    // Look up discount code for this tenant
    const discountCode = await prisma.discountCode.findUnique({
      where: {
        tenantId_code: { tenantId: tenant.id, code: normalizedCode },
      },
    });

    if (!discountCode) {
      return NextResponse.json(
        { valid: false, error: "Codigo de descuento no encontrado" },
        { status: 404 }
      );
    }

    if (!discountCode.isActive) {
      return NextResponse.json(
        { valid: false, error: "El codigo esta desactivado" },
        { status: 400 }
      );
    }

    if (
      discountCode.expirationDate &&
      new Date(discountCode.expirationDate) < new Date()
    ) {
      return NextResponse.json(
        { valid: false, error: "El codigo ha caducado" },
        { status: 400 }
      );
    }

    if (
      discountCode.maxUses > 0 &&
      discountCode.usedCount >= discountCode.maxUses
    ) {
      return NextResponse.json(
        {
          valid: false,
          error: "El codigo ha alcanzado el limite de usos",
        },
        { status: 400 }
      );
    }

    // Calculate discount on current subtotal
    const subtotal = cart.items.reduce((s, i) => s + i.totalPrice, 0);
    let discountAmount: number;
    if (discountCode.type === "percentage") {
      discountAmount =
        Math.round(subtotal * (discountCode.value / 100) * 100) / 100;
    } else {
      discountAmount = Math.min(discountCode.value, subtotal);
    }

    cart.discountCode = normalizedCode;
    cart.discountAmount = discountAmount;
    await saveCart(cart);

    log.info(
      { cartId, code: normalizedCode, discountAmount },
      "Discount applied to cart"
    );
    return NextResponse.json({ valid: true, cart });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al aplicar codigo de descuento",
      code: "STOREFRONT_DISCOUNT_APPLY_ERROR",
      logContext: { tenantId: tenant.id },
    });
  }
}
