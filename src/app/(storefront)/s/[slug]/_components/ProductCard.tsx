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

export function ProductCard({
  id,
  name,
  price,
  category,
  description,
}: ProductCardProps) {
  const { addItem } = useCart();

  const handleAdd = () => {
    addItem({ id, type: "product", name, price });
  };

  return (
    <div className="group rounded-xl border border-gray-200 bg-white overflow-hidden transition-shadow hover:shadow-md">
      {/* Image placeholder */}
      <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center">
        <PackageIcon />
      </div>

      <div className="p-4">
        {/* Category badge */}
        <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600 mb-2">
          {CATEGORY_LABELS[category] ?? category}
        </span>

        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">
          {name}
        </h3>

        {description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">{description}</p>
        )}

        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="text-base font-bold text-gray-900">
            {price > 0 ? `desde ${formatEUR(price)}` : "Consultar"}
          </span>
          <button
            onClick={handleAdd}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-[#E87B5A] rounded-lg hover:bg-[#D56E4F] transition-colors"
          >
            Anadir
          </button>
        </div>
      </div>
    </div>
  );
}

function PackageIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#d1d5db"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}
