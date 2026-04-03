"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
}

interface Restaurant {
  id: string;
  title: string;
  slug: string;
  capacity: number;
  description: string | null;
  shifts: Shift[];
}

const SHIFT_LABELS: Record<string, string> = {
  almuerzo: "Almuerzo",
  cena: "Cena",
  brunch: "Brunch",
  desayuno: "Desayuno",
};

export default function RestaurantePage() {
  const { slug } = useParams<{ slug: string }>();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/storefront/public/${slug}/restaurants`)
      .then((r) => r.json())
      .then((data) => setRestaurants(data.restaurants ?? []))
      .catch(() => {
        // silent
      })
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Restaurante
        </h1>
        <p className="text-gray-500">
          Gastronomia de montana para todos los gustos.
        </p>
      </div>

      {loading ? (
        <RestaurantSkeleton />
      ) : restaurants.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {restaurants.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Image placeholder */}
              <div className="aspect-[16/9] bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
                <UtensilsIcon />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {r.title}
                </h3>
                {r.description && (
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                    {r.description}
                  </p>
                )}
                {r.capacity > 0 && (
                  <p className="text-xs text-gray-500 mb-3 flex items-center gap-1.5">
                    <PersonIcon /> Capacidad: {r.capacity} comensales
                  </p>
                )}

                {/* Shifts */}
                {r.shifts.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
                      Turnos disponibles
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {r.shifts.map((shift) => (
                        <div
                          key={shift.id}
                          className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-xs"
                        >
                          <span className="font-medium text-gray-900">
                            {SHIFT_LABELS[shift.name] ?? shift.name}
                          </span>
                          <span className="text-gray-500 ml-1.5">
                            {shift.startTime} - {shift.endTime}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  disabled
                  className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-[#E87B5A] rounded-lg opacity-60 cursor-not-allowed"
                >
                  Reservar mesa (proximamente)
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16 text-gray-500">
      <UtensilsIcon large />
      <p className="text-lg mt-4">No hay restaurantes disponibles.</p>
      <p className="text-sm mt-1">Estamos preparando nuestra oferta gastronomica.</p>
    </div>
  );
}

function RestaurantSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[1, 2].map((i) => (
        <div key={i} className="rounded-xl border border-gray-200 bg-white overflow-hidden animate-pulse">
          <div className="aspect-[16/9] bg-gray-100" />
          <div className="p-5 space-y-3">
            <div className="h-5 w-1/2 bg-gray-100 rounded" />
            <div className="h-4 w-3/4 bg-gray-100 rounded" />
            <div className="h-3 w-1/4 bg-gray-100 rounded" />
            <div className="flex gap-2 pt-1">
              <div className="h-7 w-28 bg-gray-100 rounded-lg" />
              <div className="h-7 w-28 bg-gray-100 rounded-lg" />
            </div>
            <div className="h-10 w-full bg-gray-100 rounded-lg mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function UtensilsIcon({ large }: { large?: boolean }) {
  const size = large ? 48 : 40;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={large ? "#d1d5db" : "#f59e0b"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={large ? "mx-auto" : ""}>
      <path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" />
      <circle cx="10" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}
