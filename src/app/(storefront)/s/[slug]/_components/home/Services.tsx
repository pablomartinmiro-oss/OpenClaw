"use client";

import Link from "next/link";

interface Service {
  title: string;
  desc: string;
  category?: string;
  icon: React.ReactNode;
}

const SERVICES: Service[] = [
  {
    title: "Packs Todo Incluido",
    desc: "Hotel + forfait + clases + alquiler. Sin sorpresas.",
    category: "pack",
    icon: <PackIcon />,
  },
  {
    title: "Hotel + Forfait",
    desc: "Alojamiento y remontes en una sola reserva.",
    category: "forfait",
    icon: <BedIcon />,
  },
  {
    title: "Escuela de Esqui",
    desc: "Clases para todos los niveles, en grupo o privadas.",
    category: "escuela",
    icon: <SchoolIcon />,
  },
  {
    title: "Alquiler de Material",
    desc: "Esquis, snowboard, botas y cascos de calidad.",
    category: "alquiler",
    icon: <SkiIcon />,
  },
  {
    title: "Forfaits",
    desc: "Tu pase de remontes al mejor precio.",
    category: "forfait",
    icon: <TicketIcon />,
  },
  {
    title: "Apres-Ski",
    desc: "Cenas, copas y ambiente despues de la pista.",
    category: "apreski",
    icon: <DrinkIcon />,
  },
  {
    title: "Taquillas",
    desc: "Guarda tu material en pistas con total seguridad.",
    category: "locker",
    icon: <LockerIcon />,
  },
];

export function Services({ slug }: { slug: string }) {
  return (
    <section id="servicios" className="bg-white border-t border-[#E8E4DE]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-28">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#E87B5A] mb-3">
            Servicios
          </p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#2D2A26]">
            Todo lo que necesitas para tu viaje
          </h2>
          <p className="mt-4 text-[#8A8580] text-lg">
            Diseñamos cada detalle para que solo te preocupes de disfrutar.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SERVICES.map((s) => (
            <Link
              key={s.title}
              href={`/s/${slug}/experiencias${s.category ? `?category=${s.category}` : ""}`}
              className="group rounded-2xl border border-[#E8E4DE] bg-[#FAF9F7] p-6 hover:border-[#E87B5A] hover:bg-white hover:shadow-lg transition-all"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E87B5A]/10 text-[#E87B5A] group-hover:bg-[#E87B5A] group-hover:text-white transition-colors">
                {s.icon}
              </div>
              <h3 className="mt-5 text-lg font-bold text-[#2D2A26]">
                {s.title}
              </h3>
              <p className="mt-1.5 text-sm text-[#8A8580] leading-relaxed">
                {s.desc}
              </p>
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
      desc: "Hotel, forfait, clases, alquiler y apres-ski. Tu eliges, nosotros lo organizamos.",
    },
    {
      n: "03",
      title: "Reserva y disfruta",
      desc: "Paga solo el 25% para reservar. El resto, antes del viaje. Sin estres.",
    },
  ];

  return (
    <section className="bg-[#FAF9F7] border-t border-[#E8E4DE]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-28">
        <div className="max-w-2xl mb-14">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#E87B5A] mb-3">
            Como funciona
          </p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#2D2A26]">
            Reserva en 3 pasos
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div
              key={s.n}
              className="relative rounded-2xl bg-white border border-[#E8E4DE] p-8 hover:shadow-md transition-shadow"
            >
              <div className="text-5xl font-bold text-[#E87B5A]/20 mb-2">
                {s.n}
              </div>
              <h3 className="text-xl font-bold text-[#2D2A26] mb-2">
                {s.title}
              </h3>
              <p className="text-[#8A8580] leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href={`/s/${slug}/presupuesto`}
            className="inline-flex items-center px-7 py-3.5 text-base font-semibold text-white bg-[#E87B5A] hover:bg-[#D56E4F] rounded-xl shadow-sm transition-colors"
          >
            Empezar mi reserva
          </Link>
        </div>
      </div>
    </section>
  );
}

function PackIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

function BedIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4v16M22 4v16M2 12h20M2 20h20M6 12V8a2 2 0 012-2h8a2 2 0 012 2v4" />
    </svg>
  );
}

function SchoolIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  );
}

function SkiIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18l18-12M5 20l14-9" />
      <circle cx="6" cy="19" r="1" />
      <circle cx="18" cy="6" r="1" />
    </svg>
  );
}

function TicketIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7a2 2 0 012-2h14a2 2 0 012 2v3a2 2 0 000 4v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a2 2 0 000-4V7z" />
      <path d="M9 5v14" strokeDasharray="2 2" />
    </svg>
  );
}

function DrinkIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3h18l-2 9a4 4 0 01-4 3h-6a4 4 0 01-4-3L3 3z" />
      <path d="M12 15v6M8 21h8" />
    </svg>
  );
}

function LockerIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M9 12h.01M9 8h.01" />
      <path d="M14 8h2M14 12h2" />
    </svg>
  );
}
