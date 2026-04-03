"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "../_components/CartContext";
import { CartSummary } from "../_components/CartSummary";
import { formatEUR } from "../_components/utils";

export default function CarritoPage() {
  const { slug } = useParams<{ slug: string }>();
  const {
    items,
    subtotal,
    updateQuantity,
    removeItem,
    applyDiscount,
    removeDiscount,
    discountCode,
  } = useCart();
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState("");
  const [applying, setApplying] = useState(false);

  const handleApplyCode = async () => {
    if (!codeInput.trim()) return;
    setCodeError("");
    setApplying(true);
    try {
      const res = await fetch("/api/storefront/discount-codes/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeInput.trim(), amount: subtotal }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        setCodeError(data.error ?? "Codigo no valido");
      } else {
        applyDiscount(codeInput.trim(), data.discountAmount);
        setCodeInput("");
      }
    } catch {
      setCodeError("Error al verificar el codigo");
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
        Carrito
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <EmptyCartIcon />
          <p className="text-lg text-gray-500 mt-4">Tu carrito esta vacio</p>
          <Link
            href={`/s/${slug}/experiencias`}
            className="mt-4 inline-block px-6 py-3 text-sm font-semibold text-white bg-[#E87B5A] rounded-lg hover:bg-[#D56E4F] transition-colors"
          >
            Explorar experiencias
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items list */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4"
              >
                {/* Item icon placeholder */}
                <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                  <ItemIcon type={item.type} />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">
                    {item.name}
                  </h3>
                  <p className="text-xs text-gray-500 capitalize">
                    {TYPE_LABELS[item.type]}
                  </p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {formatEUR(item.price)}
                  </p>
                </div>

                {/* Quantity controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      updateQuantity(item.id, item.quantity - 1)
                    }
                    disabled={item.quantity <= 1}
                    className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                  >
                    -
                  </button>
                  <span className="text-sm font-semibold text-gray-900 w-6 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateQuantity(item.id, item.quantity + 1)
                    }
                    className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm"
                  >
                    +
                  </button>
                </div>

                {/* Line total */}
                <div className="text-right min-w-[5rem]">
                  <p className="text-sm font-bold text-gray-900">
                    {formatEUR(item.price * item.quantity)}
                  </p>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  aria-label="Eliminar"
                >
                  <XIcon />
                </button>
              </div>
            ))}

            {/* Discount code */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Codigo de descuento
              </p>
              {discountCode ? (
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 bg-green-50 text-green-700 text-sm font-medium rounded-lg border border-green-200">
                    {discountCode}
                  </span>
                  <button
                    onClick={removeDiscount}
                    className="text-sm text-red-500 hover:underline"
                  >
                    Eliminar
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                    placeholder="Introduce tu codigo"
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E87B5A]/30 focus:border-[#E87B5A]"
                  />
                  <button
                    onClick={handleApplyCode}
                    disabled={applying || !codeInput.trim()}
                    className="px-4 py-2 text-sm font-semibold text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    {applying ? "..." : "Aplicar"}
                  </button>
                </div>
              )}
              {codeError && (
                <p className="text-xs text-red-500 mt-1.5">{codeError}</p>
              )}
            </div>
          </div>

          {/* Summary sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <CartSummary
                slug={slug}
                compact
                ctaLabel="Proceder al pago"
                ctaHref={`/s/${slug}/checkout`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const TYPE_LABELS: Record<string, string> = {
  product: "Experiencia",
  room: "Habitacion",
  spa: "Spa",
  restaurant: "Restaurante",
};

function EmptyCartIcon() {
  return (
    <svg className="mx-auto" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
    </svg>
  );
}

function ItemIcon({ type }: { type: string }) {
  const stroke = "#9ca3af";
  if (type === "room") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 4v16M22 4v16M2 12h20M2 20h20M6 12V8a2 2 0 012-2h8a2 2 0 012 2v4" />
      </svg>
    );
  }
  if (type === "spa") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22c-4.97 0-9-2.24-9-5v-.09c1.523.07 3.037-.092 4.5-.5C9.622 15.61 11.4 14 12 12c.6 2 2.378 3.61 4.5 4.41 1.463.408 2.977.57 4.5.5V17c0 2.76-4.03 5-9 5z" />
        <path d="M12 12V2" />
      </svg>
    );
  }
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}
