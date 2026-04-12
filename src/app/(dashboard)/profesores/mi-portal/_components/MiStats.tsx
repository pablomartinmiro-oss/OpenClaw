"use client";

import { Clock, TrendingUp, GraduationCap, Users } from "lucide-react";
import type { TimeEntry, Instructor } from "@/hooks/useInstructors";
import type { GroupCellRecord } from "@/hooks/usePlanning";

interface Props {
  entries: TimeEntry[];
  myProfile: Instructor;
  todayClasses: GroupCellRecord[];
}

export default function MiStats({ entries, myProfile, todayClasses }: Props) {
  const completedEntries = entries.filter((e) => e.clockOut);
  const totalMinutes = completedEntries.reduce((s, e) => s + e.netMinutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const workingDays = new Set(completedEntries.map((e) => e.date.split("T")[0])).size;
  const estimatedEarnings = (totalMinutes / 60) * myProfile.hourlyRate;

  const todayStudents = todayClasses.reduce((s, g) => s + g._count.units, 0);
  const completedToday = todayClasses.filter((g) => g.status === "completed").length;

  const now = new Date();
  const monthName = now.toLocaleDateString("es-ES", { month: "long" });

  return (
    <div className="space-y-4">
      {/* Today's summary */}
      <div className="rounded-2xl border border-[#E8E4DE] bg-white p-5">
        <h3 className="text-sm font-semibold text-[#2D2A26] mb-3">Hoy</h3>
        <div className="grid grid-cols-3 gap-3">
          <StatMini icon={Users} label="Clases" value={String(todayClasses.length)}
            sub={`${completedToday} completadas`} colorClass="text-[#E87B5A]" />
          <StatMini icon={GraduationCap} label="Alumnos" value={String(todayStudents)}
            sub="total" colorClass="text-[#5B8C6D]" />
          <StatMini icon={Clock} label="Horas" value={todayClasses.length > 0
            ? `${todayClasses.reduce((s, g) => {
                const [sh, sm] = g.timeSlotStart.split(":").map(Number);
                const [eh, em] = g.timeSlotEnd.split(":").map(Number);
                return s + (eh * 60 + em - sh * 60 - sm);
              }, 0) / 60}h`
            : "0h"}
            sub="programadas" colorClass="text-[#D4A853]" />
        </div>
      </div>

      {/* Monthly stats */}
      <div className="rounded-2xl border border-[#E8E4DE] bg-white p-5">
        <h3 className="text-sm font-semibold text-[#2D2A26] mb-3 capitalize">Resumen {monthName}</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-xl bg-[#FAF9F7] border border-[#E8E4DE] p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E87B5A]/10">
              <Clock className="h-4 w-4 text-[#E87B5A]" />
            </div>
            <div>
              <p className="text-[10px] text-[#8A8580]">Horas este mes</p>
              <p className="text-lg font-bold text-[#2D2A26]">{totalHours}h</p>
              <p className="text-[10px] text-[#8A8580]">{workingDays} dias trabajados</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-[#FAF9F7] border border-[#E8E4DE] p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#5B8C6D]/10">
              <TrendingUp className="h-4 w-4 text-[#5B8C6D]" />
            </div>
            <div>
              <p className="text-[10px] text-[#8A8580]">Estimacion nomina</p>
              <p className="text-lg font-bold text-[#2D2A26]">
                {estimatedEarnings.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
              </p>
              <p className="text-[10px] text-[#8A8580]">{myProfile.hourlyRate} EUR/h base</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick profile */}
      <div className="rounded-2xl border border-[#E8E4DE] bg-white p-5">
        <div className="flex items-center gap-2 mb-2">
          <GraduationCap className="h-4 w-4 text-[#E87B5A]" />
          <span className="text-xs font-medium text-[#8A8580]">Mi perfil</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div><span className="text-[#8A8580]">Nivel: </span><span className="font-semibold text-[#2D2A26]">{myProfile.tdLevel}</span></div>
          <div><span className="text-[#8A8580]">Cert: </span><span className="font-semibold text-[#2D2A26]">{myProfile.certNumber ?? "—"}</span></div>
          <div><span className="text-[#8A8580]">Disc: </span><span className="font-semibold text-[#2D2A26] capitalize">{myProfile.disciplines.join(", ")}</span></div>
          <div><span className="text-[#8A8580]">Idiomas: </span><span className="font-semibold text-[#2D2A26] uppercase">{myProfile.languages.join(", ")}</span></div>
        </div>
      </div>
    </div>
  );
}

function StatMini({ icon: Icon, label, value, sub, colorClass }: {
  icon: React.ComponentType<{ className?: string }>; label: string; value: string; sub: string; colorClass: string;
}) {
  return (
    <div className="rounded-xl border border-[#E8E4DE] p-2.5 text-center">
      <Icon className={`mx-auto h-4 w-4 mb-1 ${colorClass}`} />
      <p className="text-lg font-bold text-[#2D2A26]">{value}</p>
      <p className="text-[9px] text-[#8A8580]">{label}</p>
      <p className="text-[8px] text-[#8A8580]">{sub}</p>
    </div>
  );
}
