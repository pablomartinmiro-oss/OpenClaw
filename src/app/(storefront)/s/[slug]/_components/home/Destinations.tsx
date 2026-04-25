"use client";

import Link from "next/link";

interface Destination {
  name: string;
  region: string;
  fromPrice: number;
  image: string;
}

const DESTINATIONS: Destination[] = [
  {
    name: "Baqueira Beret",
    region: "Pirineo de Lleida",
    fromPrice: 189,
    image:
      "https://images.unsplash.com/photo-1517299321609-52687d1bc55a?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Sierra Nevada",
    region: "Granada",
    fromPrice: 149,
    image:
      "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Formigal",
    region: "Pirineo de Huesca",
    fromPrice: 169,
    image:
      "https://images.unsplash.com/photo-1486648791255-7b327fa1c1d4?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Alto Campoo",
    region: "Cantabria",
    fromPrice: 129,
    image:
      "https://images.unsplash.com/photo-1548777123-e216912df7d8?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Candanchu",
    region: "Pirineo de Huesca",
    fromPrice: 139,
    image:
      "https://images.unsplash.com/photo-1502301197179-65228ab57f78?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Astun",
    region: "Pirineo de Huesca",
    fromPrice: 139,
    image:
      "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "La Pinilla",
    region: "Segovia",
    fromPrice: 89,
    image:
      "https://images.unsplash.com/photo-1454942901704-3c44c11b2ad1?auto=format&fit=crop&w=1200&q=80",
  },
];

export function Destinations({ slug }: { slug: string }) {
  return (
    <section id="destinos" className="bg-[#FAF9F7]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-28">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#E87B5A] mb-3">
              Destinos
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#2D2A26] max-w-2xl">
              Las mejores estaciones de Espana
            </h2>
          </div>
          <p className="text-[#8A8580] max-w-md text-base">
            Trabajamos con las 7 estaciones mas importantes del pais. Elige tu
            favorita y nosotros nos ocupamos del resto.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {DESTINATIONS.map((d, i) => (
            <Link
              key={d.name}
              href={`/s/${slug}/experiencias?station=${encodeURIComponent(d.name)}`}
              className={`group relative overflow-hidden rounded-2xl bg-[#0F1A2B] aspect-[4/5] block transition-transform hover:-translate-y-1 ${
                i === 0 ? "lg:row-span-2 lg:aspect-auto" : ""
              }`}
            >
              <div
                className="absolute inset-0 bg-center bg-cover transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${d.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

              <div className="absolute top-4 right-4 z-10">
                <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-white/95 text-[#2D2A26] shadow-sm">
                  desde {d.fromPrice} EUR
                </span>
              </div>

              <div className="absolute inset-x-0 bottom-0 p-6 text-white z-10">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-1">
                  {d.region}
                </p>
                <h3 className="text-2xl sm:text-3xl font-bold mb-2">
                  {d.name}
                </h3>
                <span className="inline-flex items-center text-sm font-medium text-[#F2A98F] group-hover:text-white transition-colors">
                  Ver experiencias
                  <svg className="ml-1.5 w-4 h-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
