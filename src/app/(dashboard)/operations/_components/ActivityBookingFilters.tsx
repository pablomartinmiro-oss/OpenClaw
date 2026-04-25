"use client";

import { Search } from "lucide-react";

export interface ActivityFilters {
  instructorId: string;
  station: string;
  activityType: string;
  status: string;
  search: string;
}

export const EMPTY_FILTERS: ActivityFilters = {
  instructorId: "",
  station: "",
  activityType: "",
  status: "",
  search: "",
};

const STATUSES = [
  { value: "", label: "Todos los estados" },
  { value: "scheduled", label: "Programada" },
  { value: "pending", label: "Pendiente" },
  { value: "confirmed", label: "Confirmada" },
  { value: "cancelled", label: "Cancelada" },
  { value: "incident", label: "Incidencia" },
];

const STATIONS = [
  { value: "", label: "Todas las estaciones" },
  { value: "baqueira", label: "Baqueira Beret" },
  { value: "sierra_nevada", label: "Sierra Nevada" },
  { value: "formigal", label: "Formigal" },
  { value: "la_pinilla", label: "La Pinilla" },
  { value: "grandvalira", label: "Grandvalira" },
  { value: "alto_campoo", label: "Alto Campoo" },
];

const ACTIVITY_TYPES = [
  { value: "", label: "Todos los tipos" },
  { value: "grupo", label: "Clase de grupo" },
  { value: "particular", label: "Clase particular" },
  { value: "snowcamp", label: "SnowCamp" },
  { value: "freeride", label: "Freeride" },
];

interface Instructor {
  id: string;
  name: string | null;
  email: string;
}

interface Props {
  filters: ActivityFilters;
  onChange: (filters: ActivityFilters) => void;
  instructors: Instructor[];
}

export default function ActivityBookingFilters({
  filters,
  onChange,
  instructors,
}: Props) {
  const update = <K extends keyof ActivityFilters>(
    key: K,
    value: ActivityFilters[K]
  ) => onChange({ ...filters, [key]: value });

  const hasActive =
    !!filters.instructorId ||
    !!filters.station ||
    !!filters.activityType ||
    !!filters.status ||
    !!filters.search;

  return (
    <div className="rounded-2xl border border-[#E8E4DE] bg-white p-3 space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A8580] pointer-events-none" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => update("search", e.target.value)}
            placeholder="Buscar por cliente o telefono..."
            className="w-full rounded-xl border border-[#E8E4DE] bg-[#FAF9F7] pl-9 pr-3 py-2 text-sm text-[#2D2A26] placeholder:text-[#8A8580] focus:outline-none focus:ring-2 focus:ring-[#E87B5A]/30 focus:border-[#E87B5A] transition-colors"
          />
        </div>
        {hasActive && (
          <button
            onClick={() => onChange(EMPTY_FILTERS)}
            className="rounded-xl border border-[#E8E4DE] bg-white px-3 py-2 text-xs font-medium text-[#8A8580] hover:text-[#E87B5A] hover:border-[#E87B5A] transition-colors"
          >
            Limpiar
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <Select
          value={filters.instructorId}
          onChange={(v) => update("instructorId", v)}
        >
          <option value="">Todos los instructores</option>
          {instructors.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name ?? u.email.split("@")[0]}
            </option>
          ))}
        </Select>

        <Select
          value={filters.station}
          onChange={(v) => update("station", v)}
        >
          {STATIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>

        <Select
          value={filters.activityType}
          onChange={(v) => update("activityType", v)}
        >
          {ACTIVITY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>

        <Select value={filters.status} onChange={(v) => update("status", v)}>
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}

function Select({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-xl border border-[#E8E4DE] bg-white px-3 py-2 text-sm text-[#2D2A26] focus:outline-none focus:ring-2 focus:ring-[#E87B5A]/30 focus:border-[#E87B5A] transition-colors"
    >
      {children}
    </select>
  );
}
