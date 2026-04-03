"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { useReviews } from "@/hooks/useReviews";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import ReviewsTable from "./_components/ReviewsTable";

const inputCls =
  "w-full rounded-[10px] border border-[#E8E4DE] px-3 py-2 text-sm text-[#2D2A26] placeholder:text-[#8A8580] focus:border-[#E87B5A] focus:outline-none focus:ring-1 focus:ring-[#E87B5A]";

const ENTITY_TYPES = [
  { value: "", label: "Todos los tipos" },
  { value: "experience", label: "Experiencia" },
  { value: "hotel", label: "Hotel" },
  { value: "spa", label: "Spa" },
  { value: "restaurant", label: "Restaurante" },
];

const STATUSES = [
  { value: "", label: "Todos" },
  { value: "pending", label: "Pendientes" },
  { value: "approved", label: "Aprobadas" },
  { value: "rejected", label: "Rechazadas" },
];

export default function ReviewsPage() {
  const [filterStatus, setFilterStatus] = useState("");
  const [filterEntity, setFilterEntity] = useState("");

  const { data, isLoading } = useReviews(
    filterStatus || undefined,
    filterEntity || undefined
  );

  const reviews = data?.reviews ?? [];

  const pendingCount = reviews.filter((r) => r.status === "pending").length;

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2D2A26]">
            Resenas
          </h1>
          {pendingCount > 0 && (
            <p className="text-sm text-[#D4A853] mt-1">
              {pendingCount} resena{pendingCount !== 1 ? "s" : ""} pendiente
              {pendingCount !== 1 ? "s" : ""} de moderacion
            </p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={inputCls + " w-40"}
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <select
          value={filterEntity}
          onChange={(e) => setFilterEntity(e.target.value)}
          className={inputCls + " w-48"}
        >
          {ENTITY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <p className="text-sm text-[#8A8580]">
          {reviews.length} resena{reviews.length !== 1 ? "s" : ""}
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-12 text-center">
          <Star className="mx-auto h-10 w-10 text-[#8A8580] mb-3" />
          <p className="text-sm text-[#8A8580]">No hay resenas</p>
          <p className="text-xs text-[#8A8580] mt-1">
            Las resenas publicas aparecaran aqui para moderacion
          </p>
        </div>
      ) : (
        <ReviewsTable reviews={reviews} />
      )}
    </div>
  );
}
