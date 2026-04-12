"use client";

import { GraduationCap, Users } from "lucide-react";
import type { Instructor } from "@/hooks/useInstructors";
import type { GroupCellRecord } from "@/hooks/usePlanning";

const TIME_BLOCKS = [
  { label: "Manana", start: "09:00", end: "13:00", sub: "9:00 – 13:00" },
  { label: "Tarde", start: "13:00", end: "17:00", sub: "13:00 – 17:00" },
];

const DISCIPLINE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  esqui: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
  snow: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700" },
  telemark: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
  freestyle: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700" },
};

const LEVEL_DOTS: Record<string, string> = {
  A: "bg-[#5B8C6D]", B: "bg-[#D4A853]", C: "bg-[#E87B5A]", D: "bg-[#C75D4A]",
};

interface Props {
  groups: GroupCellRecord[];
  instructors: Instructor[];
  onSelectGroup: (id: string) => void;
  selectedGroupId: string | null;
}

export default function PlanningBoard({ groups, instructors, onSelectGroup, selectedGroupId }: Props) {
  const getGroups = (instructorId: string, block: typeof TIME_BLOCKS[0]) =>
    groups.filter((g) => g.instructorId === instructorId && g.timeSlotStart >= block.start && g.timeSlotStart < block.end);

  const unassigned = groups.filter((g) => !g.instructorId);

  return (
    <div className="rounded-2xl border border-[#E8E4DE] bg-white overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[200px_1fr_1fr] border-b border-[#E8E4DE] bg-[#FAF9F7]">
        <div className="px-4 py-2.5 text-xs font-semibold text-[#8A8580]">Profesor</div>
        {TIME_BLOCKS.map((b) => (
          <div key={b.label} className="border-l border-[#E8E4DE] px-4 py-2.5 text-center">
            <p className="text-xs font-semibold text-[#2D2A26]">{b.label}</p>
            <p className="text-[10px] text-[#8A8580]">{b.sub}</p>
          </div>
        ))}
      </div>

      {/* Instructor rows */}
      {instructors.map((inst) => (
        <div key={inst.id} className="grid grid-cols-[200px_1fr_1fr] border-b border-[#E8E4DE] last:border-0 min-h-[80px]">
          {/* Instructor info */}
          <div className="flex items-start gap-2.5 px-4 py-3 border-r border-[#E8E4DE]">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E87B5A]/10">
              <GraduationCap className="h-4 w-4 text-[#E87B5A]" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#2D2A26] truncate">{inst.user.name ?? inst.user.email}</p>
              <div className="flex gap-1 mt-0.5">
                <span className="rounded bg-[#FAF9F7] border border-[#E8E4DE] px-1 py-0.5 text-[10px] font-bold">{inst.tdLevel}</span>
                {(inst.languages as string[]).slice(0, 2).map((l) => (
                  <span key={l} className="rounded bg-[#FAF9F7] border border-[#E8E4DE] px-1 py-0.5 text-[10px] uppercase">{l}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Time blocks */}
          {TIME_BLOCKS.map((block) => {
            const blockGroups = getGroups(inst.id, block);
            return (
              <div key={block.label} className="border-l border-[#E8E4DE] p-2 flex flex-wrap gap-2 content-start">
                {blockGroups.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-[10px] text-[#E8E4DE]">—</span>
                  </div>
                ) : (
                  blockGroups.map((g) => (
                    <GroupCard key={g.id} group={g} onClick={() => onSelectGroup(g.id)} isSelected={selectedGroupId === g.id} />
                  ))
                )}
              </div>
            );
          })}
        </div>
      ))}

      {/* Unassigned row */}
      {unassigned.length > 0 && (
        <div className="grid grid-cols-[200px_1fr_1fr] border-t-2 border-[#D4A853]/30 min-h-[80px]">
          <div className="flex items-center px-4 py-3 border-r border-[#E8E4DE]">
            <div>
              <p className="text-sm font-semibold text-[#D4A853]">Sin profesor</p>
              <p className="text-[10px] text-[#8A8580]">{unassigned.length} grupo{unassigned.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
          {TIME_BLOCKS.map((block) => {
            const blockGroups = unassigned.filter(
              (g) => g.timeSlotStart >= block.start && g.timeSlotStart < block.end
            );
            return (
              <div key={block.label} className="border-l border-[#E8E4DE] p-2 flex flex-wrap gap-2 content-start">
                {blockGroups.map((g) => (
                  <GroupCard key={g.id} group={g} onClick={() => onSelectGroup(g.id)} isSelected={selectedGroupId === g.id} />
                ))}
              </div>
            );
          })}
        </div>
      )}

      {instructors.length === 0 && groups.length === 0 && (
        <div className="p-12 text-center text-sm text-[#8A8580]">No hay profesores ni grupos para esta fecha</div>
      )}
    </div>
  );
}

function GroupCard({ group, onClick, isSelected }: { group: GroupCellRecord; onClick: () => void; isSelected: boolean }) {
  const colors = DISCIPLINE_COLORS[group.discipline] ?? DISCIPLINE_COLORS.esqui;
  const count = group._count.units;
  const pct = Math.min(100, (count / group.maxParticipants) * 100);
  const isFull = count >= group.maxParticipants;

  return (
    <button
      onClick={onClick}
      className={`w-full max-w-[180px] rounded-xl border p-2.5 text-left transition-all hover:shadow-md ${colors.bg} ${colors.border} ${isSelected ? "ring-2 ring-[#E87B5A] shadow-md" : ""}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${LEVEL_DOTS[group.level] ?? "bg-gray-400"}`} />
          <span className={`text-[11px] font-bold ${colors.text} uppercase`}>{group.discipline}</span>
          <span className={`text-[11px] font-bold ${colors.text}`}>{group.level}</span>
        </div>
        {group._count.incidents > 0 && (
          <span className="rounded-full bg-[#C75D4A] px-1.5 py-0.5 text-[9px] font-bold text-white">{group._count.incidents}</span>
        )}
      </div>

      {/* Time + age */}
      <p className="text-[10px] text-[#8A8580]">
        {group.timeSlotStart}–{group.timeSlotEnd}
        {group.ageBracket && <span className="ml-1 capitalize">· {group.ageBracket}</span>}
      </p>

      {/* Capacity bar */}
      <div className="mt-2 flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-white/60 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${isFull ? "bg-[#C75D4A]" : pct > 70 ? "bg-[#5B8C6D]" : "bg-[#D4A853]"}`}
            style={{ width: `${Math.max(pct, 8)}%` }}
          />
        </div>
        <span className="flex items-center gap-0.5 text-[10px] font-medium text-[#2D2A26]">
          <Users className="h-2.5 w-2.5" />
          {count}/{group.maxParticipants}
        </span>
      </div>
    </button>
  );
}
