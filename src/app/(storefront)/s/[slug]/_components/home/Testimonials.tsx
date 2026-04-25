"use client";

import Link from "next/link";

const REVIEWS = [
  {
    name: "Maria L.",
    location: "Madrid",
    stars: 5,
    text: "Reservamos un pack de 4 dias en Baqueira y todo perfecto. El hotel impecable, las clases muy bien organizadas y el alquiler de material sin colas. Repetiremos seguro.",
  },
  {
    name: "Carlos & familia",
    location: "Sevilla",
    stars: 5,
    text: "Primera vez con los ninos en la nieve y nos lo pusieron facilisimo. La opcion de pago fraccionado nos ayudo mucho. Volveremos el ano que viene.",
  },
  {
    name: "Lucia G.",
    location: "Valencia",
    stars: 5,
    text: "Atencion al cliente excelente. Cambie las fechas dos veces y siempre me solucionaron sin problema. Recomiendo Skicenter al 100%.",
  },
];

export function Testimonials() {
  return (
    <section className="bg-white border-t border-[#E8E4DE]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-28">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#E87B5A] mb-3">
            Testimonios
          </p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#2D2A26]">
            Miles de viajeros lo recomiendan
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map((r) => (
            <div
              key={r.name}
              className="rounded-2xl border border-[#E8E4DE] bg-[#FAF9F7] p-7 flex flex-col"
            >
              <Stars n={r.stars} />
              <p className="mt-4 text-[#2D2A26] text-base leading-relaxed flex-1">
                &ldquo;{r.text}&rdquo;
              </p>
              <div className="mt-5 pt-5 border-t border-[#E8E4DE] flex items-center gap-3">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E87B5A] text-white font-bold text-sm"
                >
                  {r.name.charAt(0)}
                </span>
                <div>
                  <div className="text-sm font-semibold text-[#2D2A26]">
                    {r.name}
                  </div>
                  <div className="text-xs text-[#8A8580]">{r.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill={i < n ? "#D4A853" : "#E8E4DE"}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export function Financing({ slug }: { slug: string }) {
  return (
    <section className="bg-gradient-to-br from-[#0F1A2B] to-[#1A2842] text-white relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-20 bg-center bg-cover"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1518608552930-1b62c80e8e4f?auto=format&fit=crop&w=2000&q=80')",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#E87B5A]/20 text-[#F2A98F] text-xs font-semibold uppercase tracking-wider mb-5">
              Pago fraccionado
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold leading-tight tracking-tight mb-5">
              Reserva con solo el{" "}
              <span className="text-[#E87B5A]">25%</span>
            </h2>
            <p className="text-white/70 text-lg leading-relaxed mb-8">
              Asegura tu plaza ahora con un primer pago del 25% y abona el resto
              hasta 30 dias antes del viaje. Sin intereses, sin sorpresas.
            </p>
            <Link
              href={`/s/${slug}/presupuesto`}
              className="inline-flex items-center px-7 py-4 text-base font-semibold text-white bg-[#E87B5A] hover:bg-[#D56E4F] rounded-xl shadow-lg transition-all hover:-translate-y-0.5"
            >
              Solicitar presupuesto
              <svg className="ml-2 w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Stat label="Reserva inicial" value="25%" highlight />
            <Stat label="Antes del viaje" value="75%" />
            <Stat label="Sin intereses" value="0%" />
            <Stat label="Comision" value="0 EUR" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-6 border ${
        highlight
          ? "bg-[#E87B5A]/10 border-[#E87B5A]/40"
          : "bg-white/5 border-white/10"
      }`}
    >
      <div className="text-3xl sm:text-4xl font-bold text-white mb-1">
        {value}
      </div>
      <div className="text-xs text-white/60 uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}

interface ContactProps {
  slug: string;
  contactPhone?: string | null;
  contactEmail?: string | null;
}

export function ContactCTA({ slug, contactPhone, contactEmail }: ContactProps) {
  const wa = contactPhone
    ? `https://wa.me/${contactPhone.replace(/[^0-9]/g, "")}`
    : null;
  return (
    <section className="bg-[#FAF9F7] border-t border-[#E8E4DE]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-20 sm:py-24">
        <div className="rounded-3xl bg-white border border-[#E8E4DE] p-8 sm:p-12 text-center shadow-sm">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#2D2A26] mb-3">
            ¿Necesitas ayuda?
          </h2>
          <p className="text-[#8A8580] text-lg max-w-xl mx-auto mb-8">
            Nuestro equipo te ayuda a planificar tu viaje. Estamos disponibles
            de lunes a domingo.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/s/${slug}/presupuesto`}
              className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold text-white bg-[#E87B5A] hover:bg-[#D56E4F] rounded-xl transition-colors"
            >
              Pedir presupuesto
            </Link>
            {contactPhone && (
              <a
                href={`tel:${contactPhone.replace(/\s+/g, "")}`}
                className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold text-[#2D2A26] bg-white border border-[#E8E4DE] hover:border-[#2D2A26] rounded-xl transition-colors"
              >
                <svg className="mr-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.37 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0122 16.92z" />
                </svg>
                {contactPhone}
              </a>
            )}
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold text-white bg-[#25D366] hover:bg-[#1FBA59] rounded-xl transition-colors"
              >
                <svg className="mr-2 w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.5 14.4c-.3-.1-1.7-.8-2-1-.3-.1-.5-.1-.7.1-.2.3-.7 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.2-.4-2.3-1.4-.8-.7-1.4-1.7-1.6-2-.2-.3 0-.4.1-.6.1-.1.3-.3.4-.5.1-.1.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.3 5.2 4.6.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3zM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.4c1.4.8 3.1 1.2 4.8 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2z" />
                </svg>
                WhatsApp
              </a>
            )}
          </div>
          {contactEmail && (
            <p className="mt-6 text-sm text-[#8A8580]">
              o escribenos a{" "}
              <a
                href={`mailto:${contactEmail}`}
                className="text-[#E87B5A] font-semibold hover:underline"
              >
                {contactEmail}
              </a>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
