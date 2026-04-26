"use client";

import Link from "next/link";
import React from "react";

const BEBAS: React.CSSProperties = {
  fontFamily: "var(--font-bebas-neue, 'Bebas Neue', cursive)",
};

interface Offer {
  station: string;
  title: string;
  desc: string;
  price: number;
  image: string;
  category: string;
}

const OFFERS: Offer[] = [
  {
    station: "Baqueira Beret",
    title: "Pack Todo Incluido 3 días",
    desc: "Hotel 4*, forfait, alquiler de material y clases en grupo incluidas.",
    price: 299,
    image:
      "https://images.unsplash.com/photo-1517299321609-52687d1bc55a?auto=format&fit=crop&w=800&q=80",
    category: "pack",
  },
  {
    station: "Sierra Nevada",
    title: "Hotel + Forfait 4 días",
    desc: "Alojamiento en hotel 3* con forfait de temporada incluido.",
    price: 189,
    image:
      "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=800&q=80",
    category: "forfait",
  },
  {
    station: "Formigal",
    title: "Pack Familia 5 días",
    desc: "Paquete especial para familias: hotel, forfait familiar y clases para niños.",
    price: 249,
    image:
      "https://images.unsplash.com/photo-1486648791255-7b327fa1c1d4?auto=format&fit=crop&w=800&q=80",
    category: "pack",
  },
  {
    station: "La Pinilla",
    title: "Pack Fin de Semana",
    desc: "Escapada de 2 días con forfait y alquiler de equipo completo.",
    price: 129,
    image:
      "https://images.unsplash.com/photo-1454942901704-3c44c11b2ad1?auto=format&fit=crop&w=800&q=80",
    category: "pack",
  },
];

export function Offers({ slug }: { slug: string }) {
  return (
    <section className="bg-[#F5F7F9]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-28">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <h2
              className="text-5xl sm:text-6xl text-[#001D3D] uppercase"
              style={BEBAS}
            >
              Ofertas
            </h2>
            <p className="mt-2 text-[#757575] text-base max-w-xl">
              Las mejores propuestas de la temporada al mejor precio garantizado.
            </p>
          </div>
          <Link
            href={`/s/${slug}/experiencias`}
            className="inline-flex items-center px-6 py-3 text-sm font-semibold text-white bg-[#42A5F5] hover:bg-[#2196F3] transition-colors rounded-none shrink-0"
            style={BEBAS}
          >
            VER TODAS LAS OFERTAS
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {OFFERS.map((offer) => (
            <div
              key={offer.title}
              className="bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <div
                className="h-48 bg-center bg-cover relative"
                style={{ backgroundImage: `url(${offer.image})` }}
              >
                <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-semibold bg-[#001D3D] text-white uppercase tracking-wide">
                  {offer.station}
                </span>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-base font-bold text-[#001D3D] mb-1">
                  {offer.title}
                </h3>
                <p className="text-sm text-[#757575] leading-relaxed flex-1 mb-4">
                  {offer.desc}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <div>
                    <div className="text-xs text-[#757575] uppercase tracking-wide">
                      Desde
                    </div>
                    <div
                      className="text-2xl text-[#F27A0B]"
                      style={BEBAS}
                    >
                      {offer.price} €
                    </div>
                  </div>
                  <Link
                    href={`/s/${slug}/presupuesto`}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#42A5F5] hover:bg-[#2196F3] transition-colors rounded-none"
                    style={BEBAS}
                  >
                    VER OFERTA
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
