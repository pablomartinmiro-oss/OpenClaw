"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import React from "react";

const BEBAS: React.CSSProperties = {
  fontFamily: "var(--font-bebas-neue, 'Bebas Neue', cursive)",
};

const ACTIVITIES = [
  { value: "clases_esqui", label: "Clases de esquí / snow" },
  { value: "alquiler", label: "Alquiler de material" },
  { value: "forfait", label: "Forfait remontes" },
  { value: "snowcamp", label: "Snowcamp / campamentos" },
  { value: "apreski", label: "Après-ski" },
  { value: "hotel", label: "Alojamiento" },
  { value: "spa", label: "Spa & bienestar" },
  { value: "restaurante", label: "Restaurante" },
];

const STATIONS = [
  "Baqueira Beret",
  "Sierra Nevada",
  "Formigal",
  "Alto Campoo",
  "Candanchú",
  "Astún",
  "La Pinilla",
  "Otra / sin preferencia",
];

const TRUST_ITEMS = [
  {
    title: "Respuesta en 24h",
    desc: "Te enviamos una propuesta personalizada en menos de un día.",
  },
  {
    title: "Sin compromiso",
    desc: "Pide tu presupuesto gratis. Decides tranquilamente después.",
  },
  {
    title: "Pago fraccionado",
    desc: "Reserva con solo el 25% y paga el resto antes del viaje.",
  },
  {
    title: "Mejor precio garantizado",
    desc: "Trabajamos con las estaciones para conseguirte tarifas exclusivas.",
  },
];

const PHONE = "+34 91 904 19 47";
const WHATSAPP_URL = "https://wa.me/34919041947";

const inputCls =
  "w-full border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-[#001D3D] placeholder-[#757575] focus:outline-none focus:ring-2 focus:ring-[#42A5F5]/30 focus:border-[#42A5F5] transition-colors";

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
      <div className="bg-[#F5F7F9] min-h-[60vh] flex items-center">
        <div className="mx-auto max-w-xl px-4 sm:px-6 py-14 text-center w-full">
          <div className="bg-white p-10 shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#2DB742]/10">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#2DB742"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h1
              className="text-4xl text-[#001D3D] mb-3 uppercase"
              style={BEBAS}
            >
              ¡Solicitud enviada!
            </h1>
            <p className="text-[#757575] mb-7 leading-relaxed">
              Hemos recibido tu solicitud. Te contactaremos en menos de 24
              horas con una propuesta personalizada para tu viaje.
            </p>
            <Link
              href={`/s/${slug}`}
              className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-[#001D3D] bg-white border border-gray-200 hover:border-[#001D3D] rounded-none transition-colors"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-[#001D3D] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
          <h1
            className="text-5xl sm:text-7xl uppercase leading-none max-w-3xl"
            style={BEBAS}
          >
            Solicita tu presupuesto personalizado
          </h1>
          <p className="mt-4 text-white/70 text-lg max-w-2xl">
            Cuéntanos sobre tu viaje y te enviaremos una propuesta a medida en
            menos de 24 horas. Sin compromiso.
          </p>
        </div>
      </section>

      <div className="bg-[#F5F7F9]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
            <form
              onSubmit={onSubmit}
              className="bg-white p-6 sm:p-8 shadow-sm space-y-8"
            >
              <Section title="Datos personales" step="1" desc="¿Cómo podemos contactarte?">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Nombre completo" required>
                    <input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className={inputCls}
                      maxLength={200}
                      placeholder="Tu nombre"
                    />
                  </Field>
                  <Field label="Email" required>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputCls}
                      maxLength={200}
                      placeholder="tu@email.com"
                    />
                  </Field>
                  <Field label="Teléfono">
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={inputCls}
                      maxLength={50}
                      placeholder="+34 600 000 000"
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

              <div className="border-t border-gray-100" />

              <Section title="Detalles del viaje" step="2" desc="Cuéntanos las fechas y los viajeros.">
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
                  <Field label="Niños">
                    <input
                      type="number"
                      min={0}
                      max={50}
                      value={numChildren}
                      onChange={(e) => setNumChildren(Number(e.target.value))}
                      className={inputCls}
                    />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Estación preferida">
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
                </div>
              </Section>

              <div className="border-t border-gray-100" />

              <Section title="Servicios" step="3" desc="Marca todo lo que te interese.">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ACTIVITIES.map((a) => {
                    const checked = activities.includes(a.value);
                    return (
                      <label
                        key={a.value}
                        className={`flex items-center gap-3 border-2 px-4 py-3 text-sm cursor-pointer transition-all ${
                          checked
                            ? "border-[#42A5F5] bg-[#42A5F5]/5 text-[#001D3D]"
                            : "border-gray-200 bg-white text-[#757575] hover:border-[#42A5F5]/40"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(a.value)}
                          className="h-4 w-4 border-gray-300 text-[#42A5F5] focus:ring-[#42A5F5]/30"
                        />
                        <span className="font-medium">{a.label}</span>
                      </label>
                    );
                  })}
                </div>
              </Section>

              <Section
                title="Notas adicionales"
                step="4"
                desc="Cualquier detalle relevante para tu viaje."
              >
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  maxLength={2000}
                  placeholder="Niveles, edades de los niños, fechas flexibles, alergias, etc."
                  className={`${inputCls} resize-none`}
                />
              </Section>

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
                <div className="bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium">
                  {error}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center px-6 py-4 text-base font-bold text-white bg-[#42A5F5] hover:bg-[#2196F3] disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-none shadow-sm"
                  style={BEBAS}
                >
                  {submitting ? "ENVIANDO..." : "SOLICITAR PRESUPUESTO GRATIS"}
                </button>
                <p className="mt-3 text-xs text-[#757575] text-center">
                  Al enviar aceptas nuestra{" "}
                  <Link
                    href={`/s/${slug}/politica-privacidad`}
                    className="underline hover:text-[#001D3D]"
                  >
                    política de privacidad
                  </Link>
                  .
                </p>
              </div>
            </form>

            <aside className="space-y-4">
              <div className="bg-white p-6 shadow-sm">
                <h3
                  className="text-[#001D3D] mb-5 uppercase tracking-wide"
                  style={{ ...BEBAS, fontSize: "1.1rem" }}
                >
                  ¿Por qué con nosotros?
                </h3>
                <ul className="space-y-5">
                  {TRUST_ITEMS.map((it) => (
                    <li key={it.title} className="flex gap-3">
                      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center bg-[#42A5F5]/10 text-[#42A5F5]">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      </span>
                      <div>
                        <div className="text-sm font-semibold text-[#001D3D]">
                          {it.title}
                        </div>
                        <div className="text-xs text-[#757575] mt-0.5 leading-relaxed">
                          {it.desc}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#001D3D] text-white p-6">
                <p
                  className="text-[#42A5F5] mb-2 uppercase tracking-wide"
                  style={{ ...BEBAS, fontSize: "1rem" }}
                >
                  También por teléfono
                </p>
                <p className="text-sm text-white/80 leading-relaxed mb-4">
                  Si prefieres, llámanos y te ayudamos a planificar tu viaje en
                  directo.
                </p>
                <a
                  href={`tel:${PHONE.replace(/\s+/g, "")}`}
                  className="block text-center px-4 py-2.5 text-white border border-white/30 hover:bg-white/10 text-sm font-semibold transition-colors mb-2"
                >
                  {PHONE}
                </a>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-white bg-[#2DB742] hover:bg-[#25C039] text-sm font-semibold transition-colors"
                  style={BEBAS}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.5 14.4c-.3-.1-1.7-.8-2-1-.3-.1-.5-.1-.7.1-.2.3-.7 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.2-.4-2.3-1.4-.8-.7-1.4-1.7-1.6-2-.2-.3 0-.4.1-.6.1-.1.3-.3.4-.5.1-.1.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.3 5.2 4.6.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3zM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.4c1.4.8 3.1 1.2 4.8 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2z" />
                  </svg>
                  WHATSAPP
                </a>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}

function Section({
  title,
  step,
  desc,
  children,
}: {
  title: string;
  step?: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-5">
        <div className="flex items-center gap-3 mb-1">
          {step && (
            <span className="flex h-7 w-7 items-center justify-center bg-[#42A5F5] text-white text-xs font-bold rounded-none">
              {step}
            </span>
          )}
          <h2
            className="text-2xl text-[#001D3D] uppercase"
            style={BEBAS}
          >
            {title}
          </h2>
        </div>
        {desc && (
          <p className="text-sm text-[#757575] ml-10">{desc}</p>
        )}
      </div>
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
      <span className="block text-xs font-semibold text-[#001D3D] mb-1.5">
        {label}{" "}
        {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}
