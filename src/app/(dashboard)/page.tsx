"use client";

import { useMemo } from "react";
import { FileText, Send, TrendingUp, Euro } from "lucide-react";
import { useQuotes } from "@/hooks/useQuotes";
import { StatCard } from "./_components/StatCard";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(value);
}

const DESTINATION_LABELS: Record<string, string> = {
  baqueira: "Baqueira",
  sierra_nevada: "Sierra Nevada",
  formigal: "Formigal",
  alto_campoo: "Alto Campoo",
  grandvalira: "Grandvalira",
};

const STATUS_COLORS: Record<string, string> = {
  nuevo: "bg-blue-500",
  en_proceso: "bg-yellow-500",
  enviado: "bg-green-500",
  aceptado: "bg-purple",
};

export default function DashboardHome() {
  const { data: quotes, isLoading } = useQuotes();

  const allQuotes = useMemo(() => quotes ?? [], [quotes]);

  const thisMonth = allQuotes.filter((q) => {
    const d = new Date(q.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const sent = allQuotes.filter((q) => q.status === "enviado" || q.status === "aceptado");
  const accepted = allQuotes.filter((q) => q.status === "aceptado");
  const conversionRate = sent.length > 0 ? Math.round((accepted.length / sent.length) * 100) : 0;
  const avgValue = sent.length > 0
    ? sent.reduce((sum, q) => sum + q.totalAmount, 0) / sent.length
    : 0;

  // By destination
  const byDestination = useMemo(() => {
    const map: Record<string, number> = {};
    for (const q of allQuotes) {
      map[q.destination] = (map[q.destination] || 0) + 1;
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [allQuotes]);

  const maxDestCount = Math.max(1, ...byDestination.map(([, c]) => c));

  // By status
  const byStatus = useMemo(() => {
    const map: Record<string, number> = { nuevo: 0, en_proceso: 0, enviado: 0, aceptado: 0 };
    for (const q of allQuotes) {
      map[q.status] = (map[q.status] || 0) + 1;
    }
    return map;
  }, [allQuotes]);

  // Weekly chart data (placeholder for demo)
  const weeklyData = [3, 5, 4, 7, 2, 6, 4];

  // Recent quotes
  const recentQuotes = allQuotes.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Dashboard</h1>
        <p className="text-sm text-text-secondary">
          Resumen de actividad de Skicenter
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Presupuestos Este Mes"
          value={thisMonth.length}
          description={`${allQuotes.length} total`}
          icon={FileText}
          loading={isLoading}
          iconColor="text-cyan"
          iconBg="bg-cyan-light"
        />
        <StatCard
          title="Presupuestos Enviados"
          value={sent.length}
          description={`${byStatus.nuevo} pendientes`}
          icon={Send}
          loading={isLoading}
          iconColor="text-purple"
          iconBg="bg-purple-light"
        />
        <StatCard
          title="Tasa de Conversión"
          value={`${conversionRate}%`}
          description={`${accepted.length} aceptados`}
          icon={TrendingUp}
          loading={isLoading}
          iconColor="text-success"
          iconBg="bg-success/10"
        />
        <StatCard
          title="Valor Medio"
          value={formatCurrency(avgValue)}
          description="por presupuesto"
          icon={Euro}
          loading={isLoading}
          iconColor="text-warning"
          iconBg="bg-warning/10"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly volume */}
        <div className="rounded-[14px] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-text-primary">Volumen Semanal</h2>
            <span className="text-xs text-text-secondary">Últimos 7 días</span>
          </div>
          <div className="flex h-48 items-end gap-1">
            {weeklyData.map((val, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-cyan to-cyan/40 transition-all"
                  style={{ height: `${(val / 8) * 100}%` }}
                />
                <span className="text-[10px] text-text-secondary">
                  {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* By destination */}
        <div className="rounded-[14px] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-text-primary">Por Destino</h2>
            <span className="text-xs text-text-secondary">{allQuotes.length} presupuestos</span>
          </div>
          <div className="space-y-3">
            {byDestination.map(([dest, count], i) => {
              const pct = (count / maxDestCount) * 100;
              const colors = ["bg-cyan", "bg-purple", "bg-success", "bg-warning", "bg-danger"];
              return (
                <div key={dest}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm text-text-primary">
                      {DESTINATION_LABELS[dest] || dest}
                    </span>
                    <span className="text-xs font-medium text-text-secondary">{count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${colors[i % colors.length]} transition-all`}
                      style={{ width: `${Math.max(pct, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {byDestination.length === 0 && !isLoading && (
              <p className="py-8 text-center text-sm text-text-secondary">Sin datos</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-[14px] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-text-primary">Actividad Reciente</h2>
        </div>
        <div className="space-y-3">
          {recentQuotes.map((quote) => {
            const statusLabel: Record<string, string> = {
              nuevo: "Nuevo",
              en_proceso: "En Proceso",
              enviado: "Enviado",
              aceptado: "Aceptado",
            };
            return (
              <div
                key={quote.id}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${STATUS_COLORS[quote.status] || "bg-gray-400"}`}
                  />
                  <div>
                    <p className="text-sm font-medium text-text-primary">{quote.clientName}</p>
                    <p className="text-xs text-text-secondary">
                      {DESTINATION_LABELS[quote.destination]} ·{" "}
                      {new Date(quote.createdAt).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-medium text-text-secondary">
                  {statusLabel[quote.status] || quote.status}
                </span>
              </div>
            );
          })}
          {recentQuotes.length === 0 && !isLoading && (
            <p className="py-4 text-center text-sm text-text-secondary">
              Sin actividad reciente
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
