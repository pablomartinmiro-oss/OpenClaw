"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { ProductCard } from "../_components/ProductCard";
import { CardSkeleton } from "../_components/CardSkeleton";

interface Product {
  id: string;
  name: string;
  category: string;
  station: string;
  description: string | null;
  price: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
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

const STATIONS = [
  "Baqueira Beret",
  "Sierra Nevada",
  "Formigal",
  "Alto Campoo",
  "Candanchu",
  "Astun",
  "La Pinilla",
];

export default function ExperienciasPage() {
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") ?? "";
  const initialStation = searchParams.get("station") ?? "";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [activeStation, setActiveStation] = useState(initialStation);

  useEffect(() => {
    const base = `/api/storefront/public/${slug}`;
    Promise.all([
      fetch(`${base}/products?limit=100`).then((r) => r.json()),
      fetch(`${base}/categories`).then((r) => r.json()),
    ])
      .then(([prodData, catData]) => {
        setProducts(prodData.products ?? []);
        setCategories(catData.categories ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const productCategories = useMemo(() => {
    const catSlugs = new Set(products.map((p) => p.category));
    return Array.from(catSlugs).sort();
  }, [products]);

  const filterOptions =
    categories.length > 0
      ? categories.map((c) => ({ slug: c.slug, label: c.name }))
      : productCategories.map((c) => ({
          slug: c,
          label: CATEGORY_LABELS[c] ?? c,
        }));

  const filtered = useMemo(() => {
    let list = products;
    if (activeCategory) {
      list = list.filter((p) => p.category === activeCategory);
    }
    if (activeStation) {
      list = list.filter(
        (p) =>
          (p.station ?? "").toLowerCase().includes(activeStation.toLowerCase())
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [products, activeCategory, activeStation, search]);

  const hasFilters = activeCategory || activeStation || search;

  return (
    <>
      <section className="bg-gradient-to-br from-[#0F1A2B] to-[#1A2842] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 sm:py-20">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#F2A98F] mb-3">
            Experiencias
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">
            Encuentra tu experiencia perfecta
          </h1>
          <p className="mt-4 text-white/70 text-lg max-w-2xl">
            Explora nuestro catalogo completo: packs, clases, alquiler,
            forfaits y mucho mas.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="rounded-2xl bg-white border border-[#E8E4DE] p-4 sm:p-5 mb-8 shadow-sm -mt-12 relative">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_220px_220px] gap-3">
            <div className="relative">
              <SearchIcon />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar experiencias..."
                className="w-full pl-10 pr-4 h-11 text-sm border border-[#E8E4DE] rounded-lg bg-white text-[#2D2A26] placeholder-[#8A8580] focus:outline-none focus:ring-2 focus:ring-[#E87B5A]/30 focus:border-[#E87B5A]"
              />
            </div>
            <select
              value={activeStation}
              onChange={(e) => setActiveStation(e.target.value)}
              className="h-11 px-3 text-sm border border-[#E8E4DE] rounded-lg bg-white text-[#2D2A26] focus:outline-none focus:ring-2 focus:ring-[#E87B5A]/30 focus:border-[#E87B5A]"
            >
              <option value="">Todas las estaciones</option>
              {STATIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className="h-11 px-3 text-sm border border-[#E8E4DE] rounded-lg bg-white text-[#2D2A26] focus:outline-none focus:ring-2 focus:ring-[#E87B5A]/30 focus:border-[#E87B5A]"
            >
              <option value="">Todas las categorias</option>
              {filterOptions.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {filterOptions.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 pt-4 border-t border-[#E8E4DE]">
              <button
                onClick={() => setActiveCategory("")}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
                  activeCategory === ""
                    ? "bg-[#2D2A26] text-white border-[#2D2A26]"
                    : "bg-white text-[#8A8580] border-[#E8E4DE] hover:border-[#2D2A26]"
                }`}
              >
                Todas
              </button>
              {filterOptions.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() =>
                    setActiveCategory(activeCategory === cat.slug ? "" : cat.slug)
                  }
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
                    activeCategory === cat.slug
                      ? "bg-[#E87B5A] text-white border-[#E87B5A]"
                      : "bg-white text-[#8A8580] border-[#E8E4DE] hover:border-[#E87B5A] hover:text-[#E87B5A]"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <CardSkeleton count={8} />
        ) : filtered.length === 0 ? (
          <EmptyState
            hasFilters={!!hasFilters}
            onClear={() => {
              setSearch("");
              setActiveCategory("");
              setActiveStation("");
            }}
          />
        ) : (
          <>
            <p className="text-sm text-[#8A8580] mb-5">
              <span className="font-semibold text-[#2D2A26]">
                {filtered.length}
              </span>{" "}
              {filtered.length === 1 ? "experiencia disponible" : "experiencias disponibles"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  price={p.price}
                  category={p.category}
                  description={p.description}
                  station={p.station}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

function EmptyState({
  hasFilters,
  onClear,
}: {
  hasFilters: boolean;
  onClear: () => void;
}) {
  return (
    <div className="rounded-2xl border border-[#E8E4DE] bg-white py-20 text-center px-4">
      <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#E87B5A]/10">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#E87B5A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 18l4.5-7 3.5 4 5-8 5 11z" />
          <circle cx="17" cy="6" r="1.5" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-[#2D2A26] mb-2">
        No encontramos experiencias
      </h3>
      <p className="text-[#8A8580] mb-6 max-w-md mx-auto">
        {hasFilters
          ? "Prueba a quitar algun filtro o buscar otro termino."
          : "Vuelve pronto, estamos preparando nuevas experiencias."}
      </p>
      {hasFilters && (
        <button
          onClick={onClear}
          className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-[#E87B5A] hover:bg-[#D56E4F] rounded-lg transition-colors"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8580]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}
