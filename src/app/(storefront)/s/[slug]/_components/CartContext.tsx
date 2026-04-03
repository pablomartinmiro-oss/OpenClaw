"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";

export interface CartItem {
  id: string;
  type: "product" | "room" | "spa" | "restaurant";
  name: string;
  price: number;
  quantity: number;
  meta?: Record<string, string>;
}

interface CartState {
  items: CartItem[];
  discountCode: string | null;
  discountAmount: number;
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discountCode: string | null;
  discountAmount: number;
  total: number;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  applyDiscount: (code: string, amount: number) => void;
  removeDiscount: () => void;
}

const STORAGE_KEY = "openclaw-cart";

const CartContext = createContext<CartContextValue | null>(null);

function loadCart(): CartState {
  if (typeof window === "undefined") {
    return { items: [], discountCode: null, discountAmount: 0 };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as CartState;
  } catch {
    // ignore
  }
  return { items: [], discountCode: null, discountAmount: 0 };
}

function saveCart(state: CartState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CartState>(() => loadCart());

  useEffect(() => {
    saveCart(state);
  }, [state]);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
      setState((prev) => {
        const existing = prev.items.find((i) => i.id === item.id);
        if (existing) {
          return {
            ...prev,
            items: prev.items.map((i) =>
              i.id === item.id
                ? { ...i, quantity: i.quantity + (item.quantity ?? 1) }
                : i
            ),
          };
        }
        return {
          ...prev,
          items: [...prev.items, { ...item, quantity: item.quantity ?? 1 }],
        };
      });
    },
    []
  );

  const removeItem = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== id),
    }));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity < 1) return;
    setState((prev) => ({
      ...prev,
      items: prev.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
    }));
  }, []);

  const clearCart = useCallback(() => {
    setState({ items: [], discountCode: null, discountAmount: 0 });
  }, []);

  const applyDiscount = useCallback((code: string, amount: number) => {
    setState((prev) => ({ ...prev, discountCode: code, discountAmount: amount }));
  }, []);

  const removeDiscount = useCallback(() => {
    setState((prev) => ({ ...prev, discountCode: null, discountAmount: 0 }));
  }, []);

  const subtotal = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = Math.max(0, subtotal - state.discountAmount);
  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        itemCount,
        subtotal,
        discountCode: state.discountCode,
        discountAmount: state.discountAmount,
        total,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        applyDiscount,
        removeDiscount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
