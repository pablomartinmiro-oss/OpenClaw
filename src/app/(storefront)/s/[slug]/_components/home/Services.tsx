"use client";

import Link from "next/link";
import React from "react";

const BEBAS: React.CSSProperties = {
  fontFamily: "var(--font-bebas-neue, 'Bebas Neue', cursive)",
};

interface Service {
  title: string;
  category?: string;
  image: string;
}

const SERVICES: Service[] = [
  {
    title: "Packs all in one",
    category: "pack",
    image:
      "https://images.unsplash.com/photo-1453545082301-01cf5cc2aae5?auto=format&fit=crop&w=400&q=80",
  },
  {
    title: "Hotel/apt +forfaits",
    category: "forfait",
    image: "/services-alojamiento.jpg",
  },
  {
    title: "escuela de esqui",
    category: "escuela",
    image: "/services-escuela.jpg",
  },
  {
    title: "skirent service",
    category: "alquiler",
    image: "/clases-1024x494.jpg",
  },
  {
    title: "Forfaits",
    category: "forfait",
    image: "/services-forfaits.jpg",
  },
  {
    title: "apreski",
    category: "apreski",
    image:
      "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=400&q=80",
  },
  {
    title: "taquillas 1500",
    category: "locker",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400&q=80",
  },
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
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
        >
          {SERVICES.map((s) => (
            <Link
              key={s.title}
              href={`/s/${slug}/experiencias${s.category ? `?category=${s.category}` : ""}`}
              className="group flex flex-col items-center gap-3 shrink-0 w-28"
            >
              <div
                className="h-20 w-20 rounded-full overflow-hidden border-2 border-transparent group-hover:border-[#42A5F5] shadow-sm transition-all bg-center bg-cover"
                style={{ backgroundImage: `url(${s.image})` }}
              />
              <span
                className="text-center text-[#001D3D] leading-tight"
                style={{ ...BEBAS, fontSize: "0.85rem", letterSpacing: "0.04em" }}
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
              <p className="text-[#757575] leading-relaxed text-sm">{s.desc}</p>
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
