"use client";

import Link from "next/link";
import React from "react";

const BEBAS: React.CSSProperties = {
  fontFamily: "var(--font-bebas-neue, 'Bebas Neue', cursive)",
};

interface Service {
  title: string;
  category?: string;
  icon: React.ReactNode;
}

const SERVICES: Service[] = [
  { title: "Packs Todo Incluido", category: "pack", icon: <PackIcon /> },
  { title: "Hotel + Forfaits", category: "forfait", icon: <BedIcon /> },
  { title: "Escuela de Esquí", category: "escuela", icon: <SchoolIcon /> },
  { title: "Skirent Service", category: "alquiler", icon: <SkiIcon /> },
  { title: "Forfaits", category: "forfait", icon: <TicketIcon /> },
  { title: "Après-ski", category: "apreski", icon: <DrinkIcon /> },
  { title: "Taquillas 1500", category: "locker", icon: <LockerIcon /> },
];

export function Services({ slug }: { slug: string }) {
  return (
    <section id="servicios" className="bg-[#F5F7F9]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2
            className="text-4xl sm:text-6xl text-[#001D3D] uppercase leading-none"
            style={BEBAS}
          >
            Nuestros servicios
          </h2>
          <p className="mt-3 text-[#757575] text-base">
            Todo lo que necesitas para tu viaje de esquí en un solo lugar.
          </p>
        </div>

        {/* Horizontal scrollable row */}
        <div
          className="flex gap-6 overflow-x-auto pb-4 justify-start md:justify-center"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {SERVICES.map((s) => (
            <Link
              key={s.title}
              href={`/s/${slug}/experiencias${s.category ? `?category=${s.category}` : ""}`}
              className="group flex flex-col items-center gap-3 shrink-0 w-28"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white border-2 border-transparent group-hover:border-[#42A5F5] shadow-sm text-[#001D3D] group-hover:text-[#42A5F5] transition-all">
                {s.icon}
              </div>
              <span
                className="text-center text-[#001D3D] leading-tight text-sm"
                style={{ ...BEBAS, fontSize: "0.9rem", letterSpacing: "0.05em" }}
              >
                {s.title}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowItWorks({ slug }: { slug: string }) {
  const steps = [
    {
      n: "01",
      title: "Elige tu destino",
      desc: "Explora las 7 estaciones que mejor se adaptan a tu nivel y presupuesto.",
    },
    {
      n: "02",
      title: "Personaliza tu pack",
      desc: "Hotel, forfait, clases, alquiler y après-ski. Tú eliges, nosotros lo organizamos.",
    },
    {
      n: "03",
      title: "Reserva y disfruta",
      desc: "Paga solo el 25% para reservar. El resto, antes del viaje. Sin estrés.",
    },
  ];

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-28">
        <div className="max-w-2xl mb-14">
          <h2
            className="text-4xl sm:text-6xl text-[#001D3D] uppercase leading-none"
            style={BEBAS}
          >
            Reserva en 3 pasos
          </h2>
          <p className="mt-3 text-[#757575]">
            Sencillo, rápido y sin sorpresas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div
              key={s.n}
              className="relative bg-[#F5F7F9] p-8 border-l-4 border-[#42A5F5] hover:shadow-md transition-shadow"
            >
              <div
                className="text-6xl text-[#001D3D]/10 mb-4 leading-none"
                style={BEBAS}
              >
                {s.n}
              </div>
              <h3
                className="text-2xl text-[#001D3D] mb-3 uppercase"
                style={BEBAS}
              >
                {s.title}
              </h3>
              <p className="text-[#757575] leading-relaxed text-sm">
                {s.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href={`/s/${slug}/presupuesto`}
            className="inline-flex items-center px-8 py-4 text-white bg-[#42A5F5] hover:bg-[#2196F3] rounded-none shadow-sm transition-colors"
            style={BEBAS}
          >
            EMPEZAR MI RESERVA
          </Link>
        </div>
      </div>
    </section>
  );
}

function PackIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

function BedIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 4v16M22 4v16M2 12h20M2 20h20M6 12V8a2 2 0 012-2h8a2 2 0 012 2v4" />
    </svg>
  );
}

function SchoolIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  );
}

function SkiIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 18l18-12M5 20l14-9" />
      <circle cx="6" cy="19" r="1" />
      <circle cx="18" cy="6" r="1" />
    </svg>
  );
}

function TicketIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 7a2 2 0 012-2h14a2 2 0 012 2v3a2 2 0 000 4v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a2 2 0 000-4V7z" />
      <path d="M9 5v14" strokeDasharray="2 2" />
    </svg>
  );
}

function DrinkIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3h18l-2 9a4 4 0 01-4 3h-6a4 4 0 01-4-3L3 3z" />
      <path d="M12 15v6M8 21h8" />
    </svg>
  );
}

function LockerIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M9 12h.01M9 8h.01" />
      <path d="M14 8h2M14 12h2" />
    </svg>
  );
}
