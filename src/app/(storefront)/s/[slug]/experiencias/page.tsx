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

export default function ExperienciasPage() {
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") ?? "";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(initialCategory);

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
      .catch(() => {
        // silent
      })
      .finally(() => setLoading(false));
  }, [slug]);

  // Derive unique product categories (fallback if no Category records)
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
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [products, activeCategory, search]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Experiencias
        </h1>
        <p className="text-gray-500">
          Encuentra la actividad perfecta para tu aventura.
        </p>
      </div>

      {/* Search bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <SearchIcon />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar experiencias..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E87B5A]/30 focus:border-[#E87B5A]"
          />
        </div>
      </div>

      {/* Category tabs */}
      {filterOptions.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory("")}
            className={`px-4 py-2 text-sm font-medium rounded-full border transition-colors ${
              activeCategory === ""
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
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
              className={`px-4 py-2 text-sm font-medium rounded-full border transition-colors ${
                activeCategory === cat.slug
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Products grid */}
      {loading ? (
        <CardSkeleton count={8} />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">No se encontraron experiencias.</p>
          {(search || activeCategory) && (
            <button
              onClick={() => {
                setSearch("");
                setActiveCategory("");
              }}
              className="mt-3 text-sm font-medium text-[#E87B5A] hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            {filtered.length}{" "}
            {filtered.length === 1 ? "experiencia" : "experiencias"}
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
  );
}

function SearchIcon() {
  return (
    <svg
      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
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
