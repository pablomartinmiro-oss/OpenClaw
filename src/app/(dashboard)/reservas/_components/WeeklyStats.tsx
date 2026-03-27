"use client";

import type { ReservationStats } from "@/hooks/useReservations";
import { formatEUR, getStationLabel } from "./constants";

interface WeeklyStatsProps {
  stats: ReservationStats | undefined;
}

export function WeeklyStats({ stats }: WeeklyStatsProps) {
  if (!stats) return null;

  const { weekly } = stats;

  return (
    <div className="space-y-2 border-t border-border p-3">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Resumen semanal
      </h4>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-gray-50 p-2.5">
          <div className="text-lg font-bold text-slate-900">{weekly.totalReservations}</div>
          <div className="text-[10px] text-slate-500">Reservas</div>
        </div>
        <div className="rounded-lg bg-gray-50 p-2.5">
          <div className="text-lg font-bold text-slate-900">{formatEUR(weekly.totalRevenue)}</div>
          <div className="text-[10px] text-slate-500">Ingresos</div>
        </div>
        {weekly.bySource.groupon !== undefined && (
          <div className="rounded-lg bg-gray-50 p-2.5">
            <div className="text-sm font-semibold text-slate-900">{formatEUR(weekly.bySource.groupon || 0)}</div>
            <div className="text-[10px] text-slate-500">Groupon</div>
          </div>
        )}
        {weekly.bySource.caja !== undefined && (
          <div className="rounded-lg bg-gray-50 p-2.5">
            <div className="text-sm font-semibold text-slate-900">{formatEUR(weekly.bySource.caja || 0)}</div>
            <div className="text-[10px] text-slate-500">Caja</div>
          </div>
        )}
      </div>
      {weekly.topStation && (
        <div className="text-xs text-slate-500">
          Estación más activa: <span className="font-medium text-slate-900">{getStationLabel(weekly.topStation.name)}</span> ({weekly.topStation.count} reservas)
        </div>
      )}
    </div>
  );
}
