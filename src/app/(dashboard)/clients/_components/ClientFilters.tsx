"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SKI_LEVELS, STATIONS_LIST, SOURCES } from "./constants";

interface Props {
  search: string;
  skiLevel: string;
  station: string;
  source: string;
  onSearch: (v: string) => void;
  onSkiLevel: (v: string) => void;
  onStation: (v: string) => void;
  onSource: (v: string) => void;
}

export function ClientFiltersBar({
  search,
  skiLevel,
  station,
  source,
  onSearch,
  onSkiLevel,
  onStation,
  onSource,
}: Props) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
      <div className="relative flex-1 md:max-w-xs">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A8580]" />
        <Input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Buscar por nombre, email, teléfono o DNI..."
          className="pl-8"
        />
      </div>
      <FilterSelect value={skiLevel} onChange={onSkiLevel} placeholder="Todos los niveles">
        {SKI_LEVELS.map((l) => (
          <option key={l.value} value={l.value}>
            {l.label}
          </option>
        ))}
      </FilterSelect>
      <FilterSelect value={station} onChange={onStation} placeholder="Todas las estaciones">
        {STATIONS_LIST.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </FilterSelect>
      <FilterSelect value={source} onChange={onSource} placeholder="Todas las fuentes">
        {SOURCES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </FilterSelect>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  placeholder,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 rounded-[10px] border border-[#E8E4DE] bg-white px-3 text-sm text-[#2D2A26] focus:border-[#E87B5A] focus:outline-none"
    >
      <option value="">{placeholder}</option>
      {children}
    </select>
  );
}
