"use client";

import { useState } from "react";
import { CalendarCog, ChevronLeft, ChevronRight, Wand2, UserCheck } from "lucide-react";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import { useInstructors } from "@/hooks/useInstructors";
import { useGroupCells, useOperationalUnits, useAutoGroup, useAutoAssignInstructors } from "@/hooks/usePlanning";
import { toast } from "sonner";
import PlanningCalendar from "./_components/PlanningCalendar";
import UnassignedPanel from "./_components/UnassignedPanel";

export default function PlanningPage() {
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [station, setStation] = useState("baqueira");

  const { data: instructorsData } = useInstructors({ isActive: "true", station });
  const instructors = instructorsData?.instructors ?? [];
  const { data: groupsData, isLoading } = useGroupCells({ date, station });
  const groups = groupsData?.groups ?? [];
  const { data: unitsData } = useOperationalUnits({ date, status: "pending" });
  const pendingUnits = unitsData?.units ?? [];

  const autoGroupMutation = useAutoGroup();
  const autoAssignMutation = useAutoAssignInstructors();

  const shiftDay = (dir: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + dir);
    setDate(d.toISOString().split("T")[0]);
  };

  const handleAutoGroup = async () => {
    try {
      const result = await autoGroupMutation.mutateAsync({ date, station });
      toast.success(`${result.applied.created} grupos creados`);
    } catch {
      toast.error("Error en agrupacion automatica");
    }
  };

  const handleAutoAssign = async () => {
    try {
      const result = await autoAssignMutation.mutateAsync({ date, station });
      toast.success(`${result.applied.assigned} profesores asignados`);
    } catch {
      toast.error("Error en asignacion automatica");
    }
  };

  const dayLabel = new Date(date).toLocaleDateString("es-ES", {
    weekday: "long", day: "numeric", month: "long",
  });

  const unassignedGroups = groups.filter((g) => !g.instructorId);
  const selectClass = "rounded-[10px] border border-[#E8E4DE] bg-white px-3 py-2 text-sm text-[#2D2A26] focus:border-[#E87B5A] focus:outline-none";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E87B5A]/10">
            <CalendarCog className="h-5 w-5 text-[#E87B5A]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#2D2A26]">Planning</h1>
            <p className="text-sm text-[#8A8580]">Motor de planificacion de la escuela</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleAutoGroup} disabled={autoGroupMutation.isPending || pendingUnits.length === 0}
            className="flex items-center gap-2 rounded-[10px] bg-[#E87B5A] px-4 py-2 text-sm font-medium text-white hover:bg-[#D56E4F] transition-colors disabled:opacity-50">
            <Wand2 className="h-4 w-4" />
            {autoGroupMutation.isPending ? "Agrupando..." : `Auto-agrupar (${pendingUnits.length})`}
          </button>
          <button onClick={handleAutoAssign} disabled={autoAssignMutation.isPending || unassignedGroups.length === 0}
            className="flex items-center gap-2 rounded-[10px] border border-[#E87B5A] px-4 py-2 text-sm font-medium text-[#E87B5A] hover:bg-[#E87B5A]/10 transition-colors disabled:opacity-50">
            <UserCheck className="h-4 w-4" />
            {autoAssignMutation.isPending ? "Asignando..." : `Asignar profes (${unassignedGroups.length})`}
          </button>
        </div>
      </div>

      {/* Date + station nav */}
      <div className="flex items-center justify-between rounded-xl bg-white border border-[#E8E4DE] px-5 py-3">
        <button onClick={() => shiftDay(-1)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E8E4DE] text-[#8A8580] hover:border-[#E87B5A] hover:text-[#E87B5A] transition-colors">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-4">
          <p className="text-lg font-semibold text-[#2D2A26] capitalize">{dayLabel}</p>
          <select value={station} onChange={(e) => setStation(e.target.value)} className={selectClass}>
            <option value="baqueira">Baqueira</option>
            <option value="sierra_nevada">Sierra Nevada</option>
            <option value="la_pinilla">La Pinilla</option>
          </select>
        </div>
        <button onClick={() => shiftDay(1)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E8E4DE] text-[#8A8580] hover:border-[#E87B5A] hover:text-[#E87B5A] transition-colors">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Grupos" value={groups.length} color="#E87B5A" />
        <StatCard label="Participantes" value={groups.reduce((s, g) => s + g._count.units, 0)} color="#5B8C6D" />
        <StatCard label="Sin asignar" value={unassignedGroups.length} color="#D4A853" />
        <StatCard label="Pendientes" value={pendingUnits.length} color="#8A8580" />
      </div>

      {/* Content */}
      {isLoading ? <PageSkeleton /> : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <PlanningCalendar groups={groups} instructors={instructors} />
          </div>
          <div>
            <UnassignedPanel units={pendingUnits} />
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl border border-[#E8E4DE] bg-white p-3">
      <p className="text-xs text-[#8A8580]">{label}</p>
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
    </div>
  );
}
