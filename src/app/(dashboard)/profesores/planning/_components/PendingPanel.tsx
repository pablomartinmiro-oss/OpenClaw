"use client";

import { useState } from "react";
import { AlertCircle, User, Search } from "lucide-react";
import type { OperationalUnitRecord } from "@/hooks/usePlanning";

const LEVEL_COLORS: Record<string, string> = {
  A: "bg-[#5B8C6D]/15 text-[#5B8C6D]", B: "bg-[#D4A853]/15 text-[#D4A853]",
  C: "bg-[#E87B5A]/15 text-[#E87B5A]", D: "bg-[#C75D4A]/15 text-[#C75D4A]",
};

interface Props {
  units: OperationalUnitRecord[];
}

export default function PendingPanel({ units }: Props) {
  const [filter, setFilter] = useState("");
  const [discFilter, setDiscFilter] = useState("");

  const filtered = units.filter((u) => {
    if (filter && !u.participant.firstName.toLowerCase().includes(filter.toLowerCase())) return false;
    if (discFilter && u.participant.discipline !== discFilter) return false;
    return true;
  });

  // Group by discipline+level for quick overview
  const summary = new Map<string, number>();
  for (const u of units) {
    const key = `${u.participant.discipline} ${u.participant.level}`;
    summary.set(key, (summary.get(key) ?? 0) + 1);
  }

  return (
    <div className="rounded-2xl border border-[#E8E4DE] bg-white">
      {/* Header */}
      <div className="border-b border-[#E8E4DE] px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-[#D4A853]" />
            <h3 className="text-sm font-semibold text-[#2D2A26]">Pendientes</h3>
          </div>
          {units.length > 0 && (
            <span className="rounded-full bg-[#D4A853] px-2 py-0.5 text-[10px] font-bold text-white">{units.length}</span>
          )}
        </div>

        {/* Quick summary */}
        {units.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {Array.from(summary.entries()).map(([key, count]) => (
              <span key={key} className="rounded-lg bg-[#FAF9F7] border border-[#E8E4DE] px-1.5 py-0.5 text-[10px] text-[#2D2A26]">
                {key}: <strong>{count}</strong>
              </span>
            ))}
          </div>
        )}

        {/* Filters */}
        {units.length > 3 && (
          <div className="flex gap-1.5">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1.5 h-3 w-3 text-[#8A8580]" />
              <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Buscar..."
                className="w-full rounded-lg border border-[#E8E4DE] bg-white pl-6 pr-2 py-1 text-[11px] focus:border-[#E87B5A] focus:outline-none" />
            </div>
            <select value={discFilter} onChange={(e) => setDiscFilter(e.target.value)}
              className="rounded-lg border border-[#E8E4DE] px-2 py-1 text-[11px] text-[#2D2A26] focus:outline-none">
              <option value="">Todas</option>
              <option value="esqui">Esqui</option>
              <option value="snow">Snow</option>
            </select>
          </div>
        )}
      </div>

      {/* List */}
      <div className="max-h-[500px] overflow-y-auto divide-y divide-[#E8E4DE]">
        {filtered.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#8A8580]">
            {units.length === 0 ? "Todos agrupados" : "Sin resultados"}
          </div>
        ) : (
          filtered.map((unit) => (
            <div key={unit.id} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[#FAF9F7] transition-colors">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FAF9F7] border border-[#E8E4DE]">
                <User className="h-3 w-3 text-[#8A8580]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[#2D2A26] truncate">
                  {unit.participant.firstName} {unit.participant.lastName ?? ""}
                </p>
                <div className="flex gap-1 mt-0.5">
                  <span className={`rounded px-1 py-0.5 text-[9px] font-bold ${LEVEL_COLORS[unit.participant.level] ?? ""}`}>
                    {unit.participant.level}
                  </span>
                  <span className="text-[9px] text-[#8A8580] capitalize">{unit.participant.discipline}</span>
                  {unit.participant.ageBracket && (
                    <span className="text-[9px] text-[#8A8580] capitalize">{unit.participant.ageBracket}</span>
                  )}
                  <span className="text-[9px] text-[#8A8580] uppercase">{unit.participant.language}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
