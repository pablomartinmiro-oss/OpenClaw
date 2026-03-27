"use client";

import { useState, useRef, useEffect } from "react";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type DateRange = "7d" | "30d" | "90d" | "custom" | null;

export interface ContactFilters {
  dateRange: DateRange;
  customDateFrom: string;
  customDateTo: string;
  hasEmail: boolean | null;
  hasPhone: boolean | null;
  tags: string[];
}

export const DEFAULT_FILTERS: ContactFilters = {
  dateRange: null,
  customDateFrom: "",
  customDateTo: "",
  hasEmail: null,
  hasPhone: null,
  tags: [],
};

export function countActiveFilters(filters: ContactFilters): number {
  let count = 0;
  if (filters.dateRange) count++;
  if (filters.hasEmail !== null) count++;
  if (filters.hasPhone !== null) count++;
  if (filters.tags.length > 0) count++;
  return count;
}

interface AdvancedFiltersProps {
  filters: ContactFilters;
  onChange: (filters: ContactFilters) => void;
  availableTags: string[];
}

const DATE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: "7d", label: "Últimos 7 días" },
  { value: "30d", label: "Últimos 30 días" },
  { value: "90d", label: "Últimos 90 días" },
  { value: "custom", label: "Personalizado" },
];

const BOOL_OPTIONS: { value: boolean | null; label: string }[] = [
  { value: null, label: "Todos" },
  { value: true, label: "Sí" },
  { value: false, label: "No" },
];

export function AdvancedFilters({ filters, onChange, availableTags }: AdvancedFiltersProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const activeCount = countActiveFilters(filters);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function update(partial: Partial<ContactFilters>) {
    onChange({ ...filters, ...partial });
  }

  function clearAll() {
    onChange(DEFAULT_FILTERS);
  }

  function toggleTag(tag: string) {
    const next = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    update({ tags: next });
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
          open || activeCount > 0
            ? "border-blue-500 bg-blue-50 text-blue-700"
            : "border-border bg-white text-slate-600 hover:bg-slate-50"
        )}
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filtros
        {activeCount > 0 && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-semibold text-white">
            {activeCount}
          </span>
        )}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-72 sm:w-80 rounded-2xl border border-border bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)] p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-900">Filtros avanzados</span>
            {activeCount > 0 && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-600 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                Limpiar filtros
              </button>
            )}
          </div>

          {/* Date added */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Fecha de registro</p>
            <div className="flex flex-wrap gap-1.5">
              {DATE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => update({ dateRange: filters.dateRange === opt.value ? null : opt.value })}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                    filters.dateRange === opt.value
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {filters.dateRange === "custom" && (
              <div className="mt-2 flex gap-2">
                <input
                  type="date"
                  value={filters.customDateFrom}
                  onChange={(e) => update({ customDateFrom: e.target.value })}
                  className="flex-1 rounded-lg border border-border px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Desde"
                />
                <input
                  type="date"
                  value={filters.customDateTo}
                  onChange={(e) => update({ customDateTo: e.target.value })}
                  className="flex-1 rounded-lg border border-border px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Hasta"
                />
              </div>
            )}
          </div>

          {/* Has email */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Tiene email</p>
            <div className="flex gap-1.5">
              {BOOL_OPTIONS.map((opt) => (
                <button
                  key={String(opt.value)}
                  onClick={() => update({ hasEmail: opt.value })}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                    filters.hasEmail === opt.value
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Has phone */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Tiene teléfono</p>
            <div className="flex gap-1.5">
              {BOOL_OPTIONS.map((opt) => (
                <button
                  key={String(opt.value)}
                  onClick={() => update({ hasPhone: opt.value })}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                    filters.hasPhone === opt.value
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          {availableTags.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Etiquetas</p>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                      filters.tags.includes(tag)
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
