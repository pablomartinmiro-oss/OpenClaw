"use client";

import { Clock, TrendingUp, Users, GraduationCap } from "lucide-react";
import type { TimeEntry, Instructor } from "@/hooks/useInstructors";

interface Props {
  entries: TimeEntry[];
  myProfile: Instructor;
}

export default function MiStats({ entries, myProfile }: Props) {
  const completedEntries = entries.filter((e) => e.clockOut);
  const totalMinutes = completedEntries.reduce((s, e) => s + e.netMinutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const workingDays = new Set(completedEntries.map((e) => e.date.split("T")[0])).size;
  const estimatedEarnings = (totalMinutes / 60) * myProfile.hourlyRate;

  const now = new Date();
  const monthName = now.toLocaleDateString("es-ES", { month: "long" });

  const stats = [
    {
      icon: Clock,
      label: "Horas este mes",
      value: `${totalHours}h`,
      sub: `${workingDays} dias trabajados`,
      color: "#E87B5A",
    },
    {
      icon: TrendingUp,
      label: "Estimacion nomina",
      value: estimatedEarnings.toLocaleString("es-ES", { style: "currency", currency: "EUR" }),
      sub: `${myProfile.hourlyRate} EUR/h base`,
      color: "#5B8C6D",
    },
  ];

  return (
    <div className="rounded-2xl border border-[#E8E4DE] bg-white p-5">
      <h3 className="text-base font-semibold text-[#2D2A26] mb-4 capitalize">
        Resumen {monthName}
      </h3>

      <div className="space-y-4">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center gap-4 rounded-xl bg-[#FAF9F7] border border-[#E8E4DE] p-4">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${s.color}15` }}
            >
              <s.icon className="h-5 w-5" style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-xs text-[#8A8580]">{s.label}</p>
              <p className="text-xl font-bold text-[#2D2A26]">{s.value}</p>
              <p className="text-xs text-[#8A8580]">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick profile info */}
      <div className="mt-4 rounded-xl border border-[#E8E4DE] p-4">
        <div className="flex items-center gap-2 mb-2">
          <GraduationCap className="h-4 w-4 text-[#E87B5A]" />
          <span className="text-xs font-medium text-[#8A8580]">Mi perfil</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[#8A8580]">Nivel: </span>
            <span className="font-semibold text-[#2D2A26]">{myProfile.tdLevel}</span>
          </div>
          <div>
            <span className="text-[#8A8580]">Titulacion: </span>
            <span className="font-semibold text-[#2D2A26]">{myProfile.certNumber ?? "—"}</span>
          </div>
          <div>
            <span className="text-[#8A8580]">Disciplinas: </span>
            <span className="font-semibold text-[#2D2A26] capitalize">
              {myProfile.disciplines.join(", ")}
            </span>
          </div>
          <div>
            <span className="text-[#8A8580]">Idiomas: </span>
            <span className="font-semibold text-[#2D2A26] uppercase">
              {myProfile.languages.join(", ")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
