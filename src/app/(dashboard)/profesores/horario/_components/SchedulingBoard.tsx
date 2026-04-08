"use client";

import { GraduationCap } from "lucide-react";
import type { Instructor, Assignment } from "@/hooks/useInstructors";

const HOURS = Array.from({ length: 10 }, (_, i) => i + 8); // 8:00 to 17:00

const STATUS_COLORS: Record<string, string> = {
  assigned: "bg-[#D4A853]/15 border-[#D4A853]/30 text-[#D4A853]",
  in_progress: "bg-[#E87B5A]/15 border-[#E87B5A]/30 text-[#E87B5A]",
  completed: "bg-[#5B8C6D]/15 border-[#5B8C6D]/30 text-[#5B8C6D]",
  cancelled: "bg-[#8A8580]/15 border-[#8A8580]/30 text-[#8A8580]",
  no_show: "bg-[#C75D4A]/15 border-[#C75D4A]/30 text-[#C75D4A]",
};

const LESSON_LABELS: Record<string, string> = {
  group: "Grupal",
  private: "Particular",
  adaptive: "Adaptativa",
};

interface Props {
  instructors: Instructor[];
  assignments: Assignment[];
  date: string;
}

export default function SchedulingBoard({ instructors, assignments }: Props) {
  const getAssignments = (instructorId: string) =>
    assignments.filter((a) => a.instructorId === instructorId);

  if (instructors.length === 0) {
    return (
      <div className="rounded-2xl border border-[#E8E4DE] bg-white p-8 text-center">
        <p className="text-sm text-[#8A8580]">No hay profesores activos</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#E8E4DE] bg-white overflow-hidden">
      {/* Header row */}
      <div className="flex border-b border-[#E8E4DE] bg-[#FAF9F7]">
        <div className="w-40 shrink-0 px-3 py-2 text-xs font-medium text-[#8A8580]">
          Profesor
        </div>
        <div className="flex flex-1">
          {HOURS.map((h) => (
            <div key={h} className="flex-1 border-l border-[#E8E4DE] px-1 py-2 text-center text-xs text-[#8A8580]">
              {String(h).padStart(2, "0")}:00
            </div>
          ))}
        </div>
      </div>

      {/* Instructor rows */}
      {instructors.map((inst) => {
        const instAssignments = getAssignments(inst.id);
        return (
          <div key={inst.id} className="flex border-b border-[#E8E4DE] last:border-0 min-h-[52px]">
            <div className="w-40 shrink-0 flex items-center gap-2 px-3 py-2">
              <GraduationCap className="h-3.5 w-3.5 text-[#E87B5A]" />
              <div className="truncate">
                <p className="text-xs font-medium text-[#2D2A26] truncate">
                  {inst.user.name ?? inst.user.email}
                </p>
                <p className="text-[10px] text-[#8A8580]">{inst.tdLevel}</p>
              </div>
            </div>
            <div className="flex flex-1 relative">
              {HOURS.map((h) => (
                <div key={h} className="flex-1 border-l border-[#E8E4DE]" />
              ))}
              {/* Assignment blocks overlaid */}
              {instAssignments.map((a) => {
                const startH = parseInt(a.scheduledStart.split(":")[0]);
                const startM = parseInt(a.scheduledStart.split(":")[1]);
                const endH = parseInt(a.scheduledEnd.split(":")[0]);
                const endM = parseInt(a.scheduledEnd.split(":")[1]);
                const startOffset = ((startH - 8) + startM / 60) / HOURS.length * 100;
                const duration = ((endH - startH) + (endM - startM) / 60) / HOURS.length * 100;

                return (
                  <div
                    key={a.id}
                    className={`absolute top-1 bottom-1 rounded-lg border px-1.5 py-0.5 overflow-hidden ${STATUS_COLORS[a.status] ?? ""}`}
                    style={{ left: `${startOffset}%`, width: `${duration}%` }}
                    title={`${a.booking.reservation.clientName} — ${LESSON_LABELS[a.lessonType] ?? a.lessonType}`}
                  >
                    <p className="text-[10px] font-semibold truncate">
                      {a.booking.reservation.clientName}
                    </p>
                    <p className="text-[9px] truncate">
                      {LESSON_LABELS[a.lessonType] ?? a.lessonType} · {a.studentCount}p
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
