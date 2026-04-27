"use client";

import Link from "next/link";
import React from "react";

const BEBAS: React.CSSProperties = {
  fontFamily: "var(--font-bebas-neue, 'Bebas Neue', cursive)",
};

const REVIEWS = [
  {
    name: "María L.",
    location: "Madrid",
    stars: 5,
    text: "Reservamos un pack de 4 días en Baqueira y todo perfecto. El hotel impecable, las clases muy bien organizadas y el alquiler de material sin colas. Repetiremos seguro.",
  },
  {
    name: "Carlos & familia",
    location: "Sevilla",
    stars: 5,
    text: "Primera vez con los niños en la nieve y nos lo pusieron facilísimo. La opción de pago fraccionado nos ayudó mucho. Volveremos el año que viene.",
  },
  {
    name: "Lucía G.",
    location: "Valencia",
    stars: 5,
    text: "Atención al cliente excelente. Cambié las fechas dos veces y siempre me solucionaron sin problema. Recomiendo Skicenter al 100%.",
  },
];

export function Testimonials() {
  return (
    <section className="bg-[#F5F7F9]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-28">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2
            className="text-4xl sm:text-6xl text-[#001D3D] uppercase leading-none"
            style={BEBAS}
          >
            Miles de viajeros lo recomiendan
          </h2>
          <p className="mt-3 text-[#757575]">
            Más de 4.000 familias y grupos han confiado en nosotros.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map((r) => (
            <div
              key={r.name}
              className="bg-white p-7 flex flex-col shadow-sm hover:shadow-md transition-shadow"
            >
              <Stars n={r.stars} />
              <p className="mt-4 text-[#001D3D] text-base leading-relaxed flex-1 italic">
                &ldquo;{r.text}&rdquo;
              </p>
              <div className="mt-5 pt-5 border-t border-gray-100 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#001D3D] text-white font-bold text-sm">
                  {r.name.charAt(0)}
                </span>
                <div>
                  <div className="text-sm font-semibold text-[#001D3D]">
                    {r.name}
                  </div>
                  <div className="text-xs text-[#757575]">{r.location}</div>
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
          fill={i < n ? "#F27A0B" : "#E5E7EB"}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

interface FinancingProps {
  slug: string;
}

export function Financing({ slug }: FinancingProps) {
  return (
    <section className="bg-[#001D3D] text-white relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-10 bg-center bg-cover"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1518608552930-1b62c80e8e4f?auto=format&fit=crop&w=2000&q=80')",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-28">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <h2
              className="text-5xl sm:text-7xl uppercase leading-none mb-5"
              style={BEBAS}
            >
              Reserva con{" "}<span className="text-[#42A5F5]">solo el 25%</span>
            </h2>
            <p className="text-white/70 text-lg leading-relaxed mb-8">
              Asegura tu plaza ahora con un primer pago del 25% y abona el
              resto hasta 30 días antes del viaje. Sin intereses, sin sorpresas.
            </p>
            <Link
              href={`/s/${slug}/presupuesto`}
              className="inline-flex items-center px-8 py-4 text-white bg-[#42A5F5] hover:bg-[#2196F3] rounded-none shadow-lg transition-colors"
              style={BEBAS}
            >
              SOLICITAR PRESUPUESTO
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Stat label="Reserva inicial" value="25%" highlight />
            <Stat label="Antes del viaje" value="75%" />
            <Stat label="Sin intereses" value="0%" />
            <Stat label="Comisión" value="0 €" />
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
      className={`p-6 border ${
        highlight
          ? "bg-[#42A5F5]/20 border-[#42A5F5]/50"
          : "bg-white/5 border-white/10"
      }`}
    >
      <div
        className="text-4xl sm:text-5xl text-white mb-1"
        style={BEBAS}
      >
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

const DEFAULT_PHONE = "+34 91 904 19 47";

export function ContactCTA({
  slug,
  contactPhone,
  contactEmail,
}: ContactProps) {
  const phone = contactPhone ?? DEFAULT_PHONE;
  const wa = `https://wa.me/${phone.replace(/[^0-9]/g, "")}`;

  return (
    <section id="contacto" className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-24">
        <div className="bg-[#001D3D] p-10 sm:p-16 text-center text-white">
          <h2
            className="text-5xl sm:text-7xl uppercase leading-none mb-3"
            style={BEBAS}
          >
            ¿Necesitas ayuda?
          </h2>
          <p className="text-white/70 text-lg max-w-xl mx-auto mb-10">
            Nuestro equipo te ayuda a planificar tu viaje. Disponibles de
            lunes a viernes de 8:30 a 20:00.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/s/${slug}/presupuesto`}
              className="inline-flex items-center justify-center px-7 py-4 text-white bg-[#42A5F5] hover:bg-[#2196F3] rounded-none transition-colors"
              style={BEBAS}
            >
              PEDIR PRESUPUESTO
            </Link>
            <a
              href={`tel:${phone.replace(/\s+/g, "")}`}
              className="inline-flex items-center justify-center gap-2 px-7 py-4 text-white border border-white/30 hover:bg-white/10 rounded-none transition-colors"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.37 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0122 16.92z" />
              </svg>
              <span className="font-semibold">{phone}</span>
            </a>
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 text-white bg-[#2DB742] hover:bg-[#25C039] rounded-none transition-colors"
              style={BEBAS}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.5 14.4c-.3-.1-1.7-.8-2-1-.3-.1-.5-.1-.7.1-.2.3-.7 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.2-.4-2.3-1.4-.8-.7-1.4-1.7-1.6-2-.2-.3 0-.4.1-.6.1-.1.3-.3.4-.5.1-.1.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.3 5.2 4.6.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3zM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.4c1.4.8 3.1 1.2 4.8 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2z" />
              </svg>
              WHATSAPP
            </a>
          </div>

          {contactEmail && (
            <p className="mt-8 text-sm text-white/60">
              o escríbenos a{" "}
              <a
                href={`mailto:${contactEmail}`}
                className="text-[#42A5F5] font-semibold hover:underline"
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
