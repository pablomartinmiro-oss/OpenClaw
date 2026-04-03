import { redis } from "@/lib/cache/redis";
import { randomUUID } from "crypto";

const CART_TTL = 86400; // 24 hours

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  variant?: string;
  date?: string;
  extras?: Record<string, unknown>;
}

export interface Cart {
  id: string;
  tenantId: string;
  items: CartItem[];
  discountCode?: string;
  discountAmount?: number;
  subtotal: number;
  total: number;
  updatedAt: string;
}

export async function getCart(cartId: string): Promise<Cart | null> {
  const client = redis;
  if (!client) return null;
  const data = await client.get(`cart:${cartId}`);
  return data ? (JSON.parse(data) as Cart) : null;
}

export async function saveCart(cart: Cart): Promise<void> {
  const client = redis;
  if (!client) return;
  cart.updatedAt = new Date().toISOString();
  cart.subtotal = cart.items.reduce((s, i) => s + i.totalPrice, 0);
  cart.total = cart.subtotal - (cart.discountAmount ?? 0);
  await client.set(
    `cart:${cart.id}`,
    JSON.stringify(cart),
    "EX",
    CART_TTL
  );
}

export async function deleteCart(cartId: string): Promise<void> {
  const client = redis;
  if (!client) return;
  await client.del(`cart:${cartId}`);
}

export function createCart(tenantId: string): Cart {
  return {
    id: randomUUID(),
    tenantId,
    items: [],
    subtotal: 0,
    total: 0,
    updatedAt: new Date().toISOString(),
  };
}
