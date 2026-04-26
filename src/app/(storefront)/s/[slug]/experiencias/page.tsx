"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { ProductCard } from "../_components/ProductCard";
import { CardSkeleton } from "../_components/CardSkeleton";
import React from "react";

const BEBAS: React.CSSProperties = {
  fontFamily: "var(--font-bebas-neue, 'Bebas Neue', cursive)",
};

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
  "Candanchú",
  "Astún",
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
      {/* Hero */}
      <section className="bg-[#001D3D] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
          <h1
            className="text-5xl sm:text-7xl uppercase leading-none max-w-3xl"
            style={BEBAS}
          >
            Encuentra tu experiencia perfecta
          </h1>
          <p className="mt-4 text-white/70 text-lg max-w-2xl">
            Explora nuestro catálogo completo: packs, clases, alquiler, forfaits
            y mucho más.
          </p>
        </div>
      </section>

      <div className="bg-[#F5F7F9] min-h-screen">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
          {/* Filter card — lifted above the hero bottom edge */}
          <div className="bg-white p-4 sm:p-5 mb-8 shadow-sm -mt-12 relative">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_220px_220px] gap-3">
              <div className="relative">
                <SearchIcon />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar experiencias..."
                  className="w-full pl-10 pr-4 h-11 text-sm border border-gray-200 bg-white text-[#001D3D] placeholder-[#757575] focus:outline-none focus:ring-2 focus:ring-[#42A5F5]/30 focus:border-[#42A5F5]"
                />
              </div>
              <select
                value={activeStation}
                onChange={(e) => setActiveStation(e.target.value)}
                className="h-11 px-3 text-sm border border-gray-200 bg-white text-[#001D3D] focus:outline-none focus:ring-2 focus:ring-[#42A5F5]/30 focus:border-[#42A5F5]"
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
                className="h-11 px-3 text-sm border border-gray-200 bg-white text-[#001D3D] focus:outline-none focus:ring-2 focus:ring-[#42A5F5]/30 focus:border-[#42A5F5]"
              >
                <option value="">Todas las categorías</option>
                {filterOptions.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {filterOptions.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setActiveCategory("")}
                  className={`px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    activeCategory === ""
                      ? "bg-[#001D3D] text-white"
                      : "bg-white text-[#757575] border border-gray-200 hover:border-[#001D3D]"
                  }`}
                >
                  Todas
                </button>
                {filterOptions.map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() =>
                      setActiveCategory(
                        activeCategory === cat.slug ? "" : cat.slug
                      )
                    }
                    className={`px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                      activeCategory === cat.slug
                        ? "bg-[#42A5F5] text-white"
                        : "bg-white text-[#757575] border border-gray-200 hover:border-[#42A5F5] hover:text-[#42A5F5]"
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
              <p className="text-sm text-[#757575] mb-5">
                <span className="font-semibold text-[#001D3D]">
                  {filtered.length}
                </span>{" "}
                {filtered.length === 1
                  ? "experiencia disponible"
                  : "experiencias disponibles"}
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
    <div className="bg-white py-20 text-center px-4 shadow-sm">
      <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#001D3D]/10">
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#001D3D"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 18l4.5-7 3.5 4 5-8 5 11z" />
          <circle cx="17" cy="6" r="1.5" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-[#001D3D] mb-2">
        No encontramos experiencias
      </h3>
      <p className="text-[#757575] mb-6 max-w-md mx-auto">
        {hasFilters
          ? "Prueba a quitar algún filtro o buscar otro término."
          : "Vuelve pronto, estamos preparando nuevas experiencias."}
      </p>
      {hasFilters && (
        <button
          onClick={onClear}
          className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-[#42A5F5] hover:bg-[#2196F3] rounded-none transition-colors"
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
      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#757575]"
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
