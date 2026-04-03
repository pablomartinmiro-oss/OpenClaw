"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "../_components/CartContext";
import { CartSummary } from "../_components/CartSummary";
import { formatEUR } from "../_components/utils";

export default function CheckoutPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { items, total, discountCode, discountAmount, clearCart } = useCart();

  const [form, setForm] = useState({ nombre: "", email: "", telefono: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.nombre.trim()) errs.nombre = "El nombre es obligatorio";
    if (!form.email.trim()) errs.email = "El email es obligatorio";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Email no valido";
    if (!form.telefono.trim()) errs.telefono = "El telefono es obligatorio";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (items.length === 0) return;

    setSubmitting(true);
    try {
      // Future: POST to /api/storefront/public/[slug]/checkout
      // For now, simulate success
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSuccess(true);
      clearCart();
    } catch {
      setErrors({ submit: "Error al procesar el pedido. Intentalo de nuevo." });
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="mx-auto max-w-xl px-4 sm:px-6 py-16 sm:py-24 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
          <CheckIcon />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Pedido confirmado
        </h1>
        <p className="text-gray-500 mb-6">
          Hemos recibido tu pedido. Te enviaremos un email de confirmacion a{" "}
          <span className="font-medium text-gray-900">{form.email}</span>.
        </p>
        <button
          onClick={() => router.push(`/s/${slug}`)}
          className="px-6 py-3 text-sm font-semibold text-white bg-[#E87B5A] rounded-lg hover:bg-[#D56E4F] transition-colors"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 sm:px-6 py-16 sm:py-24 text-center">
        <p className="text-lg text-gray-500 mb-4">Tu carrito esta vacio.</p>
        <button
          onClick={() => router.push(`/s/${slug}/experiencias`)}
          className="px-6 py-3 text-sm font-semibold text-white bg-[#E87B5A] rounded-lg hover:bg-[#D56E4F] transition-colors"
        >
          Explorar experiencias
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
        Finalizar compra
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cart review */}
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Resumen del pedido
            </h2>
            <ul className="divide-y divide-gray-100">
              {items.map((item) => (
                <li key={item.id} className="flex justify-between py-2.5">
                  <span className="text-sm text-gray-700">
                    {item.name}{" "}
                    <span className="text-gray-400">x{item.quantity}</span>
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatEUR(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            {discountCode && (
              <div className="flex justify-between pt-2 border-t border-gray-100 mt-2">
                <span className="text-sm text-green-600">
                  Descuento ({discountCode})
                </span>
                <span className="text-sm font-medium text-green-600">
                  -{formatEUR(discountAmount)}
                </span>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t border-gray-200 mt-3">
              <span className="text-base font-bold text-gray-900">Total</span>
              <span className="text-base font-bold text-gray-900">
                {formatEUR(total)}
              </span>
            </div>
          </section>

          {/* Contact form */}
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Datos de contacto
            </h2>
            <div className="space-y-4">
              <Field
                label="Nombre completo"
                value={form.nombre}
                onChange={(v) => update("nombre", v)}
                error={errors.nombre}
                placeholder="Ej: Maria Garcia Lopez"
              />
              <Field
                label="Email"
                type="email"
                value={form.email}
                onChange={(v) => update("email", v)}
                error={errors.email}
                placeholder="tu@email.com"
              />
              <Field
                label="Telefono"
                type="tel"
                value={form.telefono}
                onChange={(v) => update("telefono", v)}
                error={errors.telefono}
                placeholder="+34 600 000 000"
              />
            </div>
            {errors.submit && (
              <p className="text-sm text-red-500 mt-4">{errors.submit}</p>
            )}
          </section>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full px-6 py-3.5 text-base font-semibold text-white bg-[#E87B5A] rounded-lg hover:bg-[#D56E4F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "Procesando..." : "Confirmar y pagar"}
          </button>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <CartSummary slug={slug} compact />
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E87B5A]/30 focus:border-[#E87B5A] ${
          error ? "border-red-300" : "border-gray-200"
        }`}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#5B8C6D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
