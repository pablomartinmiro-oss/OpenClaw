import Image from "next/image";
import React from "react";

const BEBAS: React.CSSProperties = {
  fontFamily: "var(--font-bebas-neue, 'Bebas Neue', cursive)",
};

const IMAGE_LOGOS = [
  { src: "/Logo_Astun-300x78.png", alt: "Astún", width: 120, height: 31 },
  { src: "/candanchu-1-300x50.png", alt: "Candanchú", width: 120, height: 20 },
];

const TEXT_LOGOS = [
  "Baqueira Beret",
  "Sierra Nevada",
  "Formigal",
  "Alto Campoo",
  "La Pinilla",
];

export function PartnerLogos() {
  return (
    <section className="bg-[#F5F7F9] border-y border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <p className="text-center text-[11px] font-semibold uppercase tracking-widest text-[#757575] mb-7">
          Estaciones colaboradoras
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
          {IMAGE_LOGOS.map((logo) => (
            <div
              key={logo.alt}
              className="flex h-10 items-center justify-center grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
            >
              <Image
                src={logo.src}
                alt={logo.alt}
                width={logo.width}
                height={logo.height}
                style={{ height: logo.height, width: "auto" }}
                className="object-contain"
              />
            </div>
          ))}
          {TEXT_LOGOS.map((name) => (
            <div
              key={name}
              className="flex h-10 items-center justify-center opacity-50 hover:opacity-90 transition-opacity duration-300"
            >
              <span
                className="text-lg text-[#001D3D] tracking-wide whitespace-nowrap"
                style={BEBAS}
              >
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
