"use client";

import Link from "next/link";
import { useCart } from "./CartContext";
import { formatEUR } from "./utils";

interface CartSummaryProps {
  slug: string;
  ctaLabel?: string;
  ctaHref?: string;
  onCtaClick?: () => void;
  compact?: boolean;
}

export function CartSummary({
  slug,
  ctaLabel = "Proceder al pago",
  ctaHref,
  onCtaClick,
  compact = false,
}: CartSummaryProps) {
  const { items, itemCount, subtotal, discountCode, discountAmount, total } =
    useCart();

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
        <p className="text-sm text-gray-500">Tu carrito esta vacio</p>
        <Link
          href={`/s/${slug}/experiencias`}
          className="mt-3 inline-block text-sm font-medium text-[#E87B5A] hover:underline"
        >
          Explorar experiencias
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-4">
        Resumen ({itemCount} {itemCount === 1 ? "articulo" : "articulos"})
      </h3>

      {!compact && (
        <ul className="space-y-2 mb-4 max-h-60 overflow-y-auto">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-700 truncate mr-2">
                {item.name} x{item.quantity}
              </span>
              <span className="text-gray-900 font-medium whitespace-nowrap">
                {formatEUR(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="border-t border-gray-100 pt-3 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Subtotal</span>
          <span className="text-gray-900 font-medium">{formatEUR(subtotal)}</span>
        </div>
        {discountCode && (
          <div className="flex justify-between text-sm">
            <span className="text-green-600">
              Descuento ({discountCode})
            </span>
            <span className="text-green-600 font-medium">
              -{formatEUR(discountAmount)}
            </span>
          </div>
        )}
        <div className="flex justify-between text-base font-bold pt-1">
          <span className="text-gray-900">Total</span>
          <span className="text-gray-900">{formatEUR(total)}</span>
        </div>
      </div>

      {ctaHref ? (
        <Link
          href={ctaHref}
          className="mt-4 block w-full text-center px-4 py-3 text-sm font-semibold text-white bg-[#E87B5A] rounded-lg hover:bg-[#D56E4F] transition-colors"
        >
          {ctaLabel}
        </Link>
      ) : onCtaClick ? (
        <button
          onClick={onCtaClick}
          className="mt-4 w-full px-4 py-3 text-sm font-semibold text-white bg-[#E87B5A] rounded-lg hover:bg-[#D56E4F] transition-colors"
        >
          {ctaLabel}
        </button>
      ) : null}
    </div>
  );
}
