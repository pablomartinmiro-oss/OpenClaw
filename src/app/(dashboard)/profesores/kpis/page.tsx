"use client";

import { useState } from "react";
import { BarChart3, Users, GraduationCap, Clock, AlertTriangle } from "lucide-react";
import { useInstructors } from "@/hooks/useInstructors";
import { useGroupCells, useIncidents } from "@/hooks/usePlanning";

export default function KPIsPage() {
  const today = new Date().toISOString().split("T")[0];
  const [station, setStation] = useState("baqueira");

  const { data: instructorsData } = useInstructors({ station, isActive: "true" });
  const instructors = instructorsData?.instructors ?? [];
  const { data: groupsData } = useGroupCells({ date: today, station });
  const groups = groupsData?.groups ?? [];
  const { data: incidentsData } = useIncidents({ resolved: "false" });
  const openIncidents = incidentsData?.incidents ?? [];

  const totalParticipants = groups.reduce((s, g) => s + g._count.units, 0);
  const totalCapacity = groups.reduce((s, g) => s + g.maxParticipants, 0);
  const occupancy = totalCapacity > 0 ? Math.round((totalParticipants / totalCapacity) * 100) : 0;
  const assignedGroups = groups.filter((g) => g.instructorId).length;
  const unassignedGroups = groups.length - assignedGroups;

  // Instructor load distribution
  const loadMap = new Map<string, number>();
  for (const g of groups) {
    if (g.instructorId) {
      loadMap.set(g.instructorId, (loadMap.get(g.instructorId) ?? 0) + 1);
    }
  }
  const loads = Array.from(loadMap.values());
  const avgLoad = loads.length > 0 ? (loads.reduce((a, b) => a + b, 0) / loads.length).toFixed(1) : "0";
  const maxLoad = loads.length > 0 ? Math.max(...loads) : 0;
  const minLoad = loads.length > 0 ? Math.min(...loads) : 0;

  const selectClass = "rounded-[10px] border border-[#E8E4DE] bg-white px-3 py-2 text-sm text-[#2D2A26] focus:border-[#E87B5A] focus:outline-none";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E87B5A]/10">
            <BarChart3 className="h-5 w-5 text-[#E87B5A]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#2D2A26]">KPIs Escuela</h1>
            <p className="text-sm text-[#8A8580]">Metricas operativas del dia</p>
          </div>
        </div>
        <select value={station} onChange={(e) => setStation(e.target.value)} className={selectClass}>
          <option value="baqueira">Baqueira</option>
          <option value="sierra_nevada">Sierra Nevada</option>
          <option value="la_pinilla">La Pinilla</option>
        </select>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard icon={Users} label="Ocupacion" value={`${occupancy}%`} sub={`${totalParticipants}/${totalCapacity} plazas`} color="#E87B5A" />
        <KpiCard icon={GraduationCap} label="Profesores activos" value={String(instructors.length)} sub={`${assignedGroups} con clase · ${unassignedGroups} sin asignar`} color="#5B8C6D" />
        <KpiCard icon={Clock} label="Carga media" value={`${avgLoad} grupos/prof`} sub={`Min: ${minLoad} · Max: ${maxLoad}`} color="#D4A853" />
        <KpiCard icon={AlertTriangle} label="Incidencias abiertas" value={String(openIncidents.length)} sub={`${openIncidents.filter((i) => i.severity === "urgent").length} urgentes`} color="#C75D4A" />
      </div>

      {/* Group distribution by discipline */}
      <div className="rounded-2xl border border-[#E8E4DE] bg-white p-5">
        <h3 className="text-sm font-semibold text-[#2D2A26] mb-3">Grupos por disciplina y nivel</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {["esqui", "snow", "telemark", "freestyle"].map((disc) => {
            const discGroups = groups.filter((g) => g.discipline === disc);
            if (discGroups.length === 0) return null;
            return (
              <div key={disc} className="rounded-xl border border-[#E8E4DE] p-3">
                <p className="text-xs font-semibold text-[#2D2A26] capitalize mb-2">{disc}</p>
                {["A", "B", "C", "D"].map((level) => {
                  const count = discGroups.filter((g) => g.level === level).length;
                  if (count === 0) return null;
                  return (
                    <div key={level} className="flex items-center justify-between text-xs mb-1">
                      <span className="text-[#8A8580]">Nivel {level}</span>
                      <span className="font-medium text-[#2D2A26]">{count} grupos</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Instructor load table */}
      <div className="rounded-2xl border border-[#E8E4DE] bg-white p-5">
        <h3 className="text-sm font-semibold text-[#2D2A26] mb-3">Carga por profesor</h3>
        <div className="space-y-2">
          {instructors.map((inst) => {
            const load = loadMap.get(inst.id) ?? 0;
            const pct = maxLoad > 0 ? (load / maxLoad) * 100 : 0;
            return (
              <div key={inst.id} className="flex items-center gap-3">
                <span className="w-32 text-xs text-[#2D2A26] truncate">{inst.user.name ?? inst.user.email}</span>
                <div className="flex-1 h-4 rounded-full bg-[#FAF9F7] overflow-hidden">
                  <div className="h-full rounded-full bg-[#E87B5A]/60 transition-all" style={{ width: `${Math.max(pct, 4)}%` }} />
                </div>
                <span className="text-xs font-medium text-[#2D2A26] w-16 text-right">{load} grupo{load !== 1 ? "s" : ""}</span>
              </div>
            );
          })}
          {instructors.length === 0 && <p className="text-xs text-[#8A8580]">Sin profesores activos</p>}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, sub, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; sub: string; color: string }) {
  return (
    <div className="rounded-2xl border border-[#E8E4DE] bg-white p-4">
      <div className="flex items-center gap-2 mb-2">
        <div style={{ color }}><Icon className="h-4 w-4" /></div>
        <span className="text-xs text-[#8A8580]">{label}</span>
      </div>
      <p className="text-2xl font-bold text-[#2D2A26]">{value}</p>
      <p className="text-xs text-[#8A8580]">{sub}</p>
    </div>
  );
}
