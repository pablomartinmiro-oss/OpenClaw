"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const ACTIVITIES = [
  { value: "clases_esqui", label: "Clases de esqui / snow" },
  { value: "alquiler", label: "Alquiler de material" },
  { value: "forfait", label: "Forfait remontes" },
  { value: "snowcamp", label: "Snowcamp / campamentos" },
  { value: "apreski", label: "Apres-ski" },
  { value: "hotel", label: "Alojamiento" },
  { value: "spa", label: "Spa & bienestar" },
  { value: "restaurante", label: "Restaurante" },
];

const STATIONS = [
  "Baqueira Beret",
  "Sierra Nevada",
  "La Pinilla",
  "Otra / sin preferencia",
];

export default function PresupuestoPage() {
  const { slug } = useParams<{ slug: string }>();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [numAdults, setNumAdults] = useState(2);
  const [numChildren, setNumChildren] = useState(0);
  const [station, setStation] = useState("");
  const [activities, setActivities] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [website, setWebsite] = useState("");

  const toggle = (value: string) => {
    setActivities((prev) =>
      prev.includes(value) ? prev.filter((a) => a !== value) : [...prev, value]
    );
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!customerName.trim()) return setError("Introduce tu nombre");
    if (!email.trim()) return setError("Introduce tu email");

    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/storefront/public/${slug}/budget-request`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerName: customerName.trim(),
            email: email.trim(),
            phone: phone.trim() || null,
            company: company.trim() || null,
            startDate: startDate || null,
            endDate: endDate || null,
            numAdults,
            numChildren,
            station: station || null,
            activities,
            notes: notes.trim() || null,
            website,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo enviar la solicitud");
        return;
      }
      setDone(true);
    } catch {
      setError("Error de red. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-14 text-center">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 space-y-4">
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
          <h1 className="text-2xl font-bold text-gray-900">
            Solicitud enviada
          </h1>
          <p className="text-gray-500 text-sm">
            Hemos recibido tu solicitud de presupuesto. Te contactaremos en
            menos de 24 horas con una propuesta personalizada.
          </p>
          <Link
            href={`/s/${slug}`}
            className="inline-block text-sm font-medium text-[#E87B5A] hover:underline"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-14">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Solicita tu presupuesto
        </h1>
        <p className="text-gray-500 text-sm sm:text-base">
          Cuentanos sobre tu viaje y te enviaremos una propuesta personalizada
          en menos de 24 horas.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 space-y-6"
      >
        <Section title="Tus datos">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nombre completo" required>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className={inputCls}
                maxLength={200}
              />
            </Field>
            <Field label="Email" required>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
                maxLength={200}
              />
            </Field>
            <Field label="Telefono">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputCls}
                maxLength={50}
              />
            </Field>
            <Field label="Empresa (opcional)">
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className={inputCls}
                maxLength={200}
              />
            </Field>
          </div>
        </Section>

        <Section title="Tu viaje">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Fecha inicio">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Fecha fin">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Adultos">
              <input
                type="number"
                min={0}
                max={50}
                value={numAdults}
                onChange={(e) => setNumAdults(Number(e.target.value))}
                className={inputCls}
              />
            </Field>
            <Field label="Ninos">
              <input
                type="number"
                min={0}
                max={50}
                value={numChildren}
                onChange={(e) => setNumChildren(Number(e.target.value))}
                className={inputCls}
              />
            </Field>
            <Field label="Estacion preferida">
              <select
                value={station}
                onChange={(e) => setStation(e.target.value)}
                className={inputCls}
              >
                <option value="">Sin preferencia</option>
                {STATIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </Section>

        <Section title="Servicios que te interesan">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ACTIVITIES.map((a) => {
              const checked = activities.includes(a.value);
              return (
                <label
                  key={a.value}
                  className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm cursor-pointer transition-colors ${
                    checked
                      ? "border-[#E87B5A] bg-orange-50 text-gray-900"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(a.value)}
                    className="h-4 w-4 rounded border-gray-300 text-[#E87B5A] focus:ring-[#E87B5A]/30"
                  />
                  <span>{a.label}</span>
                </label>
              );
            })}
          </div>
        </Section>

        <Section title="Notas adicionales">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            maxLength={2000}
            placeholder="Cuentanos cualquier detalle relevante: niveles, edades de los ninos, fechas flexibles, etc."
            className={`${inputCls} resize-none`}
          />
        </Section>

        {/* Honeypot */}
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

        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-[#E87B5A] rounded-lg hover:bg-[#D56E4F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "Enviando..." : "Enviar solicitud"}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E87B5A]/30 focus:border-[#E87B5A]";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
        {title}
      </h2>
      {children}
    </div>
  );
}

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
