"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import React from "react";

const BEBAS: React.CSSProperties = {
  fontFamily: "var(--font-bebas-neue, 'Bebas Neue', cursive)",
};

interface Destination {
  slug: string;
  name: string;
  region: string;
  fromPrice: number;
  image: string;
}

const DESTINATIONS: Destination[] = [
  {
    slug: "baqueira-beret",
    name: "Baqueira Beret",
    region: "Pirineo de Lleida",
    fromPrice: 189,
    image:
      "https://images.unsplash.com/photo-1517299321609-52687d1bc55a?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "sierra-nevada",
    name: "Sierra Nevada",
    region: "Granada",
    fromPrice: 149,
    image:
      "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "formigal",
    name: "Formigal",
    region: "Pirineo de Huesca",
    fromPrice: 169,
    image:
      "https://images.unsplash.com/photo-1486648791255-7b327fa1c1d4?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "alto-campoo",
    name: "Alto Campoo",
    region: "Cantabria",
    fromPrice: 129,
    image:
      "https://images.unsplash.com/photo-1548777123-e216912df7d8?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "candanchu",
    name: "Candanchú",
    region: "Pirineo de Huesca",
    fromPrice: 139,
    image:
      "https://images.unsplash.com/photo-1502301197179-65228ab57f78?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "astun",
    name: "Astún",
    region: "Pirineo de Huesca",
    fromPrice: 139,
    image:
      "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "la-pinilla",
    name: "La Pinilla",
    region: "Segovia",
    fromPrice: 89,
    image:
      "https://images.unsplash.com/photo-1454942901704-3c44c11b2ad1?auto=format&fit=crop&w=1200&q=80",
  },
];

export function Destinations({ slug }: { slug: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const CARD_WIDTH = 320;
  const GAP = 20;

  const scroll = (dir: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "right" ? CARD_WIDTH + GAP : -(CARD_WIDTH + GAP), behavior: "smooth" });
  };

  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  return (
    <section id="destinos" className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-28">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <h2
              className="text-4xl sm:text-6xl text-[#001D3D] uppercase leading-none max-w-2xl"
              style={BEBAS}
            >
              Encuentra lo que necesitas en tu destino preferido
            </h2>
            <p className="mt-3 text-[#757575] text-base max-w-xl">
              Avanza solo un 25% de tu viaje.{" "}
              <strong className="text-[#001D3D]">
                ¡Reserva ahora y paga después!
              </strong>
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`flex h-10 w-10 items-center justify-center border border-[#001D3D] text-[#001D3D] hover:bg-[#001D3D] hover:text-white transition-colors rounded-none disabled:opacity-30 disabled:cursor-not-allowed`}
              aria-label="Anterior"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={`flex h-10 w-10 items-center justify-center border border-[#001D3D] bg-[#001D3D] text-white hover:bg-[#42A5F5] hover:border-[#42A5F5] transition-colors rounded-none disabled:opacity-30 disabled:cursor-not-allowed`}
              aria-label="Siguiente"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Carousel track */}
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="flex gap-5 overflow-x-auto pb-4 scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {DESTINATIONS.map((d) => (
            <Link
              key={d.name}
              href={`/s/${slug}/destinos/${d.slug}`}
              className="group relative overflow-hidden bg-[#001D3D] shrink-0 block"
              style={{ width: `${CARD_WIDTH}px`, height: "400px" }}
            >
              <div
                className="absolute inset-0 bg-center bg-cover transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${d.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

              <div className="absolute top-4 right-4 z-10">
                <span className="inline-flex items-center px-3 py-1 text-xs font-semibold bg-white/95 text-[#001D3D]">
                  desde {d.fromPrice} €
                </span>
              </div>

              <div className="absolute inset-x-0 bottom-0 p-6 text-white z-10">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-1">
                  {d.region}
                </p>
                <h3
                  className="text-3xl uppercase leading-tight mb-2"
                  style={BEBAS}
                >
                  {d.name}
                </h3>
                <span className="inline-flex items-center text-sm font-medium text-[#42A5F5] group-hover:text-white transition-colors">
                  Ver destino
                  <svg
                    className="ml-1.5 w-4 h-4 transition-transform group-hover:translate-x-1"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
