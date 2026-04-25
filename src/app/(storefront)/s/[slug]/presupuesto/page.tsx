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
  "Formigal",
  "Alto Campoo",
  "Candanchu",
  "Astun",
  "La Pinilla",
  "Otra / sin preferencia",
];

const TRUST_ITEMS = [
  {
    title: "Respuesta en 24h",
    desc: "Te enviamos una propuesta personalizada en menos de un dia.",
  },
  {
    title: "Sin compromiso",
    desc: "Pide tu presupuesto gratis. Decides tranquilamente despues.",
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
      <div className="bg-[#FAF9F7] min-h-[60vh] flex items-center">
        <div className="mx-auto max-w-xl px-4 sm:px-6 py-14 text-center w-full">
          <div className="rounded-3xl border border-[#E8E4DE] bg-white p-10 shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#5B8C6D]/10">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#5B8C6D"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-[#2D2A26] mb-3">
              ¡Solicitud enviada!
            </h1>
            <p className="text-[#8A8580] mb-7 leading-relaxed">
              Hemos recibido tu solicitud. Te contactaremos en menos de 24 horas
              con una propuesta personalizada para tu viaje.
            </p>
            <Link
              href={`/s/${slug}`}
              className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-[#2D2A26] bg-white border border-[#E8E4DE] hover:border-[#2D2A26] rounded-lg transition-colors"
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
      <section className="bg-gradient-to-br from-[#0F1A2B] to-[#1A2842] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 sm:py-20">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#F2A98F] mb-3">
            Presupuesto a medida
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight max-w-3xl">
            Solicita tu presupuesto personalizado
          </h1>
          <p className="mt-4 text-white/70 text-lg max-w-2xl">
            Cuentanos sobre tu viaje y te enviaremos una propuesta a medida en
            menos de 24 horas. Sin compromiso.
          </p>
        </div>
      </section>

      <div className="bg-[#FAF9F7]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
            <form
              onSubmit={onSubmit}
              className="rounded-2xl border border-[#E8E4DE] bg-white p-6 sm:p-8 shadow-sm space-y-8"
            >
              <Section
                title="Datos personales"
                step="1"
                desc="¿Como podemos contactarte?"
              >
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
                  <Field label="Telefono">
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

              <div className="border-t border-[#E8E4DE]" />

              <Section
                title="Detalles del viaje"
                step="2"
                desc="Cuentanos las fechas y los viajeros."
              >
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
                  <div className="sm:col-span-2">
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
                </div>
              </Section>

              <div className="border-t border-[#E8E4DE]" />

              <Section
                title="Servicios"
                step="3"
                desc="Marca todo lo que te interese."
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ACTIVITIES.map((a) => {
                    const checked = activities.includes(a.value);
                    return (
                      <label
                        key={a.value}
                        className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-sm cursor-pointer transition-all ${
                          checked
                            ? "border-[#E87B5A] bg-[#E87B5A]/5 text-[#2D2A26]"
                            : "border-[#E8E4DE] bg-white text-[#8A8580] hover:border-[#E87B5A]/40"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(a.value)}
                          className="h-4 w-4 rounded border-gray-300 text-[#E87B5A] focus:ring-[#E87B5A]/30"
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
                  placeholder="Niveles, edades de los ninos, fechas flexibles, alergias, etc."
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
                <div className="rounded-lg bg-[#C75D4A]/10 border border-[#C75D4A]/30 px-4 py-3 text-sm text-[#C75D4A] font-medium">
                  {error}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center px-6 py-4 text-base font-bold text-white bg-[#E87B5A] rounded-xl hover:bg-[#D56E4F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  {submitting ? "Enviando..." : "Solicitar presupuesto gratis"}
                </button>
                <p className="mt-3 text-xs text-[#8A8580] text-center">
                  Al enviar aceptas nuestra{" "}
                  <Link
                    href={`/s/${slug}/politica-privacidad`}
                    className="underline hover:text-[#2D2A26]"
                  >
                    politica de privacidad
                  </Link>
                  .
                </p>
              </div>
            </form>

            <aside className="space-y-4">
              <div className="rounded-2xl bg-white border border-[#E8E4DE] p-6 shadow-sm">
                <h3 className="text-sm font-bold text-[#2D2A26] uppercase tracking-wider mb-5">
                  ¿Por que con nosotros?
                </h3>
                <ul className="space-y-5">
                  {TRUST_ITEMS.map((it) => (
                    <li key={it.title} className="flex gap-3">
                      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#E87B5A]/10 text-[#E87B5A]">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      </span>
                      <div>
                        <div className="text-sm font-semibold text-[#2D2A26]">
                          {it.title}
                        </div>
                        <div className="text-xs text-[#8A8580] mt-0.5 leading-relaxed">
                          {it.desc}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl bg-[#0F1A2B] text-white p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#F2A98F] mb-2">
                  Tambien por telefono
                </p>
                <p className="text-sm text-white/80 leading-relaxed">
                  Si prefieres, llamanos y te ayudamos a planificar tu viaje en
                  directo.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}

const inputCls =
  "w-full rounded-lg border border-[#E8E4DE] bg-white px-3.5 py-2.5 text-sm text-[#2D2A26] placeholder-[#8A8580] focus:outline-none focus:ring-2 focus:ring-[#E87B5A]/30 focus:border-[#E87B5A] transition-colors";

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
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E87B5A] text-white text-xs font-bold">
              {step}
            </span>
          )}
          <h2 className="text-lg font-bold text-[#2D2A26]">{title}</h2>
        </div>
        {desc && <p className="text-sm text-[#8A8580] ml-10">{desc}</p>}
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
      <span className="block text-xs font-semibold text-[#2D2A26] mb-1.5">
        {label} {required && <span className="text-[#C75D4A]">*</span>}
      </span>
      {children}
    </label>
  );
}
