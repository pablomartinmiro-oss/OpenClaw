"use client";

import { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import { useInstructors, useAssignments } from "@/hooks/useInstructors";
import SchedulingBoard from "./_components/SchedulingBoard";
import UnassignedLessons from "./_components/UnassignedLessons";

export default function HorarioPage() {
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const { data: instructorsData } = useInstructors({ isActive: "true" });
  const instructors = instructorsData?.instructors ?? [];
  const { data: assignmentsData, isLoading } = useAssignments({ date });
  const assignments = assignmentsData?.assignments ?? [];

  const shiftDay = (dir: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + dir);
    setDate(d.toISOString().split("T")[0]);
  };

  const dayLabel = new Date(date).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E87B5A]/10">
          <Calendar className="h-5 w-5 text-[#E87B5A]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#2D2A26]">Horario</h1>
          <p className="text-sm text-[#8A8580]">
            Asignacion de profesores a clases
          </p>
        </div>
      </div>

      {/* Date navigation */}
      <div className="flex items-center justify-between rounded-xl bg-white border border-[#E8E4DE] px-5 py-3">
        <button
          onClick={() => shiftDay(-1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E8E4DE] text-[#8A8580] hover:border-[#E87B5A] hover:text-[#E87B5A] transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="text-center">
          <p className="text-lg font-semibold text-[#2D2A26] capitalize">{dayLabel}</p>
          <p className="text-xs text-[#8A8580]">
            {assignments.length} asignacion{assignments.length !== 1 ? "es" : ""} — {instructors.length} profesores
          </p>
        </div>
        <button
          onClick={() => shiftDay(1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E8E4DE] text-[#8A8580] hover:border-[#E87B5A] hover:text-[#E87B5A] transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <PageSkeleton />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SchedulingBoard instructors={instructors} assignments={assignments} date={date} />
          </div>
          <div>
            <UnassignedLessons date={date} assignments={assignments} />
          </div>
        </div>
      )}
    </div>
  );
}
