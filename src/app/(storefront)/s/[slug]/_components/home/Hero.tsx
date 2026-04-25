"use client";

import Link from "next/link";

const HERO_BG =
  "https://images.unsplash.com/photo-1551524559-8af4e6624178?auto=format&fit=crop&w=2400&q=80";

export function Hero({ slug }: { slug: string }) {
  const base = `/s/${slug}`;
  return (
    <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden text-white">
      <div
        className="absolute inset-0 bg-center bg-cover"
        style={{ backgroundImage: `url(${HERO_BG})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-[#0F1A2B]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 h-full flex flex-col justify-center">
        <p className="text-xs sm:text-sm font-semibold tracking-[0.3em] uppercase text-[#F2A98F] mb-4">
          Agencia de viajes de esqui
        </p>
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold leading-[1.05] tracking-tight max-w-4xl">
          Tu viaje de esqui,{" "}
          <span className="text-[#E87B5A]">en un solo clic</span>
        </h1>
        <p className="mt-6 text-base sm:text-xl text-white/80 max-w-2xl leading-relaxed">
          Hotel, forfait, clases, alquiler y apres-ski. Todo organizado por
          expertos para que tu solo te ocupes de disfrutar la nieve.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Link
            href={`${base}/experiencias`}
            className="inline-flex items-center justify-center px-7 py-4 text-base font-semibold text-white bg-[#E87B5A] rounded-xl hover:bg-[#D56E4F] shadow-lg transition-all hover:-translate-y-0.5"
          >
            Ver destinos
            <svg className="ml-2 w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href={`${base}/presupuesto`}
            className="inline-flex items-center justify-center px-7 py-4 text-base font-semibold text-white bg-white/10 border border-white/30 backdrop-blur rounded-xl hover:bg-white/20 transition-colors"
          >
            Pedir presupuesto
          </Link>
        </div>

        <div className="mt-12 flex items-center gap-3 text-sm text-white/70">
          <div className="flex -space-x-2">
            <Avatar color="#E87B5A" />
            <Avatar color="#5B8C6D" />
            <Avatar color="#D4A853" />
          </div>
          <span>
            <span className="text-white font-semibold">+4.000 viajeros</span>{" "}
            han reservado con nosotros
          </span>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center text-white/60">
        <span className="text-xs uppercase tracking-widest mb-2">Descubre</span>
        <svg className="w-5 h-5 animate-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>
    </section>
  );
}

function Avatar({ color }: { color: string }) {
  return (
    <span
      className="w-7 h-7 rounded-full border-2 border-[#0F1A2B]"
      style={{ background: color }}
    />
  );
}

export function TrustBar() {
  const items = [
    { value: "+4.000", label: "Viajeros" },
    { value: "7", label: "Estaciones" },
    { value: "Desde 89 EUR", label: "Packs" },
    { value: "25%", label: "Pago fraccionado" },
  ];
  return (
    <section className="bg-[#0F1A2B] border-t border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((it) => (
            <div key={it.label} className="text-center md:text-left">
              <div className="text-2xl sm:text-3xl font-bold text-white">
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
