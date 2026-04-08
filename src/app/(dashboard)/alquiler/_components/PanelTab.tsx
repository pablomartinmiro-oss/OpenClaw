"use client";

import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Activity,
  Euro,
  AlertTriangle,
} from "lucide-react";
import { useRentalDashboard } from "@/hooks/useRental";

const fmt = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

const EQUIP_LABELS: Record<string, string> = {
  SKI: "Esquis",
  BOOT: "Botas",
  POLE: "Bastones",
  HELMET: "Casco",
  SNOWBOARD: "Snowboard",
  SNOWBOARD_BOOT: "Botas Snow",
};

export default function PanelTab() {
  const { data, isLoading } = useRentalDashboard();

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-[#E8E4DE] rounded-[16px]" />
          ))}
        </div>
        <div className="h-48 bg-[#E8E4DE] rounded-[16px]" />
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    {
      label: "Recogidas Hoy",
      value: data.pickupsToday,
      icon: ArrowDownToLine,
      color: "#D4A853",
    },
    {
      label: "Devoluciones Hoy",
      value: data.returnsToday,
      icon: ArrowUpFromLine,
      color: "#5B8C6D",
    },
    {
      label: "Alquileres Activos",
      value: data.activeRentals,
      icon: Activity,
      color: "#E87B5A",
    },
    {
      label: "Ingresos Hoy",
      value: fmt.format(data.revenueToday),
      icon: Euro,
      color: "#5B8C6D",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="rounded-[16px] border border-[#E8E4DE] bg-white p-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-[10px]"
                  style={{ backgroundColor: `${s.color}26` }}
                >
                  <Icon className="h-5 w-5" style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-xs text-[#8A8580]">{s.label}</p>
                  <p className="text-xl font-bold text-[#2D2A26]">
                    {s.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Low stock alerts */}
      {data.lowStockAlerts.length > 0 && (
        <div className="rounded-[16px] border border-[#D4A853]/30 bg-[#D4A853]/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-[#D4A853]" />
            <h3 className="text-sm font-semibold text-[#2D2A26]">
              Alertas de Stock Bajo
            </h3>
          </div>
          <div className="space-y-2">
            {data.lowStockAlerts.map((alert, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-[#2D2A26]">
                  {EQUIP_LABELS[alert.equipmentType] ?? alert.equipmentType}{" "}
                  — Talla {alert.size} ({alert.qualityTier}) en{" "}
                  {alert.stationSlug}
                </span>
                <span className="font-medium text-[#C75D4A]">
                  {alert.availableQuantity} disponibles
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed today */}
      {data.completedToday > 0 && (
        <div className="rounded-[16px] border border-[#E8E4DE] bg-white p-4">
          <p className="text-sm text-[#8A8580]">
            Completados hoy:{" "}
            <span className="font-semibold text-[#5B8C6D]">
              {data.completedToday} pedidos
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
