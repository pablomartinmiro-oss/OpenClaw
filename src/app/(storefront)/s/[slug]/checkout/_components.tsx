"use client";

import Link from "next/link";
import { formatEUR } from "../_components/utils";

/* ---- Result screens ---- */

export function PaymentResultScreen({ slug, status, order }: { slug: string; status: string; order: string | null }) {
  const ok = status === "ok";
  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 py-16 sm:py-24 text-center">
      <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full ${ok ? "bg-green-50" : "bg-red-50"}`}>
        {ok ? <SvgCheck /> : <SvgErrorCircle />}
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{ok ? "Pago completado" : "Error en el pago"}</h1>
      <p className="text-gray-500 mb-2">
        {ok ? "Tu pago se ha procesado correctamente. Recibiras un email de confirmacion en breve." : "No se ha podido procesar tu pago. Puedes intentarlo de nuevo o contactar con nosotros."}
      </p>
      {order && <p className="text-sm text-gray-400 mb-6">Referencia: {order}</p>}
      <Link href={`/s/${slug}`} className="inline-block px-6 py-3 text-sm font-semibold text-white bg-[#E87B5A] rounded-lg hover:bg-[#D56E4F] transition-colors">Volver al inicio</Link>
    </div>
  );
}

interface RedsysParams {
  url: string;
  Ds_SignatureVersion: string;
  Ds_MerchantParameters: string;
  Ds_Signature: string;
}

export function RedsysRedirectScreen({ quoteNumber, total, redsys, formRef }: { quoteNumber: string; total: number; redsys: RedsysParams; formRef: React.RefObject<HTMLFormElement | null> }) {
  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 py-16 sm:py-24 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-orange-50">
        <SvgLock />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Redirigiendo al pago seguro...</h1>
      <p className="text-gray-500 mb-4">Pedido <span className="font-semibold">#{quoteNumber}</span> por {formatEUR(total)}</p>
      <p className="text-sm text-gray-400 mb-6">Seras redirigido automaticamente a la pasarela de pago.</p>
      <form ref={formRef} method="POST" action={redsys.url}>
        <input type="hidden" name="Ds_SignatureVersion" value={redsys.Ds_SignatureVersion} />
        <input type="hidden" name="Ds_MerchantParameters" value={redsys.Ds_MerchantParameters} />
        <input type="hidden" name="Ds_Signature" value={redsys.Ds_Signature} />
        <button type="submit" className="px-6 py-3 text-sm font-semibold text-white bg-[#E87B5A] rounded-lg hover:bg-[#D56E4F] transition-colors">Pagar ahora</button>
      </form>
    </div>
  );
}

export function ManualConfirmationScreen({ slug, quoteNumber, total, email }: { slug: string; quoteNumber: string; total: number; email: string }) {
  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 py-16 sm:py-24 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-50"><SvgCheck /></div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Pedido registrado</h1>
      <p className="text-gray-500 mb-1">Tu pedido <span className="font-semibold">#{quoteNumber}</span> por <span className="font-semibold">{formatEUR(total)}</span> ha sido registrado correctamente.</p>
      <p className="text-gray-500 mb-6">Recibiras un email de confirmacion a <span className="font-medium text-gray-900">{email}</span> con las instrucciones de pago.</p>
      <Link href={`/s/${slug}`} className="inline-block px-6 py-3 text-sm font-semibold text-white bg-[#E87B5A] rounded-lg hover:bg-[#D56E4F] transition-colors">Volver al inicio</Link>
    </div>
  );
}

export function EmptyCartScreen({ slug }: { slug: string }) {
  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 py-16 sm:py-24 text-center">
      <svg className="mx-auto" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
      </svg>
      <p className="text-lg text-gray-500 mt-4 mb-4">Tu carrito esta vacio.</p>
      <Link href={`/s/${slug}/experiencias`} className="inline-block px-6 py-3 text-sm font-semibold text-white bg-[#E87B5A] rounded-lg hover:bg-[#D56E4F] transition-colors">Explorar experiencias</Link>
    </div>
  );
}

/* ---- Form sub-components ---- */

export function OrderSummarySection({ items, discountCode, discountAmount, subtotal, total }: {
  items: { id: string; name: string; quantity: number; price: number; meta?: Record<string, string> }[];
  discountCode: string | null; discountAmount: number; subtotal: number; total: number;
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="text-base font-semibold text-gray-900 mb-4">Resumen del pedido</h2>
      <ul className="divide-y divide-gray-100">
        {items.map((item) => (
          <li key={item.id} className="flex justify-between py-2.5">
            <div className="text-sm text-gray-700">
              <span>{item.name}</span> <span className="text-gray-400">x{item.quantity}</span>
              {item.meta?.date && <span className="block text-xs text-gray-400 mt-0.5">{item.meta.date}</span>}
            </div>
            <span className="text-sm font-medium text-gray-900">{formatEUR(item.price * item.quantity)}</span>
          </li>
        ))}
      </ul>
      {discountCode && discountAmount > 0 && (
        <div className="flex justify-between pt-2 border-t border-gray-100 mt-2">
          <span className="text-sm text-green-600">Descuento ({discountCode})</span>
          <div className="text-right">
            <span className="text-sm text-gray-400 line-through mr-2">{formatEUR(subtotal)}</span>
            <span className="text-sm font-medium text-green-600">-{formatEUR(discountAmount)}</span>
          </div>
        </div>
      )}
      <div className="flex justify-between pt-3 border-t border-gray-200 mt-3">
        <span className="text-base font-bold text-gray-900">Total</span>
        <span className="text-base font-bold text-gray-900">{formatEUR(total)}</span>
      </div>
    </section>
  );
}

export function Field({ label, value, onChange, error, placeholder, type = "text", required = false }: {
  label: string; value: string; onChange: (v: string) => void; error?: string; placeholder?: string; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E87B5A]/30 focus:border-[#E87B5A] ${error ? "border-red-300 ring-1 ring-red-200" : "border-gray-200"}`}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

export function ErrorAlert({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#C75D4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <p className="text-sm text-red-700">{message}</p>
    </div>
  );
}

/* ---- Inline SVG icons ---- */

function SvgCheck() {
  return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#5B8C6D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>;
}

function SvgErrorCircle() {
  return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C75D4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>;
}

function SvgLock() {
  return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E87B5A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>;
}
