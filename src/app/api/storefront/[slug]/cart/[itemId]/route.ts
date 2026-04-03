export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { lookupTenant } from "@/lib/storefront/tenant-lookup";
import { validateBody, updateCartItemSchema } from "@/lib/validation";
import { getCart, saveCart } from "@/lib/storefront/cart";

type RouteCtx = {
  params: Promise<{ slug: string; itemId: string }>;
};

/**
 * PATCH — update item quantity.
 * Body: { quantity }
 * Query: ?cartId=xxx
 */
export async function PATCH(request: NextRequest, ctx: RouteCtx) {
  const { slug, itemId } = await ctx.params;
  const tenant = await lookupTenant(slug);
  if (!tenant) {
    return NextResponse.json(
      { error: "Tienda no encontrada" },
      { status: 404 }
    );
  }

  const cartId = request.nextUrl.searchParams.get("cartId");
  if (!cartId) {
    return NextResponse.json(
      { error: "cartId es obligatorio" },
      { status: 400 }
    );
  }

  const log = logger.child({
    tenantId: tenant.id,
    path: `/api/storefront/${slug}/cart/${itemId}`,
  });

  try {
    const body = await request.json();
    const validated = validateBody(body, updateCartItemSchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
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

    const item = cart.items.find((i) => i.id === itemId);
    if (!item) {
      return NextResponse.json(
        { error: "Articulo no encontrado en el carrito" },
        { status: 404 }
      );
    }

    item.quantity = validated.data.quantity;
    item.totalPrice =
      Math.round(item.unitPrice * item.quantity * 100) / 100;
    await saveCart(cart);

    log.info({ cartId, itemId, quantity: item.quantity }, "Cart item updated");
    return NextResponse.json({ cart });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al actualizar articulo",
      code: "STOREFRONT_CART_UPDATE_ERROR",
      logContext: { tenantId: tenant.id },
    });
  }
}

/**
 * DELETE — remove item from cart.
 * Query: ?cartId=xxx
 */
export async function DELETE(request: NextRequest, ctx: RouteCtx) {
  const { slug, itemId } = await ctx.params;
  const tenant = await lookupTenant(slug);
  if (!tenant) {
    return NextResponse.json(
      { error: "Tienda no encontrada" },
      { status: 404 }
    );
  }

  const cartId = request.nextUrl.searchParams.get("cartId");
  if (!cartId) {
    return NextResponse.json(
      { error: "cartId es obligatorio" },
      { status: 400 }
    );
  }

  const log = logger.child({
    tenantId: tenant.id,
    path: `/api/storefront/${slug}/cart/${itemId}`,
  });

  try {
    const cart = await getCart(cartId);
    if (!cart || cart.tenantId !== tenant.id) {
      return NextResponse.json(
        { error: "Carrito no encontrado" },
        { status: 404 }
      );
    }

    const idx = cart.items.findIndex((i) => i.id === itemId);
    if (idx === -1) {
      return NextResponse.json(
        { error: "Articulo no encontrado en el carrito" },
        { status: 404 }
      );
    }

    cart.items.splice(idx, 1);
    await saveCart(cart);

    log.info({ cartId, itemId }, "Cart item removed");
    return NextResponse.json({ cart });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al eliminar articulo",
      code: "STOREFRONT_CART_REMOVE_ERROR",
      logContext: { tenantId: tenant.id },
    });
  }
}
