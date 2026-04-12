"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar, Users } from "lucide-react";
import { useGroupCells } from "@/hooks/usePlanning";

const DAY_NAMES = ["L", "M", "X", "J", "V", "S", "D"];

interface Props {
  instructorId: string;
}

export default function MiMes({ instructorId }: Props) {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth());

  const todayStr = new Date().toISOString().split("T")[0];

  const { startDate, endDate } = useMemo(() => {
    const s = new Date(year, month, 1);
    const e = new Date(year, month + 1, 0);
    return { startDate: s.toISOString().split("T")[0], endDate: e.toISOString().split("T")[0] };
  }, [year, month]);

  const { data } = useGroupCells({ startDate, endDate, instructorId });
  const groups = data?.groups ?? [];

  const monthLabel = new Date(year, month).toLocaleDateString("es-ES", { month: "long", year: "numeric" });

  const shiftMonth = (dir: number) => {
    const d = new Date(year, month + dir);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  };

  // Calendar grid
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7; // Monday = 0
  const totalDays = lastDay.getDate();

  const cells: Array<{ date: string | null; day: number }> = [];
  for (let i = 0; i < startOffset; i++) cells.push({ date: null, day: 0 });
  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ date: dateStr, day: d });
  }

  // Group counts by date
  const countMap = new Map<string, { groups: number; students: number }>();
  for (const g of groups) {
    const dateStr = g.activityDate.split("T")[0];
    const existing = countMap.get(dateStr) ?? { groups: 0, students: 0 };
    existing.groups++;
    existing.students += g._count.units;
    countMap.set(dateStr, existing);
  }

  const totalClasses = groups.length;
  const totalStudents = groups.reduce((s, g) => s + g._count.units, 0);
  const workingDays = countMap.size;

  return (
    <div className="rounded-2xl border border-[#E8E4DE] bg-white p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[#E87B5A]" />
          <h3 className="text-base font-semibold text-[#2D2A26]">Mi mes</h3>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => shiftMonth(-1)} className="rounded-lg p-1 text-[#8A8580] hover:bg-[#FAF9F7] hover:text-[#E87B5A]">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold text-[#2D2A26] capitalize min-w-[140px] text-center">{monthLabel}</span>
          <button onClick={() => shiftMonth(1)} className="rounded-lg p-1 text-[#8A8580] hover:bg-[#FAF9F7] hover:text-[#E87B5A]">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="flex gap-4 mb-4 text-xs text-[#8A8580]">
        <span><strong className="text-[#2D2A26]">{totalClasses}</strong> clases</span>
        <span><strong className="text-[#2D2A26]">{totalStudents}</strong> alumnos</span>
        <span><strong className="text-[#2D2A26]">{workingDays}</strong> dias con clase</span>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map((name) => (
          <div key={name} className="text-center text-[10px] font-semibold text-[#8A8580] py-1">{name}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((cell, idx) => {
          if (!cell.date) return <div key={idx} className="h-16" />;
          const counts = countMap.get(cell.date);
          const isToday = cell.date === todayStr;
          const isWeekend = (idx % 7) >= 5;

          return (
            <div key={cell.date} className={`h-16 rounded-lg border p-1 transition-colors
              ${isToday ? "border-[#E87B5A] bg-[#E87B5A]/5" : "border-transparent"}
              ${isWeekend && !isToday ? "bg-[#FAF9F7]" : ""}
            `}>
              <p className={`text-[10px] font-medium ${isToday ? "text-[#E87B5A] font-bold" : "text-[#2D2A26]"}`}>
                {cell.day}
              </p>
              {counts && (
                <div className="mt-0.5">
                  <div className="flex items-center gap-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#E87B5A]" />
                    <span className="text-[8px] font-bold text-[#2D2A26]">{counts.groups}c</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Users className="h-2 w-2 text-[#8A8580]" />
                    <span className="text-[8px] text-[#8A8580]">{counts.students}a</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
