"use client";

import Link from "next/link";
import React from "react";

const HERO_BG =
  "https://images.unsplash.com/photo-1551524559-8af4e6624178?auto=format&fit=crop&w=2400&q=80";

const WHATSAPP_URL = "https://wa.me/34919041947";

const BEBAS: React.CSSProperties = {
  fontFamily: "var(--font-bebas-neue, 'Bebas Neue', cursive)",
};

export function Hero({ slug }: { slug: string }) {
  const base = `/s/${slug}`;
  return (
    <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden text-white">
      <div
        className="absolute inset-0 bg-center bg-cover"
        style={{ backgroundImage: `url(${HERO_BG})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/50 to-black/80" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 h-full flex flex-col justify-center pt-[100px]">
        <p
          className="text-sm tracking-[0.3em] uppercase text-[#42A5F5] mb-4"
          style={BEBAS}
        >
          Agencia de viajes de esquí
        </p>
        <h1
          className="text-5xl sm:text-7xl md:text-8xl uppercase leading-none max-w-4xl"
          style={BEBAS}
        >
          Skicenter.{" "}
          <span className="text-[#42A5F5]">
            Todo tu viaje de esquí en un solo clic.
          </span>
        </h1>
        <p className="mt-6 text-base sm:text-xl text-white/80 max-w-2xl leading-relaxed font-light">
          Expertos en viajes de esquí. Hotel, forfait, clases y alquiler de
          material en un solo pack. Reserva con solo el 25%.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Link
            href={`${base}/presupuesto`}
            className="inline-flex items-center justify-center px-7 py-4 text-base font-semibold text-white bg-[#42A5F5] hover:bg-[#2196F3] rounded-none shadow-lg transition-colors"
            style={BEBAS}
          >
            SOLICITA TU PRESUPUESTO
          </Link>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 px-7 py-4 text-base font-semibold text-white bg-[#2DB742] hover:bg-[#25C039] rounded-none shadow-lg transition-colors"
            style={BEBAS}
          >
            <WhatsAppIcon />
            WHATSAPP
          </a>
        </div>

        <div className="mt-12 flex items-center gap-3 text-sm text-white/70">
          <div className="flex -space-x-2">
            <Avatar color="#42A5F5" />
            <Avatar color="#2DB742" />
            <Avatar color="#F27A0B" />
          </div>
          <span>
            <span className="text-white font-semibold">+4.000 viajeros</span>{" "}
            han reservado con nosotros
          </span>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center text-white/60">
        <span className="text-xs uppercase tracking-widest mb-2">
          Descubre
        </span>
        <svg
          className="w-5 h-5 animate-bounce"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>
    </section>
  );
}

function Avatar({ color }: { color: string }) {
  return (
    <span
      className="w-7 h-7 rounded-full border-2 border-black/50"
      style={{ background: color }}
    />
  );
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.5 14.4c-.3-.1-1.7-.8-2-1-.3-.1-.5-.1-.7.1-.2.3-.7 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.2-.4-2.3-1.4-.8-.7-1.4-1.7-1.6-2-.2-.3 0-.4.1-.6.1-.1.3-.3.4-.5.1-.1.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.3 5.2 4.6.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3zM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.4c1.4.8 3.1 1.2 4.8 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2z" />
    </svg>
  );
}

export function TrustBar() {
  const items = [
    { value: "+4.000", label: "Viajeros" },
    { value: "7", label: "Estaciones" },
    { value: "Desde 89€", label: "Packs" },
    { value: "25%", label: "Pago inicial" },
  ];
  return (
    <section className="bg-[#001D3D]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((it) => (
            <div key={it.label} className="text-center">
              <div
                className="text-4xl sm:text-5xl text-white"
                style={BEBAS}
              >
                {it.value}
              </div>
              <div className="text-xs sm:text-sm text-white/60 uppercase tracking-wider mt-1">
                {it.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
