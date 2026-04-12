"use client";

import { useState, useMemo } from "react";
import { CalendarCog, Wand2, UserCheck, Plus, CalendarDays, LayoutGrid } from "lucide-react";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import { useInstructors } from "@/hooks/useInstructors";
import { useGroupCells, useOperationalUnits, useAutoGroup, useAutoAssignInstructors } from "@/hooks/usePlanning";
import { toast } from "sonner";
import PlanningBoard from "./_components/PlanningBoard";
import PendingPanel from "./_components/PendingPanel";
import GroupDetailDrawer from "./_components/GroupDetailDrawer";
import WorkloadBar from "./_components/WorkloadBar";
import CreateGroupModal from "./_components/CreateGroupModal";
import WeekStrip from "./_components/WeekStrip";
import WeekView from "./_components/WeekView";

type ViewMode = "day" | "week";

function getWeekDays(dateStr: string): string[] {
  const d = new Date(dateStr);
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((day + 6) % 7));
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const dd = new Date(monday);
    dd.setDate(monday.getDate() + i);
    days.push(dd.toISOString().split("T")[0]);
  }
  return days;
}

export default function PlanningPage() {
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [station, setStation] = useState("baqueira");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("day");

  const weekDays = useMemo(() => getWeekDays(date), [date]);

  // Board: station-filtered instructors for rows display
  const { data: instructorsData } = useInstructors({ isActive: "true", station });
  const instructors = instructorsData?.instructors ?? [];
  // All active instructors for assignment dropdowns (no station filter)
  const { data: allInstructorsData } = useInstructors({ isActive: "true" });
  const allInstructors = allInstructorsData?.instructors ?? [];
  const { data: groupsData, isLoading } = useGroupCells({ date, station });
  const groups = groupsData?.groups ?? [];
  const { data: unitsData } = useOperationalUnits({ date, status: "pending" });
  const pendingUnits = unitsData?.units ?? [];

  const autoGroupMutation = useAutoGroup();
  const autoAssignMutation = useAutoAssignInstructors();

  const goToday = () => setDate(new Date().toISOString().split("T")[0]);

  const handleAutoGroup = async () => {
    try {
      const result = await autoGroupMutation.mutateAsync({ date, station });
      toast.success(`${result.applied.created} grupos creados automaticamente`);
    } catch { toast.error("Error en agrupacion"); }
  };

  const handleAutoAssign = async () => {
    try {
      const result = await autoAssignMutation.mutateAsync({ date, station });
      toast.success(`${result.applied.assigned} profesores asignados`);
    } catch { toast.error("Error en asignacion"); }
  };

  const dayLabel = new Date(date).toLocaleDateString("es-ES", {
    weekday: "long", day: "numeric", month: "long",
  });

  const unassignedGroups = groups.filter((g) => !g.instructorId);
  const totalParticipants = groups.reduce((s, g) => s + g._count.units, 0);
  const totalCapacity = groups.reduce((s, g) => s + g.maxParticipants, 0);
  const occupancy = totalCapacity > 0 ? Math.round((totalParticipants / totalCapacity) * 100) : 0;

  const selectClass = "rounded-lg border border-[#E8E4DE] bg-white px-3 py-1.5 text-sm text-[#2D2A26] focus:border-[#E87B5A] focus:outline-none";
  const isToday = date === new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E87B5A]/10">
            <CalendarCog className="h-5 w-5 text-[#E87B5A]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#2D2A26]">Planning Escuela</h1>
            <p className="text-xs text-[#8A8580]">Organiza grupos, asigna profesores, gestiona el dia</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* View toggle */}
          <div className="flex rounded-lg border border-[#E8E4DE] overflow-hidden">
            <button onClick={() => setViewMode("day")}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium transition-colors ${viewMode === "day" ? "bg-[#E87B5A] text-white" : "text-[#8A8580] hover:bg-[#FAF9F7]"}`}>
              <CalendarDays className="h-3.5 w-3.5" /> Dia
            </button>
            <button onClick={() => setViewMode("week")}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium transition-colors ${viewMode === "week" ? "bg-[#E87B5A] text-white" : "text-[#8A8580] hover:bg-[#FAF9F7]"}`}>
              <LayoutGrid className="h-3.5 w-3.5" /> Semana
            </button>
          </div>

          <select value={station} onChange={(e) => setStation(e.target.value)} className={selectClass}>
            <option value="baqueira">Baqueira</option>
            <option value="sierra_nevada">Sierra Nevada</option>
            <option value="la_pinilla">La Pinilla</option>
          </select>

          {viewMode === "day" && (
            <>
              <button onClick={() => setShowCreateGroup(true)}
                className="flex items-center gap-1.5 rounded-lg border border-[#E8E4DE] px-3 py-1.5 text-xs font-medium text-[#2D2A26] hover:bg-[#FAF9F7]">
                <Plus className="h-3.5 w-3.5" /> Crear clase
              </button>
              <button onClick={handleAutoGroup} disabled={autoGroupMutation.isPending || pendingUnits.length === 0}
                className="flex items-center gap-1.5 rounded-lg bg-[#E87B5A] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#D56E4F] disabled:opacity-40">
                <Wand2 className="h-3.5 w-3.5" />
                {autoGroupMutation.isPending ? "..." : `Auto-agrupar (${pendingUnits.length})`}
              </button>
              <button onClick={handleAutoAssign} disabled={autoAssignMutation.isPending || unassignedGroups.length === 0}
                className="flex items-center gap-1.5 rounded-lg border border-[#E87B5A] px-3 py-1.5 text-xs font-medium text-[#E87B5A] hover:bg-[#E87B5A]/10 disabled:opacity-40">
                <UserCheck className="h-3.5 w-3.5" />
                {autoAssignMutation.isPending ? "..." : `Asignar profes (${unassignedGroups.length})`}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Week strip navigation */}
      <WeekStrip selectedDate={date} onSelectDate={(d) => { setDate(d); if (viewMode === "week") setViewMode("day"); }} station={station} />

      {/* Day stats bar (day view only) */}
      {viewMode === "day" && (
        <div className="flex items-center gap-4 rounded-xl bg-white border border-[#E8E4DE] px-4 py-2.5">
          <button onClick={goToday}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium ${isToday ? "bg-[#E87B5A] text-white" : "border border-[#E8E4DE] text-[#8A8580] hover:text-[#E87B5A]"}`}>
            Hoy
          </button>
          <p className="text-sm font-semibold text-[#2D2A26] capitalize flex-1">{dayLabel}</p>
          <div className="hidden sm:flex items-center gap-4 text-xs text-[#8A8580]">
            <span><strong className="text-[#2D2A26]">{groups.length}</strong> grupos</span>
            <span><strong className="text-[#2D2A26]">{totalParticipants}</strong> alumnos</span>
            <span className={occupancy > 80 ? "text-[#5B8C6D]" : occupancy > 50 ? "text-[#D4A853]" : "text-[#8A8580]"}>
              <strong className="text-[#2D2A26]">{occupancy}%</strong> ocupacion
            </span>
          </div>
        </div>
      )}

      {/* Content */}
      {viewMode === "day" ? (
        <>
          <WorkloadBar instructors={instructors} groups={groups} />
          {isLoading ? <PageSkeleton /> : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
              <div className="lg:col-span-3">
                <PlanningBoard
                  groups={groups}
                  instructors={instructors}
                  onSelectGroup={setSelectedGroupId}
                  selectedGroupId={selectedGroupId}
                />
              </div>
              <div>
                <PendingPanel units={pendingUnits} />
              </div>
            </div>
          )}
        </>
      ) : (
        <WeekView
          weekDays={weekDays}
          station={station}
          onSelectDate={(d) => { setDate(d); setViewMode("day"); }}
          onSelectGroup={setSelectedGroupId}
        />
      )}

      {/* Group detail drawer */}
      {selectedGroupId && (
        <GroupDetailDrawer
          groupId={selectedGroupId}
          onClose={() => setSelectedGroupId(null)}
          instructors={allInstructors}
        />
      )}

      {/* Create group modal */}
      {showCreateGroup && (
        <CreateGroupModal
          date={date}
          station={station}
          instructors={allInstructors}
          onClose={() => setShowCreateGroup(false)}
        />
      )}
    </div>
  );
}
