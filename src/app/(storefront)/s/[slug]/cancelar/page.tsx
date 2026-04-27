"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Reservation {
  id: string;
  clientName: string;
  clientEmail: string;
  station: string;
  activityDate: string;
  totalPrice: number;
  source: string;
}

const REASONS = [
  { value: "cambio_planes", label: "Cambio de planes" },
  { value: "enfermedad", label: "Enfermedad o motivo medico" },
  { value: "meteorologia", label: "Meteorologia adversa" },
  { value: "viaje_cancelado", label: "Viaje cancelado" },
  { value: "otro", label: "Otro motivo" },
];

export default function CancelarPage() {
  const { slug } = useParams<{ slug: string }>();
  const [step, setStep] = useState<"lookup" | "review" | "done">("lookup");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [locator, setLocator] = useState("");
  const [email, setEmail] = useState("");
  const [reservation, setReservation] = useState<Reservation | null>(null);

  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [website, setWebsite] = useState("");

  const onLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!locator.trim() && !email.trim()) {
      return setError("Introduce el localizador o email");
    }
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (locator.trim()) params.set("locator", locator.trim());
      if (email.trim()) params.set("email", email.trim());
      const res = await fetch(
        `/api/storefront/public/${slug}/cancellation?${params.toString()}`
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? data.error ?? "No se encontró la reserva");
        return;
      }
      if (data.cancelled) {
        setError("Esta reserva ya está cancelada.");
        return;
      }
      setReservation(data.reservation);
      if (data.reservation?.clientEmail && !email)
        setEmail(data.reservation.clientEmail);
      setStep("review");
    } catch {
      setError("Error de red. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!reservation) return;
    if (!email.trim()) return setError("Introduce el email asociado");
    setLoading(true);
    try {
      const res = await fetch(
        `/api/storefront/public/${slug}/cancellation`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reservationId: reservation.id,
            email: email.trim(),
            reason: reason || null,
            notes: notes.trim() || null,
            website,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(
          data.error ??
            "No se pudo procesar la solicitud. Verifica los datos."
        );
        return;
      }
      setStep("done");
    } catch {
      setError("Error de red. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10 sm:py-14">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Solicitar cancelación
        </h1>
        <p className="text-gray-500 text-sm sm:text-base">
          Localiza tu reserva e indicanos el motivo. Revisaremos tu solicitud
          según la política de cancelación.
        </p>
      </div>

      {step === "lookup" && (
        <form
          onSubmit={onLookup}
          className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 space-y-5"
        >
          <Field label="Localizador o ID de reserva">
            <input
              value={locator}
              onChange={(e) => setLocator(e.target.value)}
              placeholder="Ej. ABC12345"
              className={inputCls}
              maxLength={50}
            />
          </Field>
          <div className="text-center text-xs text-gray-400">o</div>
          <Field label="Email de la reserva">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@ejemplo.com"
              className={inputCls}
              maxLength={200}
            />
          </Field>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className={primaryBtn}>
            {loading ? "Buscando..." : "Buscar reserva"}
          </button>
        </form>
      )}

      {step === "review" && reservation && (
        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 space-y-5"
        >
          <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Reserva</span>
              <span className="font-mono text-gray-900">
                {reservation.id}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Cliente</span>
              <span className="text-gray-900">{reservation.clientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Estación</span>
              <span className="text-gray-900">{reservation.station}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Fecha</span>
              <span className="text-gray-900">
                {new Date(reservation.activityDate).toLocaleDateString(
                  "es-ES",
                  { day: "numeric", month: "long", year: "numeric" }
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Importe</span>
              <span className="text-gray-900 font-semibold">
                {new Intl.NumberFormat("es-ES", {
                  style: "currency",
                  currency: "EUR",
                }).format(reservation.totalPrice ?? 0)}
              </span>
            </div>
          </div>

          <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-gray-700">
            <p className="font-medium text-gray-900 mb-1">
              Política de cancelación
            </p>
            <p className="text-xs leading-relaxed">
              Las cancelaciones con más de 7 días de antelación son aceptadas
              sin coste. Entre 7 y 48h se aplica un 50% de cargo. En menos de
              48h o no presentación no procede reembolso. Cada caso se revisa
              individualmente.
            </p>
          </div>

          <Field label="Email asociado a la reserva" required>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              maxLength={200}
            />
          </Field>

          <Field label="Motivo">
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={inputCls}
            >
              <option value="">Seleccionar...</option>
              {REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Detalles adicionales">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              maxLength={2000}
              placeholder="Cuéntanos cualquier información relevante"
              className={`${inputCls} resize-none`}
            />
          </Field>

          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="hidden"
            aria-hidden="true"
          />

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row-reverse gap-2 pt-2">
            <button type="submit" disabled={loading} className={primaryBtn}>
              {loading ? "Enviando..." : "Enviar solicitud"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("lookup");
                setError(null);
              }}
              className={secondaryBtn}
            >
              Volver
            </button>
          </div>
        </form>
      )}

      {step === "done" && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#5B8C6D"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            Solicitud recibida
          </h2>
          <p className="text-sm text-gray-500">
            Hemos recibido tu solicitud de cancelación. Te contactaremos en
            breve para confirmar la resolución.
          </p>
          <Link
            href={`/s/${slug}`}
            className="inline-block text-sm font-medium text-[#E87B5A] hover:underline"
          >
            Volver al inicio
          </Link>
        </div>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E87B5A]/30 focus:border-[#E87B5A]";
const primaryBtn =
  "inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-[#E87B5A] rounded-lg hover:bg-[#D56E4F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors";
const secondaryBtn =
  "inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-[#C75D4A]">*</span>}
      </span>
      {children}
    </label>
  );
}
