"use client";

import type { InstructorFilters } from "@/hooks/useInstructors";

const TD_OPTIONS = [
  { value: "", label: "Todos los niveles" },
  { value: "TD1", label: "TD1 — Iniciacion" },
  { value: "TD2", label: "TD2 — Intermedio" },
  { value: "TD3", label: "TD3 — Avanzado" },
];

const LANGUAGE_OPTIONS = [
  { value: "", label: "Todos los idiomas" },
  { value: "es", label: "Espanol" },
  { value: "en", label: "Ingles" },
  { value: "fr", label: "Frances" },
  { value: "de", label: "Aleman" },
  { value: "pt", label: "Portugues" },
];

const STATUS_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "true", label: "Activos" },
  { value: "false", label: "Inactivos" },
];

interface Props {
  filters: InstructorFilters;
  onChange: (f: InstructorFilters) => void;
}

export default function InstructorFiltersBar({ filters, onChange }: Props) {
  const selectClass =
    "rounded-[10px] border border-[#E8E4DE] bg-white px-3 py-2 text-sm text-[#2D2A26] focus:border-[#E87B5A] focus:outline-none focus:ring-1 focus:ring-[#E87B5A]";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={filters.tdLevel ?? ""}
        onChange={(e) => onChange({ ...filters, tdLevel: e.target.value || undefined })}
        className={selectClass}
      >
        {TD_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      <select
        value={filters.language ?? ""}
        onChange={(e) => onChange({ ...filters, language: e.target.value || undefined })}
        className={selectClass}
      >
        {LANGUAGE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      <select
        value={filters.isActive ?? ""}
        onChange={(e) => onChange({ ...filters, isActive: e.target.value || undefined })}
        className={selectClass}
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
