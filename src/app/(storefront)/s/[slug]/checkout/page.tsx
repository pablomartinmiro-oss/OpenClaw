"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useCart } from "../_components/CartContext";
import { CartSummary } from "../_components/CartSummary";
import {
  PaymentResultScreen,
  RedsysRedirectScreen,
  ManualConfirmationScreen,
  EmptyCartScreen,
  OrderSummarySection,
  Field,
  ErrorAlert,
} from "./_components";

interface CheckoutResponse {
  quoteId: string;
  quoteNumber: string;
  total: number;
  status: string;
  paymentMode: "redsys" | "manual";
  redsys: {
    url: string;
    Ds_SignatureVersion: string;
    Ds_MerchantParameters: string;
    Ds_Signature: string;
  } | null;
}

export default function CheckoutPage() {
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const {
    items,
    total,
    subtotal,
    discountCode,
    discountAmount,
    clearCart,
  } = useCart();

  const [form, setForm] = useState({ nombre: "", email: "", telefono: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<CheckoutResponse | null>(null);
  const redsysFormRef = useRef<HTMLFormElement>(null);

  const paymentStatus = searchParams.get("status");
  const paymentOrder = searchParams.get("order");

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
    setErrors({});

    try {
      // Build server-side Redis cart from localStorage items
      const cartRes = await fetch(`/api/storefront/${slug}/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: items[0].id,
          productName: items[0].name,
          quantity: items[0].quantity,
          unitPrice: items[0].price,
        }),
      });

      let cartId: string | null = null;
      if (cartRes.ok) {
        const cartData = await cartRes.json();
        cartId = cartData.cart?.id ?? cartData.cartId;

        for (let i = 1; i < items.length; i++) {
          await fetch(`/api/storefront/${slug}/cart`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              cartId,
              productId: items[i].id,
              productName: items[i].name,
              quantity: items[i].quantity,
              unitPrice: items[i].price,
              date: items[i].meta?.date,
              variant: items[i].meta?.variant,
            }),
          });
        }

        if (discountCode && cartId) {
          await fetch(`/api/storefront/${slug}/cart/apply-discount`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cartId, code: discountCode }),
          });
        }
      }

      if (!cartId) {
        throw new Error("No se pudo crear el carrito en el servidor");
      }

      const res = await fetch(`/api/storefront/${slug}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartId,
          clientName: form.nombre.trim(),
          clientEmail: form.email.trim(),
          clientPhone: form.telefono.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error ?? "Error al procesar el pedido");
      }

      const data = (await res.json()) as CheckoutResponse;
      setResult(data);
      clearCart();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error inesperado";
      setErrors({ submit: message });
    } finally {
      setSubmitting(false);
    }
  };

  // Auto-submit Redsys form after short delay
  useEffect(() => {
    if (result?.redsys && redsysFormRef.current) {
      const timer = setTimeout(() => redsysFormRef.current?.submit(), 1500);
      return () => clearTimeout(timer);
    }
  }, [result]);

  // Payment result (Redsys redirect back)
  if (paymentStatus) {
    return (
      <PaymentResultScreen
        slug={slug}
        status={paymentStatus}
        order={paymentOrder}
      />
    );
  }

  // Redsys redirect screen
  if (result?.redsys) {
    return (
      <RedsysRedirectScreen
        quoteNumber={result.quoteNumber}
        total={result.total}
        redsys={result.redsys}
        formRef={redsysFormRef}
      />
    );
  }

  // Manual payment confirmation
  if (result && !result.redsys) {
    return (
      <ManualConfirmationScreen
        slug={slug}
        quoteNumber={result.quoteNumber}
        total={result.total}
        email={form.email}
      />
    );
  }

  // Empty cart
  if (items.length === 0 && !result) {
    return <EmptyCartScreen slug={slug} />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
        Finalizar compra
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <OrderSummarySection
            items={items}
            discountCode={discountCode}
            discountAmount={discountAmount}
            subtotal={subtotal}
            total={total}
          />

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
                required
              />
              <Field
                label="Email"
                type="email"
                value={form.email}
                onChange={(v) => update("email", v)}
                error={errors.email}
                placeholder="tu@email.com"
                required
              />
              <Field
                label="Telefono"
                type="tel"
                value={form.telefono}
                onChange={(v) => update("telefono", v)}
                error={errors.telefono}
                placeholder="+34 600 000 000"
                required
              />
            </div>
            {errors.submit && <ErrorAlert message={errors.submit} />}
          </section>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full px-6 py-3.5 text-base font-semibold text-white bg-[#E87B5A] rounded-lg hover:bg-[#D56E4F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "Procesando..." : "Confirmar y pagar"}
          </button>

          <p className="text-xs text-gray-400 text-center">
            Pago seguro procesado por Redsys. Tus datos estan protegidos.
          </p>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <CartSummary slug={slug} compact />
          </div>
        </div>
      </div>
    </div>
  );
}
