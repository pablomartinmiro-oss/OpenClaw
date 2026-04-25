"use client";

import { useMemo } from "react";
import type { CalendarActivity } from "@/hooks/useBookingOps";

const HOUR_START = 8;
const HOUR_END = 18;
const HOURS = Array.from(
  { length: HOUR_END - HOUR_START + 1 },
  (_, i) => HOUR_START + i
);

// Stable color palette for instructors. Hash the instructor id to a slot.
const INSTRUCTOR_COLORS = [
  { bg: "bg-[#E87B5A]/15", border: "border-[#E87B5A]", dot: "bg-[#E87B5A]", text: "text-[#E87B5A]" },
  { bg: "bg-[#5B8C6D]/15", border: "border-[#5B8C6D]", dot: "bg-[#5B8C6D]", text: "text-[#5B8C6D]" },
  { bg: "bg-[#D4A853]/15", border: "border-[#D4A853]", dot: "bg-[#D4A853]", text: "text-[#D4A853]" },
  { bg: "bg-purple-500/15", border: "border-purple-500", dot: "bg-purple-500", text: "text-purple-600" },
  { bg: "bg-blue-500/15", border: "border-blue-500", dot: "bg-blue-500", text: "text-blue-600" },
  { bg: "bg-pink-500/15", border: "border-pink-500", dot: "bg-pink-500", text: "text-pink-600" },
  { bg: "bg-teal-500/15", border: "border-teal-500", dot: "bg-teal-500", text: "text-teal-600" },
];

const UNASSIGNED_COLOR = {
  bg: "bg-[#8A8580]/10",
  border: "border-dashed border-[#8A8580]",
  dot: "bg-[#8A8580]",
  text: "text-[#8A8580]",
};

function colorFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return INSTRUCTOR_COLORS[Math.abs(hash) % INSTRUCTOR_COLORS.length];
}

function parseSchedule(schedule?: string): { startMin: number; endMin: number } | null {
  if (!schedule) return null;
  const m = schedule.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
  if (!m) return null;
  const startMin = Number(m[1]) * 60 + Number(m[2]);
  const endMin = Number(m[3]) * 60 + Number(m[4]);
  if (endMin <= startMin) return null;
  return { startMin, endMin };
}

interface Lane {
  instructorId: string;
  instructorName: string;
  blocks: {
    activity: CalendarActivity;
    startMin: number;
    endMin: number;
  }[];
}

interface Props {
  activities: CalendarActivity[];
  onSelect: (activity: CalendarActivity) => void;
}

export default function InstructorTimeline({ activities, onSelect }: Props) {
  const lanes = useMemo<Lane[]>(() => {
    const map = new Map<string, Lane>();
    for (const a of activities) {
      const slot = parseSchedule(a.reservation?.schedule);
      if (!slot) continue;
      const monitors = a.monitors ?? [];
      if (monitors.length === 0) {
        const key = "__unassigned__";
        const lane =
          map.get(key) ??
          { instructorId: key, instructorName: "Sin asignar", blocks: [] };
        lane.blocks.push({ activity: a, ...slot });
        map.set(key, lane);
      } else {
        for (const m of monitors) {
          const key = m.user.id;
          const lane =
            map.get(key) ??
            {
              instructorId: key,
              instructorName: m.user.name ?? m.user.email.split("@")[0],
              blocks: [],
            };
          lane.blocks.push({ activity: a, ...slot });
          map.set(key, lane);
        }
      }
    }
    // Sort lanes: unassigned last
    return Array.from(map.values()).sort((a, b) => {
      if (a.instructorId === "__unassigned__") return 1;
      if (b.instructorId === "__unassigned__") return -1;
      return a.instructorName.localeCompare(b.instructorName);
    });
  }, [activities]);

  if (lanes.length === 0) {
    return (
      <div className="rounded-2xl border border-[#E8E4DE] bg-white p-12 text-center">
        <p className="text-sm text-[#8A8580]">
          Sin clases con horarios definidos para este dia
        </p>
      </div>
    );
  }

  const totalMin = (HOUR_END - HOUR_START) * 60;

  return (
    <div className="rounded-2xl border border-[#E8E4DE] bg-white overflow-hidden">
      {/* Header with hours */}
      <div className="sticky top-0 z-10 bg-[#FAF9F7] border-b border-[#E8E4DE]">
        <div className="flex">
          <div className="w-32 sm:w-40 shrink-0 px-4 py-3 text-xs font-semibold text-[#2D2A26]">
            Instructor
          </div>
          <div className="flex-1 grid relative" style={{ gridTemplateColumns: `repeat(${HOURS.length - 1}, 1fr)` }}>
            {HOURS.slice(0, -1).map((h) => (
              <div
                key={h}
                className="border-l border-[#E8E4DE] py-3 text-[10px] text-[#8A8580] text-center"
              >
                {h}:00
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lanes */}
      <div className="divide-y divide-[#E8E4DE]">
        {lanes.map((lane) => {
          const color =
            lane.instructorId === "__unassigned__"
              ? UNASSIGNED_COLOR
              : colorFor(lane.instructorId);
          return (
            <div key={lane.instructorId} className="flex hover:bg-[#FAF9F7]/40">
              <div className="w-32 sm:w-40 shrink-0 px-4 py-4 flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${color.dot}`} />
                <span className="text-xs font-medium text-[#2D2A26] truncate">
                  {lane.instructorName}
                </span>
              </div>
              <div className="flex-1 relative h-16">
                {/* Hour gridlines */}
                {HOURS.slice(1, -1).map((_, i) => (
                  <div
                    key={i}
                    className="absolute top-0 bottom-0 border-l border-[#E8E4DE]/60"
                    style={{ left: `${((i + 1) / (HOURS.length - 1)) * 100}%` }}
                  />
                ))}
                {/* Blocks */}
                {lane.blocks.map((block, i) => {
                  const startOffset = block.startMin - HOUR_START * 60;
                  const duration = block.endMin - block.startMin;
                  if (startOffset < 0 || startOffset > totalMin) return null;
                  const left = (startOffset / totalMin) * 100;
                  const width = Math.min(
                    (duration / totalMin) * 100,
                    100 - left
                  );
                  return (
                    <button
                      key={`${block.activity.id}-${i}`}
                      onClick={() => onSelect(block.activity)}
                      className={`absolute top-2 bottom-2 rounded-lg border-l-2 ${color.bg} ${color.border} px-2 py-1 text-left overflow-hidden hover:ring-2 hover:ring-[#E87B5A]/30 transition`}
                      style={{ left: `${left}%`, width: `${width}%` }}
                      title={`${block.activity.reservation?.clientName ?? ""} · ${block.activity.reservation?.schedule ?? ""}`}
                    >
                      <p className={`text-[11px] font-semibold ${color.text} truncate`}>
                        {block.activity.reservation?.clientName ?? "Cliente"}
                      </p>
                      <p className="text-[10px] text-[#2D2A26]/70 truncate">
                        {block.activity.reservation?.station ?? ""}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
