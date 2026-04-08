"use client";

import { useState } from "react";
import { GraduationCap } from "lucide-react";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import { useInstructors } from "@/hooks/useInstructors";
import type { InstructorFilters } from "@/hooks/useInstructors";
import InstructorTable from "./_components/InstructorTable";
import InstructorFiltersBar from "./_components/InstructorFilters";
import InstructorForm from "./_components/InstructorForm";

export default function ProfesoresPage() {
  const [filters, setFilters] = useState<InstructorFilters>({});
  const [showCreate, setShowCreate] = useState(false);
  const { data, isLoading } = useInstructors(filters);
  const instructors = data?.instructors ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E87B5A]/10">
            <GraduationCap className="h-5 w-5 text-[#E87B5A]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#2D2A26]">Profesores</h1>
            <p className="text-sm text-[#8A8580]">
              Gestion de profesores de la escuela de esqui
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="rounded-[10px] bg-[#E87B5A] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#D56E4F] transition-colors"
        >
          + Nuevo Profesor
        </button>
      </div>

      {/* Filters */}
      <InstructorFiltersBar filters={filters} onChange={setFilters} />

      {/* Content */}
      {isLoading ? (
        <PageSkeleton />
      ) : instructors.length === 0 ? (
        <div className="rounded-2xl border border-[#E8E4DE] bg-white p-12 text-center">
          <GraduationCap className="mx-auto h-12 w-12 text-[#E8E4DE]" />
          <p className="mt-4 text-lg font-medium text-[#2D2A26]">
            No hay profesores registrados
          </p>
          <p className="mt-1 text-sm text-[#8A8580]">
            Anade tu primer profesor para empezar a gestionar la escuela
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-4 rounded-[10px] bg-[#E87B5A] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#D56E4F] transition-colors"
          >
            + Nuevo Profesor
          </button>
        </div>
      ) : (
        <InstructorTable instructors={instructors} />
      )}

      {showCreate && <InstructorForm onClose={() => setShowCreate(false)} />}
    </div>
  );
}
