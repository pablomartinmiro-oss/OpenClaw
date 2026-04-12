"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GraduationCap, Users, CalendarCog, AlertTriangle, Clock,
  ChevronRight, Sun, Sunset, TrendingUp, UserX, CalendarOff,
} from "lucide-react";
import { useOverviewStats } from "@/hooks/usePlanning";
import { useInstructors } from "@/hooks/useInstructors";

export default function EscuelaOverviewPage() {
  const [date] = useState(() => new Date().toISOString().split("T")[0]);
  const [station, setStation] = useState("baqueira");

  const { data: stats, isLoading } = useOverviewStats(date, station);
  const { data: instructorsData } = useInstructors({ isActive: "true", station });
  const totalInstructors = instructorsData?.instructors?.length ?? 0;

  const dayLabel = new Date(date).toLocaleDateString("es-ES", {
    weekday: "long", day: "numeric", month: "long",
  });

  const selectClass = "rounded-lg border border-[#E8E4DE] bg-white px-3 py-1.5 text-sm text-[#2D2A26] focus:border-[#E87B5A] focus:outline-none";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E87B5A]/10">
            <GraduationCap className="h-5 w-5 text-[#E87B5A]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#2D2A26]">Escuela</h1>
            <p className="text-sm text-[#8A8580] capitalize">{dayLabel}</p>
          </div>
        </div>
        <select value={station} onChange={(e) => setStation(e.target.value)} className={selectClass}>
          <option value="baqueira">Baqueira</option>
          <option value="sierra_nevada">Sierra Nevada</option>
          <option value="la_pinilla">La Pinilla</option>
        </select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-[#FAF9F7] animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard icon={Users} label="Grupos hoy" value={stats?.todayGroups ?? 0}
              sub={`${stats?.morningGroups ?? 0} manana · ${stats?.afternoonGroups ?? 0} tarde`}
              color="text-[#E87B5A]" bgColor="bg-[#E87B5A]/10" />
            <KPICard icon={GraduationCap} label="Alumnos" value={stats?.todayStudents ?? 0}
              sub={`${stats?.occupancy ?? 0}% ocupacion`}
              color="text-[#5B8C6D]" bgColor="bg-[#5B8C6D]/10" />
            <KPICard icon={Users} label="Profesores activos" value={stats?.todayInstructors ?? 0}
              sub={`de ${totalInstructors} disponibles`}
              color="text-[#D4A853]" bgColor="bg-[#D4A853]/10" />
            <KPICard icon={TrendingUp} label="Pendientes" value={stats?.pendingUnits ?? 0}
              sub={`${stats?.unassignedGroups ?? 0} grupos sin profesor`}
              color={stats?.pendingUnits ? "text-[#C75D4A]" : "text-[#5B8C6D]"}
              bgColor={stats?.pendingUnits ? "bg-[#C75D4A]/10" : "bg-[#5B8C6D]/10"} />
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Schedule summary */}
            <div className="lg:col-span-2 rounded-2xl border border-[#E8E4DE] bg-white p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-[#2D2A26]">Resumen del dia</h2>
                <Link href="/profesores/planning" className="flex items-center gap-1 text-xs font-medium text-[#E87B5A] hover:underline">
                  Ir a Planning <ChevronRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Morning */}
                <div className="rounded-xl border border-[#E8E4DE] p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sun className="h-4 w-4 text-[#D4A853]" />
                    <span className="text-sm font-semibold text-[#2D2A26]">Manana</span>
                    <span className="text-xs text-[#8A8580]">9:00 – 13:00</span>
                  </div>
                  <div className="text-2xl font-bold text-[#2D2A26]">{stats?.morningGroups ?? 0}</div>
                  <p className="text-xs text-[#8A8580]">grupos programados</p>
                </div>

                {/* Afternoon */}
                <div className="rounded-xl border border-[#E8E4DE] p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sunset className="h-4 w-4 text-[#E87B5A]" />
                    <span className="text-sm font-semibold text-[#2D2A26]">Tarde</span>
                    <span className="text-xs text-[#8A8580]">13:00 – 17:00</span>
                  </div>
                  <div className="text-2xl font-bold text-[#2D2A26]">{stats?.afternoonGroups ?? 0}</div>
                  <p className="text-xs text-[#8A8580]">grupos programados</p>
                </div>
              </div>

              {/* Discipline breakdown */}
              {stats?.byDiscipline && stats.byDiscipline.length > 0 && (
                <div className="mt-4 flex gap-3">
                  {stats.byDiscipline.map((d) => (
                    <div key={d.discipline} className="flex-1 rounded-lg bg-[#FAF9F7] border border-[#E8E4DE] p-3 text-center">
                      <p className="text-lg font-bold text-[#2D2A26]">{d.count}</p>
                      <p className="text-[10px] text-[#8A8580] uppercase">{d.discipline}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Alerts panel */}
            <div className="space-y-4">
              {/* Alerts */}
              <div className="rounded-2xl border border-[#E8E4DE] bg-white p-5">
                <h2 className="text-sm font-semibold text-[#2D2A26] mb-3">Alertas</h2>
                <div className="space-y-2">
                  {(stats?.pendingUnits ?? 0) > 0 && (
                    <AlertRow icon={UserX} label={`${stats?.pendingUnits} alumnos pendientes de agrupar`}
                      color="text-[#D4A853]" href="/profesores/planning" />
                  )}
                  {(stats?.unassignedGroups ?? 0) > 0 && (
                    <AlertRow icon={Users} label={`${stats?.unassignedGroups} grupos sin profesor`}
                      color="text-[#C75D4A]" href="/profesores/planning" />
                  )}
                  {(stats?.openIncidents ?? 0) > 0 && (
                    <AlertRow icon={AlertTriangle} label={`${stats?.openIncidents} incidencias abiertas`}
                      color="text-[#C75D4A]" href="/profesores/incidencias" />
                  )}
                  {(stats?.pendingFreeDays ?? 0) > 0 && (
                    <AlertRow icon={CalendarOff} label={`${stats?.pendingFreeDays} solicitudes dias libres`}
                      color="text-[#D4A853]" href="/profesores/dias-libres" />
                  )}
                  {!stats?.pendingUnits && !stats?.unassignedGroups && !stats?.openIncidents && !stats?.pendingFreeDays && (
                    <p className="text-xs text-[#5B8C6D] py-2">Todo en orden</p>
                  )}
                </div>
              </div>

              {/* Quick actions */}
              <div className="rounded-2xl border border-[#E8E4DE] bg-white p-5">
                <h2 className="text-sm font-semibold text-[#2D2A26] mb-3">Acciones rapidas</h2>
                <div className="space-y-2">
                  <QuickAction icon={CalendarCog} label="Planning del dia" href="/profesores/planning" />
                  <QuickAction icon={GraduationCap} label="Gestion de profesores" href="/profesores" />
                  <QuickAction icon={Clock} label="Fichaje" href="/profesores/fichaje" />
                  <QuickAction icon={AlertTriangle} label="Incidencias" href="/profesores/incidencias" />
                </div>
              </div>

              {/* Recent incidents */}
              {stats?.recentIncidents && stats.recentIncidents.length > 0 && (
                <div className="rounded-2xl border border-[#E8E4DE] bg-white p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-[#2D2A26]">Incidencias recientes</h2>
                    <Link href="/profesores/incidencias" className="text-[10px] font-medium text-[#E87B5A] hover:underline">
                      Ver todas
                    </Link>
                  </div>
                  <div className="space-y-2">
                    {stats.recentIncidents.map((inc) => (
                      <div key={inc.id} className="rounded-lg border border-[#E8E4DE] p-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`h-2 w-2 rounded-full ${inc.severity === "urgent" ? "bg-[#C75D4A]" : "bg-[#D4A853]"}`} />
                          <span className="text-xs font-medium text-[#2D2A26] capitalize">{inc.type.replace(/_/g, " ")}</span>
                        </div>
                        <p className="text-[11px] text-[#8A8580] line-clamp-2">{inc.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function KPICard({ icon: Icon, label, value, sub, color, bgColor }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: number; sub: string; color: string; bgColor: string;
}) {
  return (
    <div className="rounded-2xl border border-[#E8E4DE] bg-white p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${bgColor}`}>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
        <span className="text-xs font-medium text-[#8A8580]">{label}</span>
      </div>
      <p className="text-2xl font-bold text-[#2D2A26]">{value}</p>
      <p className="text-[11px] text-[#8A8580] mt-0.5">{sub}</p>
    </div>
  );
}

function AlertRow({ icon: Icon, label, color, href }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; color: string; href: string;
}) {
  return (
    <Link href={href} className="flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-[#FAF9F7] transition-colors">
      <Icon className={`h-3.5 w-3.5 ${color}`} />
      <span className="text-xs text-[#2D2A26] flex-1">{label}</span>
      <ChevronRight className="h-3 w-3 text-[#8A8580]" />
    </Link>
  );
}

function QuickAction({ icon: Icon, label, href }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; href: string;
}) {
  return (
    <Link href={href} className="flex items-center gap-2.5 rounded-lg border border-[#E8E4DE] px-3 py-2.5 hover:bg-[#FAF9F7] hover:border-[#E87B5A]/30 transition-all">
      <Icon className="h-4 w-4 text-[#E87B5A]" />
      <span className="text-sm font-medium text-[#2D2A26]">{label}</span>
      <ChevronRight className="h-3 w-3 text-[#8A8580] ml-auto" />
    </Link>
  );
}
