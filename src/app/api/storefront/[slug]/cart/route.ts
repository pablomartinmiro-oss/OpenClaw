export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { lookupTenant } from "@/lib/storefront/tenant-lookup";
import { validateBody, addToCartSchema } from "@/lib/validation";
import {
  getCart,
  saveCart,
  deleteCart,
  createCart,
  type CartItem,
} from "@/lib/storefront/cart";

type RouteCtx = { params: Promise<{ slug: string }> };

/**
 * GET — retrieve or create a cart.
 * Query: ?cartId=xxx
 */
export async function GET(request: NextRequest, ctx: RouteCtx) {
  const { slug } = await ctx.params;
  const tenant = await lookupTenant(slug);
  if (!tenant) {
    return NextResponse.json(
      { error: "Tienda no encontrada" },
      { status: 404 }
    );
  }

  const cartId = request.nextUrl.searchParams.get("cartId");
  const log = logger.child({
    tenantId: tenant.id,
    path: `/api/storefront/${slug}/cart`,
  });

  try {
    if (cartId) {
      const cart = await getCart(cartId);
      if (cart && cart.tenantId === tenant.id) {
        return NextResponse.json({ cart });
      }
    }

    // No cart found or wrong tenant — create new
    const cart = createCart(tenant.id);
    await saveCart(cart);
    log.info({ cartId: cart.id }, "New cart created");
    return NextResponse.json({ cart }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener carrito",
      code: "STOREFRONT_CART_GET_ERROR",
      logContext: { tenantId: tenant.id },
    });
  }
}

/**
 * POST — add item to cart.
 * Body: { cartId?, productId, productName, quantity, unitPrice, variant?, date? }
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
    path: `/api/storefront/${slug}/cart`,
  });

  try {
    const body = await request.json();
    const validated = validateBody(body, addToCartSchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }
    const data = validated.data;

    // Get or create cart
    let cart = data.cartId
      ? await getCart(data.cartId)
      : null;
    if (!cart || cart.tenantId !== tenant.id) {
      cart = createCart(tenant.id);
    }

    const qty = data.quantity ?? 1;
    const item: CartItem = {
      id: randomUUID(),
      productId: data.productId,
      productName: data.productName,
      quantity: qty,
      unitPrice: data.unitPrice,
      totalPrice: Math.round(data.unitPrice * qty * 100) / 100,
      variant: data.variant,
      date: data.date,
    };

    cart.items.push(item);
    await saveCart(cart);

    log.info(
      { cartId: cart.id, itemId: item.id },
      "Item added to cart"
    );
    return NextResponse.json({ cart }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al agregar al carrito",
      code: "STOREFRONT_CART_ADD_ERROR",
      logContext: { tenantId: tenant.id },
    });
  }
}

/**
 * DELETE — clear entire cart.
 * Query: ?cartId=xxx
 */
export async function DELETE(request: NextRequest, ctx: RouteCtx) {
  const { slug } = await ctx.params;
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
    path: `/api/storefront/${slug}/cart`,
  });

  try {
    await deleteCart(cartId);
    log.info({ cartId }, "Cart cleared");
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al vaciar carrito",
      code: "STOREFRONT_CART_CLEAR_ERROR",
      logContext: { tenantId: tenant.id },
    });
  }
}
