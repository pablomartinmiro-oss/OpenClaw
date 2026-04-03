"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "../_components/CartContext";
import { formatEUR } from "../_components/utils";

interface SpaTreatment {
  id: string;
  title: string;
  slug: string;
  duration: number;
  price: number;
  description: string | null;
  images: string[];
  capacity: number;
}

interface SpaCategory {
  id: string;
  name: string;
  slug: string;
  treatments: SpaTreatment[];
}

export default function SpaPage() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();
  const [categories, setCategories] = useState<SpaCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/storefront/public/${slug}/spa`)
      .then((r) => r.json())
      .then((data) => setCategories(data.categories ?? []))
      .catch(() => {
        // silent
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleBook = (treatment: SpaTreatment) => {
    addItem({
      id: `spa-${treatment.id}`,
      type: "spa",
      name: treatment.title,
      price: treatment.price,
    });
  };

  const totalTreatments = categories.reduce(
    (sum, cat) => sum + cat.treatments.length,
    0
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Spa & Bienestar
        </h1>
        <p className="text-gray-500">
          Relajate con nuestros tratamientos exclusivos.
        </p>
      </div>

      {loading ? (
        <TreatmentSkeleton />
      ) : totalTreatments === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-10">
          {categories
            .filter((cat) => cat.treatments.length > 0)
            .map((cat) => (
              <section key={cat.id}>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {cat.name}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {cat.treatments.map((t) => (
                    <div
                      key={t.id}
                      className="rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-shadow"
                    >
                      {/* Image placeholder */}
                      <div className="aspect-[16/10] bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
                        <LeafIcon />
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-1">
                          {t.title}
                        </h3>
                        {t.description && (
                          <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                            {t.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <ClockIcon /> {t.duration} min
                          </span>
                          {t.capacity > 1 && (
                            <span className="flex items-center gap-1">
                              <PersonIcon /> Hasta {t.capacity} personas
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-gray-900">
                            {formatEUR(t.price)}
                          </span>
                          <button
                            onClick={() => handleBook(t)}
                            className="px-4 py-2 text-xs font-semibold text-white bg-[#E87B5A] rounded-lg hover:bg-[#D56E4F] transition-colors"
                          >
                            Reservar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16 text-gray-500">
      <LeafIcon large />
      <p className="text-lg mt-4">No hay tratamientos disponibles.</p>
      <p className="text-sm mt-1">Estamos preparando nuestro catalogo de spa.</p>
    </div>
  );
}

function TreatmentSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border border-gray-200 bg-white overflow-hidden animate-pulse">
          <div className="aspect-[16/10] bg-gray-100" />
          <div className="p-4 space-y-3">
            <div className="h-4 w-2/3 bg-gray-100 rounded" />
            <div className="h-3 w-full bg-gray-100 rounded" />
            <div className="h-3 w-1/3 bg-gray-100 rounded" />
            <div className="flex justify-between pt-2">
              <div className="h-5 w-16 bg-gray-100 rounded" />
              <div className="h-8 w-20 bg-gray-100 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function LeafIcon({ large }: { large?: boolean }) {
  const size = large ? 48 : 40;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={large ? "#d1d5db" : "#c4b5fd"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={large ? "mx-auto" : ""}>
      <path d="M12 22c-4.97 0-9-2.24-9-5v-.09c1.523.07 3.037-.092 4.5-.5C9.622 15.61 11.4 14 12 12c.6 2 2.378 3.61 4.5 4.41 1.463.408 2.977.57 4.5.5V17c0 2.76-4.03 5-9 5z" />
      <path d="M12 12V2" />
      <path d="M8 5.14C9.37 4.38 10.7 4 12 4s2.63.38 4 1.14" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
