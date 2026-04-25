"use client";

import { useMemo } from "react";
import {
  GraduationCap,
  Users,
  Award,
  Snowflake,
  Clock,
} from "lucide-react";
import type {
  CalendarActivity,
  OperationsRentals,
} from "@/hooks/useBookingOps";

interface ParticipantLite {
  name?: string;
  type?: string;
}

function countParticipants(reservation: CalendarActivity["reservation"]): number {
  // Reservation participants come from the API as Json; we don't always include
  // them in the calendar payload. Best-effort: 0 if not provided.
  const p = (reservation as unknown as { participants?: ParticipantLite[] } | undefined)
    ?.participants;
  return Array.isArray(p) ? p.length : 0;
}

function parseStart(schedule?: string): number {
  if (!schedule) return 0;
  const m = schedule.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return 0;
  return Number(m[1]) * 60 + Number(m[2]);
}

interface TimelineEvent {
  time: string;
  label: string;
  detail: string;
  status: "now" | "next" | "later" | "done";
}

function buildTimeline(
  activities: CalendarActivity[],
  nowMinutes: number
): TimelineEvent[] {
  const items = activities
    .map((a) => {
      const startMin = parseStart(a.reservation?.schedule);
      return {
        startMin,
        time: a.reservation?.schedule ?? "—",
        label:
          a.reservation?.clientName ??
          (a.reservation as unknown as { product?: string } | undefined)?.product ??
          "Actividad",
        detail: a.reservation?.station ?? "",
        startsBeforeNow: startMin <= nowMinutes,
      };
    })
    .sort((a, b) => a.startMin - b.startMin);

  const events: TimelineEvent[] = [];
  let nextFlagged = false;
  for (const item of items) {
    let status: TimelineEvent["status"] = "later";
    if (item.startsBeforeNow) {
      status = "done";
    } else if (!nextFlagged) {
      status = "next";
      nextFlagged = true;
    }
    events.push({
      time: item.time,
      label: item.label,
      detail: item.detail,
      status,
    });
  }

  // Mark "now": the most recent done item if any.
  const lastDoneIdx = [...events].reverse().findIndex((e) => e.status === "done");
  if (lastDoneIdx !== -1) {
    const idx = events.length - 1 - lastDoneIdx;
    events[idx] = { ...events[idx], status: "now" };
  }

  return events.slice(0, 6);
}

interface Props {
  activities: CalendarActivity[];
  rentals?: OperationsRentals;
  isToday: boolean;
}

export default function DailySummary({ activities, rentals, isToday }: Props) {
  const stats = useMemo(() => {
    const totalLessons = activities.length;
    const totalStudents = activities.reduce(
      (s, a) => s + countParticipants(a.reservation),
      0
    );
    const instructorIds = new Set<string>();
    for (const a of activities) {
      for (const m of a.monitors ?? []) instructorIds.add(m.user.id);
    }
    const totalInstructors = instructorIds.size;
    const totalRentals = rentals?.summary.totalUnits ?? 0;
    return { totalLessons, totalStudents, totalInstructors, totalRentals };
  }, [activities, rentals]);

  const timeline = useMemo(() => {
    if (!isToday) return [] as TimelineEvent[];
    const now = new Date();
    return buildTimeline(activities, now.getHours() * 60 + now.getMinutes());
  }, [activities, isToday]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Stat cards */}
      <div className="lg:col-span-2 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={<GraduationCap className="h-4 w-4 text-[#E87B5A]" />}
          label="Clases hoy"
          value={stats.totalLessons}
          accent="bg-[#E87B5A]/10"
        />
        <StatCard
          icon={<Users className="h-4 w-4 text-[#5B8C6D]" />}
          label="Alumnos total"
          value={stats.totalStudents}
          accent="bg-[#5B8C6D]/10"
        />
        <StatCard
          icon={<Award className="h-4 w-4 text-[#D4A853]" />}
          label="Instructores activos"
          value={stats.totalInstructors}
          accent="bg-[#D4A853]/10"
        />
        <StatCard
          icon={<Snowflake className="h-4 w-4 text-blue-500" />}
          label="Equipos alquilados"
          value={stats.totalRentals}
          accent="bg-blue-500/10"
        />
      </div>

      {/* Timeline */}
      <div className="rounded-2xl border border-[#E8E4DE] bg-white overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#E8E4DE] bg-[#FAF9F7]">
          <Clock className="h-4 w-4 text-[#E87B5A]" />
          <h3 className="text-sm font-semibold text-[#2D2A26]">
            {isToday ? "Linea del dia" : "Programa del dia"}
          </h3>
        </div>
        <div className="p-3 space-y-2 max-h-[200px] overflow-y-auto">
          {timeline.length === 0 ? (
            <p className="text-xs text-[#8A8580] text-center py-4">
              Sin eventos programados
            </p>
          ) : (
            timeline.map((e, i) => <TimelineRow key={i} event={e} />)
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-[#E8E4DE] bg-white px-4 py-3">
      <div className={`inline-flex items-center justify-center h-7 w-7 rounded-xl ${accent} mb-2`}>
        {icon}
      </div>
      <p className="text-xl font-bold text-[#2D2A26]">{value}</p>
      <p className="text-xs text-[#8A8580]">{label}</p>
    </div>
  );
}

const STATUS_DOT: Record<TimelineEvent["status"], string> = {
  done: "bg-[#E8E4DE]",
  now: "bg-[#5B8C6D] ring-4 ring-[#5B8C6D]/20",
  next: "bg-[#E87B5A] ring-4 ring-[#E87B5A]/20",
  later: "bg-[#D4A853]/40",
};

const STATUS_LABEL: Record<TimelineEvent["status"], string> = {
  done: "Pasado",
  now: "Ahora",
  next: "Siguiente",
  later: "Programado",
};

function TimelineRow({ event }: { event: TimelineEvent }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center pt-1">
        <span className={`h-2.5 w-2.5 rounded-full ${STATUS_DOT[event.status]}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-[#2D2A26] truncate">{event.label}</p>
          <span className="text-[10px] text-[#8A8580] shrink-0">
            {STATUS_LABEL[event.status]}
          </span>
        </div>
        <p className="text-xs text-[#8A8580]">
          {event.time}
          {event.detail && <span> · {event.detail}</span>}
        </p>
      </div>
    </div>
  );
}
