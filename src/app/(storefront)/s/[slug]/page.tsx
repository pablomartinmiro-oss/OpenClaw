"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ProductCard } from "./_components/ProductCard";
import { CardSkeleton } from "./_components/CardSkeleton";

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
  image: string | null;
}

const CATEGORY_ICONS: Record<string, string> = {
  alquiler: "M",
  escuela: "E",
  forfait: "F",
  snowcamp: "S",
  apreski: "A",
  locker: "L",
  taxi: "T",
  pack: "P",
  menu: "R",
  clase_particular: "C",
};

export default function StorefrontHome() {
  const { slug } = useParams<{ slug: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const base = `/api/storefront/public/${slug}`;
    Promise.all([
      fetch(`${base}/products?limit=8`).then((r) => r.json()),
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

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-28 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">
            Descubre nuestras experiencias
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Reserva actividades, hotel, spa y restaurante en un solo lugar.
          </p>
          <Link
            href={`/s/${slug}/experiencias`}
            className="inline-flex items-center px-6 py-3 text-base font-semibold text-white bg-[#E87B5A] rounded-lg hover:bg-[#D56E4F] transition-colors"
          >
            Explorar experiencias
            <ArrowRight />
          </Link>
        </div>
      </section>

      {/* Categories */}
      {!loading && categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Categorias</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/s/${slug}/experiencias?category=${cat.slug}`}
                className="group rounded-xl border border-gray-200 bg-white p-5 text-center hover:shadow-md transition-shadow"
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-[#E87B5A] text-lg font-bold group-hover:bg-orange-100 transition-colors">
                  {CATEGORY_ICONS[cat.slug] ?? cat.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Productos destacados
          </h2>
          <Link
            href={`/s/${slug}/experiencias`}
            className="text-sm font-medium text-[#E87B5A] hover:underline"
          >
            Ver todos
          </Link>
        </div>

        {loading ? (
          <CardSkeleton count={8} />
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg">No hay productos disponibles todavia.</p>
            <p className="text-sm mt-1">Vuelve pronto para ver nuestras experiencias.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((p) => (
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
        )}
      </section>

      {/* Services strip */}
      <section className="bg-gray-50 border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <ServiceCard
              icon={<HotelIcon />}
              title="Hotel"
              desc="Habitaciones con las mejores vistas"
              href={`/s/${slug}/hotel`}
            />
            <ServiceCard
              icon={<SpaIcon />}
              title="Spa & Bienestar"
              desc="Tratamientos para relajarte"
              href={`/s/${slug}/spa`}
            />
            <ServiceCard
              icon={<RestaurantIcon />}
              title="Restaurante"
              desc="Gastronomia de montana"
              href={`/s/${slug}/restaurante`}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function ServiceCard({
  icon,
  title,
  desc,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl bg-white border border-gray-200 p-6 hover:shadow-md transition-shadow"
    >
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 text-[#E87B5A] group-hover:bg-orange-100 transition-colors">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{desc}</p>
    </Link>
  );
}

function ArrowRight() {
  return (
    <svg className="ml-2 w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function HotelIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18M3 7v14M21 7v14M6 11h4M14 11h4M6 15h4M14 15h4M10 21V7a2 2 0 012-2h0a2 2 0 012 2v14" />
    </svg>
  );
}

function SpaIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22c-4.97 0-9-2.24-9-5v-.09c1.523.07 3.037-.092 4.5-.5C9.622 15.61 11.4 14 12 12c.6 2 2.378 3.61 4.5 4.41 1.463.408 2.977.57 4.5.5V17c0 2.76-4.03 5-9 5z" />
      <path d="M12 12V2" />
      <path d="M8 5.14C9.37 4.38 10.7 4 12 4s2.63.38 4 1.14" />
    </svg>
  );
}

function RestaurantIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3" />
    </svg>
  );
}
