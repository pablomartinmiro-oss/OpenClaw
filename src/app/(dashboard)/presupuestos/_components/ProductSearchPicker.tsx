"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import type { Product } from "@/hooks/useProducts";

interface Props {
  products: Product[];
  excludeIds: Set<string>;
  onSelect: (product: Product) => void;
  onClose: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  forfait: "Forfaits",
  alquiler: "Alquiler material",
  clase_particular: "Clases particulares",
  escuela: "Cursillos colectivos",
  alojamiento: "Alojamiento",
  pack: "Packs",
  apreski: "Après-ski",
  snowcamp: "SnowCamp",
  taxi: "Taxi / Transfer",
  menu: "Menú",
  locker: "Taquillas",
};

const CATEGORY_ORDER = [
  "forfait", "alquiler", "clase_particular", "escuela",
  "alojamiento", "pack", "apreski", "snowcamp", "taxi", "menu", "locker",
];

export function ProductSearchPicker({ products, excludeIds, onSelect, onClose }: Props) {
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filtered = useMemo(() => {
    const available = products.filter((p) => p.isActive && !excludeIds.has(p.id));
    if (!search.trim()) return available;
    const terms = search.toLowerCase().split(/\s+/);
    return available.filter((p) => {
      const text = `${p.name} ${p.category} ${p.station}`.toLowerCase();
      return terms.every((t) => text.includes(t));
    });
  }, [products, excludeIds, search]);

  const grouped = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const p of filtered) {
      const cat = p.category || "otro";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(p);
    }
    // Sort by predefined order
    const sorted = new Map<string, Product[]>();
    for (const cat of CATEGORY_ORDER) {
      if (map.has(cat)) sorted.set(cat, map.get(cat)!);
    }
    // Add any remaining categories
    for (const [cat, prods] of map) {
      if (!sorted.has(cat)) sorted.set(cat, prods);
    }
    return sorted;
  }, [filtered]);

  return (
    <div className="mb-3 rounded-xl border border-border bg-white shadow-lg overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <Search className="h-4 w-4 text-text-secondary" />
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar producto... (ej: forfait 2 días)"
          className="flex-1 bg-transparent text-sm placeholder:text-text-secondary focus:outline-none"
        />
        <button onClick={onClose} className="rounded p-0.5 hover:bg-surface transition-colors">
          <X className="h-4 w-4 text-text-secondary" />
        </button>
      </div>
      <div className="max-h-64 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-text-secondary">
            No se encontraron productos
          </div>
        ) : (
          Array.from(grouped.entries()).map(([cat, prods]) => (
            <div key={cat}>
              <div className="sticky top-0 bg-surface/80 backdrop-blur-sm px-4 py-1.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                {CATEGORY_LABELS[cat] ?? cat}
              </div>
              {prods.map((product) => (
                <button
                  key={product.id}
                  onClick={() => onSelect(product)}
                  className="flex w-full items-center justify-between px-4 py-2 text-sm hover:bg-coral-light/30 transition-colors"
                >
                  <div>
                    <span className="text-text-primary">{product.name}</span>
                    {product.station !== "all" && (
                      <span className="ml-2 text-xs text-text-secondary">({product.station})</span>
                    )}
                  </div>
                  <span className="text-text-secondary font-medium">
                    {product.price.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
                  </span>
                </button>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
