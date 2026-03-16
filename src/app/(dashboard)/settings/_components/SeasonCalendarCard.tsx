"use client";

import { useState } from "react";
import { Plus, Trash2, Calendar, Snowflake, Sun, X } from "lucide-react";
import { toast } from "sonner";
import {
  useSeasonCalendar,
  useCreateSeasonEntry,
  useDeleteSeasonEntry,
  type SeasonCalendarEntry,
} from "@/hooks/useSeasonCalendar";

const STATION_OPTIONS = [
  { value: "all", label: "Todas las estaciones" },
  { value: "baqueira", label: "Baqueira Beret" },
  { value: "sierra_nevada", label: "Sierra Nevada" },
  { value: "valdesqui", label: "Valdesquí" },
  { value: "la_pinilla", label: "La Pinilla" },
  { value: "grandvalira", label: "Grandvalira" },
  { value: "formigal", label: "Formigal" },
  { value: "alto_campoo", label: "Alto Campoo" },
];

const STATION_LABELS: Record<string, string> = Object.fromEntries(
  STATION_OPTIONS.map((s) => [s.value, s.label])
);

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function SeasonCalendarCard() {
  const { data: entries, isLoading } = useSeasonCalendar();
  const createEntry = useCreateSeasonEntry();
  const deleteEntry = useDeleteSeasonEntry();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    station: "all",
    season: "alta" as "media" | "alta",
    startDate: "",
    endDate: "",
    label: "",
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.startDate || !form.endDate) {
      toast.error("Selecciona fechas de inicio y fin");
      return;
    }
    try {
      await createEntry.mutateAsync(form);
      toast.success("Periodo de temporada creado");
      setForm({ station: "all", season: "alta", startDate: "", endDate: "", label: "" });
      setShowForm(false);
    } catch {
      toast.error("Error al crear periodo");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este periodo de temporada?")) return;
    try {
      await deleteEntry.mutateAsync(id);
      toast.success("Periodo eliminado");
    } catch {
      toast.error("Error al eliminar");
    }
  };

  // Group entries by station
  const grouped = (entries || []).reduce<Record<string, SeasonCalendarEntry[]>>((acc, e) => {
    if (!acc[e.station]) acc[e.station] = [];
    acc[e.station].push(e);
    return acc;
  }, {});

  return (
    <div className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-coral" />
          <h3 className="text-lg font-semibold text-text-primary">Calendario de Temporadas</h3>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 rounded-lg bg-coral px-3 py-2 text-sm font-medium text-white hover:bg-coral-hover transition-colors"
        >
          <Plus className="h-4 w-4" />
          Añadir periodo
        </button>
      </div>

      <div className="p-6 space-y-4">
        {/* Add form */}
        {showForm && (
          <form onSubmit={handleCreate} className="rounded-lg border border-border p-4 space-y-3 bg-surface/30">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-text-primary">Nuevo periodo</h4>
              <button type="button" onClick={() => setShowForm(false)} className="text-text-secondary hover:text-text-primary">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <label className="block text-xs text-text-secondary mb-1">Estación</label>
                <select
                  value={form.station}
                  onChange={(e) => setForm({ ...form, station: e.target.value })}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-coral focus:outline-none"
                >
                  {STATION_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">Temporada</label>
                <select
                  value={form.season}
                  onChange={(e) => setForm({ ...form, season: e.target.value as "media" | "alta" })}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-coral focus:outline-none"
                >
                  <option value="alta">Temporada Alta</option>
                  <option value="media">Temporada Media</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">Fecha inicio</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-coral focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">Fecha fin</label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-coral focus:outline-none"
                  required
                />
              </div>
            </div>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="block text-xs text-text-secondary mb-1">Etiqueta (opcional)</label>
                <input
                  type="text"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  placeholder="Ej: Navidades, Semana Santa..."
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-coral focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={createEntry.isPending}
                className="rounded-lg bg-coral px-4 py-2 text-sm font-medium text-white hover:bg-coral-hover disabled:opacity-50 transition-colors"
              >
                Crear
              </button>
            </div>
          </form>
        )}

        {/* Entries list */}
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded-lg bg-surface" />
            ))}
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-text-secondary">
            No hay periodos de temporada configurados.
            <br />
            Todo será Temporada Media por defecto.
          </div>
        ) : (
          Object.entries(grouped).map(([station, stationEntries]) => (
            <div key={station}>
              <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                {STATION_LABELS[station] || station}
              </h4>
              <div className="space-y-2">
                {stationEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        entry.season === "alta"
                          ? "bg-coral-light text-coral"
                          : "bg-sage-light text-sage"
                      }`}>
                        {entry.season === "alta" ? <Snowflake className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
                        {entry.season === "alta" ? "Alta" : "Media"}
                      </span>
                      <span className="text-sm text-text-primary">
                        {formatDate(entry.startDate)} — {formatDate(entry.endDate)}
                      </span>
                      {entry.label && (
                        <span className="text-xs text-text-secondary">({entry.label})</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="rounded-lg p-1.5 text-text-secondary hover:bg-red-50 hover:text-danger transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
