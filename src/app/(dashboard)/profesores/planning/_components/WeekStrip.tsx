"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useGroupCells } from "@/hooks/usePlanning";

interface Props {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  station: string;
}

function getWeekDays(dateStr: string): string[] {
  const d = new Date(dateStr);
  const day = d.getDay(); // 0=Sun
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((day + 6) % 7)); // Go back to Monday
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const dd = new Date(monday);
    dd.setDate(monday.getDate() + i);
    days.push(dd.toISOString().split("T")[0]);
  }
  return days;
}

const DAY_NAMES = ["L", "M", "X", "J", "V", "S", "D"];

export default function WeekStrip({ selectedDate, onSelectDate, station }: Props) {
  const days = getWeekDays(selectedDate);
  const todayStr = new Date().toISOString().split("T")[0];

  const shiftWeek = (dir: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + dir * 7);
    onSelectDate(d.toISOString().split("T")[0]);
  };

  const weekLabel = (() => {
    const start = new Date(days[0]);
    const end = new Date(days[6]);
    const sameMonth = start.getMonth() === end.getMonth();
    if (sameMonth) {
      return `${start.getDate()} – ${end.getDate()} ${start.toLocaleDateString("es-ES", { month: "long" })}`;
    }
    return `${start.getDate()} ${start.toLocaleDateString("es-ES", { month: "short" })} – ${end.getDate()} ${end.toLocaleDateString("es-ES", { month: "short" })}`;
  })();

  return (
    <div className="rounded-xl border border-[#E8E4DE] bg-white overflow-hidden">
      {/* Week header */}
      <div className="flex items-center justify-between border-b border-[#E8E4DE] px-3 py-2">
        <button onClick={() => shiftWeek(-1)} className="rounded-lg p-1 text-[#8A8580] hover:bg-[#FAF9F7] hover:text-[#E87B5A]">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-xs font-semibold text-[#2D2A26] capitalize">{weekLabel}</span>
        <button onClick={() => shiftWeek(1)} className="rounded-lg p-1 text-[#8A8580] hover:bg-[#FAF9F7] hover:text-[#E87B5A]">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {days.map((day, i) => (
          <DayCell
            key={day}
            date={day}
            dayName={DAY_NAMES[i]}
            isSelected={day === selectedDate}
            isToday={day === todayStr}
            isWeekend={i >= 5}
            station={station}
            onClick={() => onSelectDate(day)}
          />
        ))}
      </div>
    </div>
  );
}

function DayCell({ date, dayName, isSelected, isToday, isWeekend, station, onClick }: {
  date: string; dayName: string; isSelected: boolean; isToday: boolean;
  isWeekend: boolean; station: string; onClick: () => void;
}) {
  const { data } = useGroupCells({ date, station });
  const groups = data?.groups ?? [];
  const count = groups.length;
  const students = groups.reduce((s, g) => s + g._count.units, 0);
  const hasUnassigned = groups.some((g) => !g.instructorId);

  const dayNum = new Date(date).getDate();

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 px-1 py-2.5 border-r last:border-r-0 border-[#E8E4DE] transition-all
        ${isSelected ? "bg-[#E87B5A]/10" : isWeekend ? "bg-[#FAF9F7]" : "bg-white hover:bg-[#FAF9F7]"}
      `}
    >
      <span className={`text-[10px] font-medium ${isWeekend ? "text-[#8A8580]" : "text-[#8A8580]"}`}>
        {dayName}
      </span>
      <span className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold transition-all
        ${isSelected ? "bg-[#E87B5A] text-white" : isToday ? "bg-[#2D2A26] text-white" : "text-[#2D2A26]"}
      `}>
        {dayNum}
      </span>
      {/* Mini stats */}
      {count > 0 ? (
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-[9px] font-bold text-[#2D2A26]">{count}g</span>
          <span className="text-[9px] text-[#8A8580]">{students}a</span>
        </div>
      ) : (
        <span className="text-[9px] text-[#E8E4DE] mt-0.5">—</span>
      )}
      {/* Alert dot */}
      {hasUnassigned && (
        <span className="h-1.5 w-1.5 rounded-full bg-[#D4A853]" />
      )}
    </button>
  );
}
