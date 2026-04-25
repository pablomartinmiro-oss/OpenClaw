"use client";

import { useCart } from "./CartContext";
import { formatEUR } from "./utils";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string | null;
  station?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  alquiler: "Alquiler",
  locker: "Taquillas",
  escuela: "Escuela",
  clase_particular: "Clase particular",
  forfait: "Forfait",
  menu: "Menu",
  snowcamp: "Snow Camp",
  apreski: "Apres-ski",
  taxi: "Taxi",
  pack: "Pack",
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  alquiler: "from-[#3B5998] to-[#1E3A5F]",
  locker: "from-[#5B6E8C] to-[#2C3E50]",
  escuela: "from-[#5B8C6D] to-[#2D5C42]",
  clase_particular: "from-[#5B8C6D] to-[#2D5C42]",
  forfait: "from-[#0F1A2B] to-[#1A2842]",
  menu: "from-[#D4A853] to-[#9A7A2E]",
  snowcamp: "from-[#3B7CC4] to-[#1E4F87]",
  apreski: "from-[#E87B5A] to-[#B5503A]",
  taxi: "from-[#5B6E8C] to-[#2C3E50]",
  pack: "from-[#0F1A2B] to-[#3B5998]",
};

export function ProductCard({
  id,
  name,
  price,
  category,
  description,
  station,
}: ProductCardProps) {
  const { addItem } = useCart();
  const gradient = CATEGORY_GRADIENTS[category] ?? "from-[#0F1A2B] to-[#1A2842]";

  const handleAdd = () => {
    addItem({ id, type: "product", name, price });
  };

  return (
    <div className="group rounded-2xl border border-[#E8E4DE] bg-white overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 flex flex-col">
      <div
        className={`relative aspect-[4/3] bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}
      >
        <div className="absolute inset-0 opacity-20">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="w-full h-full"
          >
            <path
              d="M0,80 L20,40 L40,60 L60,30 L80,55 L100,20 L100,100 L0,100 Z"
              fill="white"
            />
          </svg>
        </div>
        <CategoryGlyph category={category} />
        {station && (
          <span className="absolute bottom-3 left-3 inline-flex items-center px-2.5 py-1 text-[11px] font-semibold rounded-full bg-white/90 backdrop-blur text-[#2D2A26]">
            {station}
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <span className="inline-block self-start px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-[#E87B5A]/10 text-[#E87B5A] mb-2">
          {CATEGORY_LABELS[category] ?? category}
        </span>

        <h3 className="text-base font-bold text-[#2D2A26] line-clamp-2 mb-1">
          {name}
        </h3>

        {description && (
          <p className="text-sm text-[#8A8580] line-clamp-2 mb-3">
            {description}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#E8E4DE]">
          <div>
            <div className="text-[10px] text-[#8A8580] uppercase tracking-wider">
              {price > 0 ? "Desde" : ""}
            </div>
            <div className="text-lg font-bold text-[#2D2A26]">
              {price > 0 ? formatEUR(price) : "Consultar"}
            </div>
          </div>
          <button
            onClick={handleAdd}
            className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-[#E87B5A] rounded-lg hover:bg-[#D56E4F] transition-colors"
          >
            Anadir
          </button>
        </div>
      </div>
    </div>
  );
}

function CategoryGlyph({ category }: { category: string }) {
  const common = {
    width: "60",
    height: "60",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "white",
    strokeWidth: "1.4",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className:
      "relative z-10 opacity-80 transition-transform duration-500 group-hover:scale-110",
  };
  if (category === "alquiler") {
    return (
      <svg {...common}>
        <path d="M3 18l18-12M5 20l14-9" />
        <circle cx="6" cy="19" r="1" />
        <circle cx="18" cy="6" r="1" />
      </svg>
    );
  }
  if (category === "forfait") {
    return (
      <svg {...common}>
        <path d="M3 7a2 2 0 012-2h14a2 2 0 012 2v3a2 2 0 000 4v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a2 2 0 000-4V7z" />
      </svg>
    );
  }
  if (category === "escuela" || category === "clase_particular") {
    return (
      <svg {...common}>
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    );
  }
  if (category === "apreski") {
    return (
      <svg {...common}>
        <path d="M3 3h18l-2 9a4 4 0 01-4 3h-6a4 4 0 01-4-3L3 3z" />
        <path d="M12 15v6M8 21h8" />
      </svg>
    );
  }
  if (category === "menu") {
    return (
      <svg {...common}>
        <path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3" />
      </svg>
    );
  }
  if (category === "locker") {
    return (
      <svg {...common}>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M9 12h.01M9 8h.01" />
      </svg>
    );
  }
  if (category === "snowcamp") {
    return (
      <svg {...common}>
        <path d="M3 21l9-16 9 16H3z" />
        <path d="M9 21v-4M15 21v-4" />
      </svg>
    );
  }
  if (category === "taxi") {
    return (
      <svg {...common}>
        <path d="M5 17H3v-5l1.5-4h15L21 12v5h-2" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
      </svg>
    );
  }
  if (category === "pack") {
    return (
      <svg {...common}>
        <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M3 20l4.5-7 3.5 4 5-8 5 11z" />
      <circle cx="17" cy="6" r="1.5" />
    </svg>
  );
}
