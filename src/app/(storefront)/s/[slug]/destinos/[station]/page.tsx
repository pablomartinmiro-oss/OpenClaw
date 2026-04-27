import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getStation, getOtherStations } from "../../_components/stations-data";
import { ContactForm } from "./ContactForm";

const BEBAS: CSSProperties = { fontFamily: "var(--font-bebas-neue, 'Bebas Neue', cursive)" };

const EXPERIENCE_CARDS = [
  { title: "Pack Todo Incluido", desc: "Forfait + alquiler + clases en un solo precio cómodo.", price: "desde 189€", categoryParam: "" },
  { title: "Hotel + Forfait", desc: "Alojamiento en las mejores pistas al mejor precio.", price: "desde 139€", categoryParam: "" },
  { title: "Escuela de Esquí", desc: "Monitores certificados para principiantes y avanzados.", price: "desde 89€", categoryParam: "escuela" },
  { title: "Alquiler de Material", desc: "Esquís, botas y casco de última generación.", price: "desde 36€", categoryParam: "alquiler" },
] as const;

type Params = { slug: string; station: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { station } = await params;
  const data = getStation(station);
  if (!data) return {};
  return { title: data.name };
}

export default async function DestinationPage({ params }: { params: Promise<Params> }) {
  const { slug, station } = await params;
  const data = getStation(station);
  if (!data) notFound();

  const others = getOtherStations(station);
  const stationParam = encodeURIComponent(data.name);

  return (
    <>
      {/* ── Hero ── */}
      <section
        className="relative flex items-end"
        style={{ backgroundImage: `url(${data.image})`, backgroundSize: "cover", backgroundPosition: "center", minHeight: "60vh" }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-14">
          <nav className="mb-5 flex items-center gap-2 text-xs text-white/60" aria-label="Breadcrumb">
            <Link href={`/s/${slug}`} className="hover:text-white transition-colors">Inicio</Link>
            <span>/</span>
            <span>Destinos</span>
            <span>/</span>
            <span className="text-white">{data.name}</span>
          </nav>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/70">{data.region}</p>
          <h1 className="text-6xl leading-none text-white uppercase sm:text-8xl" style={BEBAS}>{data.name}</h1>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <div className="bg-[#001D3D] text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px divide-x divide-white/10 px-6 py-0 md:grid-cols-4">
          {[
            { label: "Altitud", value: data.altitude },
            { label: "Km de pistas", value: `${data.kmPistas} km` },
            { label: "Remontes", value: data.remontes },
            { label: "Precio", value: `Desde ${data.fromPrice}€` },
          ].map((stat) => (
            <div key={stat.label} className="py-6 text-center">
              <p className="text-2xl leading-none text-white sm:text-3xl" style={BEBAS}>{stat.value}</p>
              <p className="mt-1.5 text-xs uppercase tracking-wide text-white/50">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Description + Form ── */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-20 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="mb-8 text-4xl text-[#001D3D] uppercase sm:text-5xl" style={BEBAS}>
              Todo sobre {data.name}
            </h2>
            {data.descriptions.map((p, i) => (
              <p key={i} className="mb-5 text-base leading-relaxed text-[#757575]">{p}</p>
            ))}
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-[#F5F7F9] p-6">
              <h3 className="mb-1 text-2xl text-[#001D3D] uppercase" style={BEBAS}>Solicita tu presupuesto</h3>
              <p className="mb-5 text-xs text-[#8A8580]">Recibe tu oferta personalizada para {data.name} sin compromiso.</p>
              <ContactForm slug={slug} stationName={data.name} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Experiences ── */}
      <section className="bg-[#F5F7F9]">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <h2 className="mb-2 text-4xl text-[#001D3D] uppercase sm:text-5xl" style={BEBAS}>
            Experiencias en {data.name}
          </h2>
          <p className="mb-10 text-[#757575]">Todo lo que necesitas para tu viaje en un solo lugar.</p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {EXPERIENCE_CARDS.map((card) => {
              const href = `/s/${slug}/experiencias?station=${stationParam}${card.categoryParam ? `&category=${card.categoryParam}` : ""}`;
              return (
                <Link key={card.title} href={href} className="group flex flex-col bg-white p-6 transition-shadow hover:shadow-md">
                  <h3 className="mb-2 text-xl text-[#001D3D] uppercase" style={BEBAS}>{card.title}</h3>
                  <p className="mb-4 flex-1 text-sm leading-relaxed text-[#757575]">{card.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-[#F27A0B]" style={BEBAS}>{card.price}</span>
                    <span className="inline-flex items-center bg-[#42A5F5] px-4 py-2 text-xs font-bold text-white uppercase group-hover:bg-[#2196F3] transition-colors" style={BEBAS}>
                      Ver más
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Why choose ── */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <h2 className="mb-12 text-4xl text-[#001D3D] uppercase sm:text-5xl" style={BEBAS}>
            ¿Por qué elegir {data.name}?
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <FeatureCard
              icon={<SnowIcon />}
              title="Calidad de nieve"
              description={data.snowQuality}
            />
            <FeatureCard
              icon={<TransportIcon />}
              title="Acceso y ubicación"
              description={data.access}
            />
            <FeatureCard
              icon={<ApreskiIcon />}
              title="Après-ski y servicios"
              description={data.apreski}
            />
          </div>
        </div>
      </section>

      {/* ── Other destinations ── */}
      <section className="bg-[#001D3D]">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <h2 className="mb-2 text-4xl text-white uppercase sm:text-5xl" style={BEBAS}>Otros destinos</h2>
          <p className="mb-10 text-white/60">Descubre más estaciones en nuestro catálogo.</p>
          <div className="flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: "none" }}>
            {others.map((s) => (
              <Link
                key={s.slug}
                href={`/s/${slug}/destinos/${s.slug}`}
                className="group relative shrink-0 overflow-hidden"
                style={{ width: 220, height: 280 }}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: `url(${s.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <p className="text-xs text-white/60 mb-0.5">{s.region}</p>
                  <p className="text-xl uppercase leading-tight" style={BEBAS}>{s.name}</p>
                  <p className="mt-1 text-xs text-[#42A5F5] group-hover:text-white transition-colors">
                    Desde {s.fromPrice}€
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section className="bg-[#42A5F5]">
        <div className="mx-auto max-w-7xl px-6 py-16 text-center">
          <h2 className="mb-4 text-4xl text-white uppercase sm:text-6xl" style={BEBAS}>
            ¿Listo para tu viaje a {data.name}?
          </h2>
          <p className="mb-8 text-white/80">Reserva ahora y paga solo el 25% por adelantado.</p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={`/s/${slug}/presupuesto`}
              className="inline-flex items-center bg-[#001D3D] px-8 py-4 text-sm font-bold text-white uppercase tracking-wide hover:bg-black transition-colors"
              style={BEBAS}
            >
              Solicitar presupuesto
            </Link>
            <a
              href="https://wa.me/34919041947"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-[#2DB742] px-8 py-4 text-sm font-bold text-white uppercase tracking-wide hover:bg-[#25C039] transition-colors"
              style={BEBAS}
            >
              <WhatsAppIcon />
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-start gap-4 border border-[#E8E4DE] p-6">
      <div className="flex h-12 w-12 items-center justify-center bg-[#001D3D]/5 text-[#001D3D]">{icon}</div>
      <h3 className="text-xl text-[#001D3D] uppercase" style={BEBAS}>{title}</h3>
      <p className="text-sm leading-relaxed text-[#757575]">{description}</p>
    </div>
  );
}

function SnowIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="2" x2="12" y2="22" /><line x1="2" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /><line x1="19.07" y1="4.93" x2="4.93" y2="19.07" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function TransportIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function ApreskiIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 22H6a2 2 0 01-2-2v-7l4-9h8l4 9v7a2 2 0 01-2 2h-2" /><line x1="12" y1="11" x2="12" y2="22" />
      <path d="M9 13h6" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.5 14.4c-.3-.1-1.7-.8-2-1-.3-.1-.5-.1-.7.1-.2.3-.7 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.2-.4-2.3-1.4-.8-.7-1.4-1.7-1.6-2-.2-.3 0-.4.1-.6.1-.1.3-.3.4-.5.1-.1.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.3 5.2 4.6.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3zM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.4c1.4.8 3.1 1.2 4.8 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2z" />
    </svg>
  );
}
