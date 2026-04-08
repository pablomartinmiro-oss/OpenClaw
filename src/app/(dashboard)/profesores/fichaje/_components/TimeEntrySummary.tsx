"use client";

import { Clock, Users, AlertTriangle } from "lucide-react";
import type { TimeEntry } from "@/hooks/useInstructors";

interface Props {
  entries: TimeEntry[];
}

export default function TimeEntrySummary({ entries }: Props) {
  const completedEntries = entries.filter((e) => e.clockOut);
  const totalNetMinutes = completedEntries.reduce((s, e) => s + e.netMinutes, 0);
  const totalHours = (totalNetMinutes / 60).toFixed(1);
  const uniqueInstructors = new Set(entries.map((e) => e.instructorId)).size;
  const openEntries = entries.filter((e) => !e.clockOut);
  const lockedEntries = entries.filter((e) => e.lockedAt);

  const cards = [
    {
      icon: Clock,
      label: "Horas totales",
      value: `${totalHours}h`,
      sub: `${completedEntries.length} fichajes completos`,
      color: "#E87B5A",
    },
    {
      icon: Users,
      label: "Profesores",
      value: String(uniqueInstructors),
      sub: `${lockedEntries.length} fichajes bloqueados`,
      color: "#5B8C6D",
    },
    {
      icon: AlertTriangle,
      label: "Fichajes abiertos",
      value: String(openEntries.length),
      sub: openEntries.length > 0 ? "Pendientes de salida" : "Todo en orden",
      color: openEntries.length > 0 ? "#D4A853" : "#8A8580",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <div key={card.label} className="rounded-2xl border border-[#E8E4DE] bg-white p-4">
          <div className="flex items-center gap-2">
            <card.icon className="h-4 w-4" style={{ color: card.color }} />
            <span className="text-xs font-medium text-[#8A8580]">{card.label}</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-[#2D2A26]">{card.value}</p>
          <p className="text-xs text-[#8A8580]">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}
