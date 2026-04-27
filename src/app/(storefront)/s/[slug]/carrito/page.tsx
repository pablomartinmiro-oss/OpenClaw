"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "../_components/CartContext";
import { formatEUR } from "../_components/utils";
import { CartEmptyIcon, ItemIcon, TagIcon, XIcon } from "../_components/icons";

const TYPE_LABELS: Record<string, string> = {
  product: "Experiencia",
  room: "Habitación",
  spa: "Spa",
  restaurant: "Restaurante",
};

export default function CarritoPage() {
  const { slug } = useParams<{ slug: string }>();
  const {
    items,
    subtotal,
    total,
    discountAmount,
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
        setCodeError(data.error ?? "Código no válido");
      } else {
        applyDiscount(codeInput.trim(), data.discountAmount);
        setCodeInput("");
      }
    } catch {
      setCodeError("Error al verificar el código");
    } finally {
      setApplying(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 sm:px-6 py-20 sm:py-28 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50">
          <CartEmptyIcon />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Tu carrito está vacío
        </h2>
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
          Explora nuestras experiencias y añade lo que más te guste.
        </p>
        <Link
          href={`/s/${slug}/experiencias`}
          className="inline-block px-6 py-3 text-sm font-semibold text-white bg-[#E87B5A] rounded-lg hover:bg-[#D56E4F] transition-colors"
        >
          Explorar experiencias
        </Link>
      </div>
    );
  }

  const hasDiscount = !!discountCode && discountAmount > 0;
  const itemTotal = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
        Carrito
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-gray-50 flex items-center justify-center">
                <ItemIcon type={item.type} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 truncate">{item.name}</h3>
                <p className="text-xs text-gray-500 capitalize">{TYPE_LABELS[item.type]}</p>
                {item.meta?.date && <p className="text-xs text-[#E87B5A] mt-0.5">{item.meta.date}</p>}
                <p className="text-sm font-medium text-gray-900 mt-1">{formatEUR(item.price)} / ud.</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed text-sm">-</button>
                <span className="text-sm font-semibold text-gray-900 w-6 text-center">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm">+</button>
              </div>
              <div className="text-right min-w-[5rem]">
                <p className="text-sm font-bold text-gray-900">{formatEUR(item.price * item.quantity)}</p>
              </div>
              <button onClick={() => removeItem(item.id)} className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" aria-label="Eliminar">
                <XIcon />
              </button>
            </div>
          ))}

          {/* Discount code */}
          <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-5">
            <div className="flex items-center gap-2 mb-3">
              <TagIcon />
              <span className="text-sm font-semibold text-gray-900">Código de descuento</span>
            </div>
            {discountCode ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 bg-green-50 text-green-700 text-sm font-medium rounded-lg border border-green-200">{discountCode}</span>
                  <span className="text-sm text-green-600 font-medium">-{formatEUR(discountAmount)}</span>
                </div>
                <button onClick={removeDiscount} className="text-sm text-red-500 hover:underline">Eliminar</button>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <input type="text" value={codeInput} onChange={(e) => setCodeInput(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === "Enter" && handleApplyCode()} placeholder="Introduce tu código de descuento" className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E87B5A]/30 focus:border-[#E87B5A]" />
                  <button onClick={handleApplyCode} disabled={applying || !codeInput.trim()} className="px-5 py-2.5 text-sm font-semibold text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">{applying ? "..." : "Aplicar"}</button>
                </div>
                {codeError && <p className="text-xs text-red-500 mt-2">{codeError}</p>}
              </>
            )}
          </div>
        </div>

        {/* Summary sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Resumen del pedido</h3>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal ({itemTotal} artículos)</span>
                <span className="text-gray-900 font-medium">{formatEUR(subtotal)}</span>
              </div>
              {hasDiscount && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Descuento ({discountCode})</span>
                  <span className="text-green-600 font-medium">-{formatEUR(discountAmount)}</span>
                </div>
              )}
            </div>
            <div className="border-t border-gray-200 pt-3 mb-4">
              <div className="flex justify-between items-baseline">
                <span className="text-base font-bold text-gray-900">Total</span>
                <div className="text-right">
                  {hasDiscount && <span className="text-sm text-gray-400 line-through mr-2">{formatEUR(subtotal)}</span>}
                  <span className="text-lg font-bold text-gray-900">{formatEUR(total)}</span>
                </div>
              </div>
              {hasDiscount && <p className="text-xs text-green-600 text-right mt-1">Te ahorras {formatEUR(discountAmount)}</p>}
            </div>
            <Link href={`/s/${slug}/checkout`} className="block w-full text-center px-4 py-3 text-sm font-semibold text-white bg-[#E87B5A] rounded-lg hover:bg-[#D56E4F] transition-colors">Proceder al pago</Link>
            <Link href={`/s/${slug}/experiencias`} className="block w-full text-center px-4 py-2 mt-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Seguir comprando</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
