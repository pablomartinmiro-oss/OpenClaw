"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface VoucherData {
  code: string;
  type: string;
  value: number;
  expirationDate: string | null;
  createdAt: string;
}

const TYPE_LABELS: Record<string, string> = {
  monetary: "Monetario",
  activity: "Actividad",
  service: "Servicio",
};

const STATE_LABELS = {
  valid: { label: "Valido", color: "emerald", border: "border-emerald-200", bg: "bg-emerald-50", text: "text-emerald-700" },
  used: { label: "Ya canjeado", color: "gray", border: "border-gray-200", bg: "bg-gray-50", text: "text-gray-700" },
  expired: { label: "Caducado", color: "red", border: "border-red-200", bg: "bg-red-50", text: "text-red-700" },
} as const;

type VoucherState = keyof typeof STATE_LABELS;

export default function BonoPage() {
  const { slug } = useParams<{ slug: string }>();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    state: VoucherState;
    voucher: VoucherData;
  } | null>(null);

  const onSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!code.trim()) return setError("Introduce el codigo del bono");

    setLoading(true);
    try {
      const res = await fetch(
        `/api/storefront/public/${slug}/voucher/${encodeURIComponent(
          code.trim().toUpperCase()
        )}`
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? data.error ?? "No se encontro el bono");
        return;
      }
      setResult({ state: data.state, voucher: data.voucher });
    } catch {
      setError("Error de red. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setCode("");
    setResult(null);
    setError(null);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10 sm:py-14">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Verificar bono
        </h1>
        <p className="text-gray-500 text-sm sm:text-base">
          Introduce el codigo de tu bono de compensacion para ver su estado y
          validez.
        </p>
      </div>

      <form
        onSubmit={onSearch}
        className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 space-y-4"
      >
        <label className="block">
          <span className="block text-xs font-medium text-gray-700 mb-1">
            Codigo del bono
          </span>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="BON-2026-0001"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-mono text-sm text-gray-900 uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-[#E87B5A]/30 focus:border-[#E87B5A]"
            maxLength={50}
            autoFocus
          />
        </label>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-[#E87B5A] rounded-lg hover:bg-[#D56E4F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Verificando..." : "Verificar"}
          </button>
          {result && (
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Limpiar
            </button>
          )}
        </div>
      </form>

      {result && (
        <div
          className={`mt-6 rounded-2xl border ${
            STATE_LABELS[result.state].border
          } ${STATE_LABELS[result.state].bg} p-5 sm:p-6`}
        >
          <div className="flex items-center justify-between mb-4">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${
                STATE_LABELS[result.state].text
              } bg-white border ${STATE_LABELS[result.state].border}`}
            >
              <Dot color={result.state} />
              {STATE_LABELS[result.state].label}
            </span>
            <span className="font-mono text-sm font-semibold text-gray-900">
              {result.voucher.code}
            </span>
          </div>

          <div className="space-y-2 text-sm">
            <Row label="Tipo">
              <span className="text-gray-900">
                {TYPE_LABELS[result.voucher.type] ?? result.voucher.type}
              </span>
            </Row>
            <Row label="Valor">
              <span className="font-semibold text-gray-900">
                {new Intl.NumberFormat("es-ES", {
                  style: "currency",
                  currency: "EUR",
                }).format(result.voucher.value)}
              </span>
            </Row>
            <Row label="Emitido">
              <span className="text-gray-700">
                {new Date(result.voucher.createdAt).toLocaleDateString(
                  "es-ES",
                  { day: "numeric", month: "long", year: "numeric" }
                )}
              </span>
            </Row>
            <Row label="Caducidad">
              <span className="text-gray-700">
                {result.voucher.expirationDate
                  ? new Date(
                      result.voucher.expirationDate
                    ).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "Sin caducidad"}
              </span>
            </Row>
          </div>

          {result.state === "valid" && (
            <p className="mt-4 text-xs text-gray-600 leading-relaxed">
              Para canjear este bono, contacta con el centro o aplicalo en tu
              proxima reserva.
            </p>
          )}
          {result.state === "used" && (
            <p className="mt-4 text-xs text-gray-600 leading-relaxed">
              Este bono ya ha sido canjeado. Si crees que es un error, ponte
              en contacto con nosotros.
            </p>
          )}
          {result.state === "expired" && (
            <p className="mt-4 text-xs text-gray-600 leading-relaxed">
              Este bono ha caducado. Contacta con nosotros para revisar si es
              posible una extension.
            </p>
          )}
        </div>
      )}

      <div className="mt-6 text-center">
        <Link
          href={`/s/${slug}`}
          className="text-sm font-medium text-[#E87B5A] hover:underline"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between border-b border-gray-100 last:border-0 py-1.5">
      <span className="text-gray-500">{label}</span>
      {children}
    </div>
  );
}

function Dot({ color }: { color: VoucherState }) {
  const map: Record<VoucherState, string> = {
    valid: "bg-emerald-500",
    used: "bg-gray-400",
    expired: "bg-red-500",
  };
  return <span className={`h-1.5 w-1.5 rounded-full ${map[color]}`} />;
}
