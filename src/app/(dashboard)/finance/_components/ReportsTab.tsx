"use client";

import { useState } from "react";
import { useFinanceReports } from "@/hooks/useFinance";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import { FileBarChart, Download } from "lucide-react";

const fmt = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

const GROUP_OPTIONS = [
  { value: "month", label: "Mes" },
  { value: "channel", label: "Canal" },
  { value: "product", label: "Producto" },
  { value: "category", label: "Categoria" },
  { value: "costCenter", label: "Centro de coste" },
] as const;

const MONTH_NAMES: Record<string, string> = {
  "01": "Enero",
  "02": "Febrero",
  "03": "Marzo",
  "04": "Abril",
  "05": "Mayo",
  "06": "Junio",
  "07": "Julio",
  "08": "Agosto",
  "09": "Septiembre",
  "10": "Octubre",
  "11": "Noviembre",
  "12": "Diciembre",
};

function formatMonth(ym: string): string {
  const [year, month] = ym.split("-");
  return `${MONTH_NAMES[month] ?? month} ${year}`;
}

const inputCls =
  "rounded-[10px] border border-[#E8E4DE] px-3 py-2 text-sm text-[#2D2A26] focus:border-[#E87B5A] focus:outline-none focus:ring-1 focus:ring-[#E87B5A]";

const selectCls =
  "rounded-[10px] border border-[#E8E4DE] px-3 py-2 text-sm text-[#2D2A26] focus:border-[#E87B5A] focus:outline-none focus:ring-1 focus:ring-[#E87B5A]";

type PresetKey = "thisMonth" | "lastMonth" | "thisQuarter" | "thisYear" | "custom";

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function rangeFromPreset(preset: PresetKey): { from: string; to: string } | null {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  if (preset === "thisMonth") {
    return { from: isoDate(new Date(y, m, 1)), to: isoDate(now) };
  }
  if (preset === "lastMonth") {
    return {
      from: isoDate(new Date(y, m - 1, 1)),
      to: isoDate(new Date(y, m, 0)),
    };
  }
  if (preset === "thisQuarter") {
    const qStart = Math.floor(m / 3) * 3;
    return { from: isoDate(new Date(y, qStart, 1)), to: isoDate(now) };
  }
  if (preset === "thisYear") {
    return { from: isoDate(new Date(y, 0, 1)), to: isoDate(now) };
  }
  return null;
}

const PRESETS: { key: PresetKey; label: string }[] = [
  { key: "thisMonth", label: "Este mes" },
  { key: "lastMonth", label: "Mes pasado" },
  { key: "thisQuarter", label: "Trimestre" },
  { key: "thisYear", label: "Ano" },
  { key: "custom", label: "Personalizado" },
];

function csvEscape(v: string | number): string {
  const s = String(v);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function downloadCSV(filename: string, rows: string[][]) {
  const csv = rows.map((r) => r.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function ReportsTab() {
  const year = new Date().getFullYear();
  const [from, setFrom] = useState(`${year}-01-01`);
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [groupBy, setGroupBy] = useState("month");
  const [preset, setPreset] = useState<PresetKey>("thisYear");

  const applyPreset = (p: PresetKey) => {
    setPreset(p);
    const r = rangeFromPreset(p);
    if (r) {
      setFrom(r.from);
      setTo(r.to);
    }
  };

  const { data, isLoading, error } = useFinanceReports(from, to, groupBy);

  const handleExportCSV = () => {
    if (!data) return;
    const rows: string[][] = [];
    rows.push(["Informe P&L", `${from} a ${to}`]);
    rows.push([]);
    rows.push(["Resumen"]);
    rows.push(["Ingresos totales", data.summary.totalRevenue.toFixed(2)]);
    rows.push(["Gastos totales", data.summary.totalExpenses.toFixed(2)]);
    rows.push(["Beneficio neto", data.summary.netProfit.toFixed(2)]);
    rows.push(["Margen %", data.summary.profitMargin.toFixed(2)]);
    rows.push([]);
    rows.push(["Ingresos por concepto", "Importe", "%"]);
    data.revenueByGroup.forEach((r) =>
      rows.push([r.label, r.amount.toFixed(2), r.percentage.toFixed(2)])
    );
    rows.push([]);
    rows.push(["Gastos por concepto", "Importe", "%"]);
    data.expensesByGroup.forEach((r) =>
      rows.push([r.label, r.amount.toFixed(2), r.percentage.toFixed(2)])
    );
    rows.push([]);
    rows.push(["Mes", "Ingresos", "Gastos", "Beneficio"]);
    data.monthlyTrend.forEach((m) =>
      rows.push([
        m.month,
        m.revenue.toFixed(2),
        m.expenses.toFixed(2),
        m.profit.toFixed(2),
      ])
    );
    downloadCSV(`informe-pl-${from}-${to}.csv`, rows);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="rounded-2xl border border-[#E8E4DE] bg-white p-5 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              onClick={() => applyPreset(p.key)}
              className={`rounded-[10px] border px-3 py-1.5 text-sm font-medium transition-colors ${
                preset === p.key
                  ? "border-[#E87B5A] bg-[#E87B5A]/10 text-[#E87B5A]"
                  : "border-[#E8E4DE] text-[#8A8580] hover:bg-[#FAF9F7]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-[#8A8580]">
              Desde
            </label>
            <input
              type="date"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setPreset("custom");
              }}
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#8A8580]">
              Hasta
            </label>
            <input
              type="date"
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setPreset("custom");
              }}
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#8A8580]">
              Agrupar por
            </label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className={selectCls}
            >
              {GROUP_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleExportCSV}
            disabled={!data}
            className="ml-auto flex items-center gap-2 rounded-[10px] border border-[#E8E4DE] px-4 py-2 text-sm font-medium text-[#2D2A26] hover:bg-[#FAF9F7] disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </button>
        </div>
      </div>

      {isLoading && <PageSkeleton />}
      {error && (
        <div className="rounded-2xl border border-[#E8E4DE] bg-white p-8 text-center text-[#8A8580]">
          Error al cargar el informe
        </div>
      )}
      {data && <ReportContent data={data} />}
    </div>
  );
}

function ReportContent({
  data,
}: {
  data: {
    summary: {
      totalRevenue: number;
      totalExpenses: number;
      netProfit: number;
      profitMargin: number;
    };
    revenueByGroup: { label: string; amount: number; percentage: number }[];
    expensesByGroup: { label: string; amount: number; percentage: number }[];
    monthlyTrend: {
      month: string;
      revenue: number;
      expenses: number;
      profit: number;
    }[];
  };
}) {
  const { summary, revenueByGroup, expensesByGroup, monthlyTrend } = data;
  const netPositive = summary.netProfit >= 0;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Ingresos totales"
          value={fmt.format(summary.totalRevenue)}
          color="#5B8C6D"
        />
        <SummaryCard
          label="Gastos totales"
          value={fmt.format(summary.totalExpenses)}
          color="#C75D4A"
        />
        <SummaryCard
          label="Beneficio neto"
          value={fmt.format(summary.netProfit)}
          color={netPositive ? "#5B8C6D" : "#C75D4A"}
        />
        <SummaryCard
          label="Margen %"
          value={`${summary.profitMargin.toFixed(1)}%`}
          color={netPositive ? "#5B8C6D" : "#C75D4A"}
        />
      </div>

      {/* Revenue + Expenses tables side by side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GroupTable
          title="Desglose de ingresos"
          rows={revenueByGroup}
          emptyText="Sin ingresos en el periodo"
        />
        <GroupTable
          title="Desglose de gastos"
          rows={expensesByGroup}
          emptyText="Sin gastos en el periodo"
        />
      </div>

      {/* Monthly trend table */}
      <div className="rounded-2xl border border-[#E8E4DE] bg-white p-5">
        <h3 className="mb-4 text-sm font-semibold text-[#2D2A26]">
          Tendencia mensual
        </h3>
        {monthlyTrend.length === 0 ? (
          <p className="text-sm text-[#8A8580]">Sin datos</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E8E4DE] text-left text-xs text-[#8A8580]">
                  <th className="pb-2 pr-4 font-medium">Mes</th>
                  <th className="pb-2 pr-4 text-right font-medium">
                    Ingresos
                  </th>
                  <th className="pb-2 pr-4 text-right font-medium">Gastos</th>
                  <th className="pb-2 text-right font-medium">Beneficio</th>
                </tr>
              </thead>
              <tbody>
                {monthlyTrend.map((row) => (
                  <tr
                    key={row.month}
                    className="border-b border-[#E8E4DE] last:border-0"
                  >
                    <td className="py-2.5 pr-4 text-[#2D2A26]">
                      {formatMonth(row.month)}
                    </td>
                    <td className="py-2.5 pr-4 text-right font-medium text-[#5B8C6D]">
                      {fmt.format(row.revenue)}
                    </td>
                    <td className="py-2.5 pr-4 text-right font-medium text-[#C75D4A]">
                      {fmt.format(row.expenses)}
                    </td>
                    <td
                      className={`py-2.5 text-right font-semibold ${
                        row.profit >= 0 ? "text-[#5B8C6D]" : "text-[#C75D4A]"
                      }`}
                    >
                      {fmt.format(row.profit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-[#E8E4DE] bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#8A8580]">{label}</p>
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${color}15` }}
        >
          <FileBarChart className="h-4 w-4" style={{ color }} />
        </div>
      </div>
      <p className="mt-2 text-2xl font-bold text-[#2D2A26]">{value}</p>
    </div>
  );
}

function GroupTable({
  title,
  rows,
  emptyText,
}: {
  title: string;
  rows: { label: string; amount: number; percentage: number }[];
  emptyText: string;
}) {
  return (
    <div className="rounded-2xl border border-[#E8E4DE] bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold text-[#2D2A26]">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-[#8A8580]">{emptyText}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E8E4DE] text-left text-xs text-[#8A8580]">
                <th className="pb-2 pr-4 font-medium">Concepto</th>
                <th className="pb-2 pr-4 text-right font-medium">Importe</th>
                <th className="pb-2 text-right font-medium">%</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.label}
                  className="border-b border-[#E8E4DE] last:border-0"
                >
                  <td className="py-2.5 pr-4 text-[#2D2A26]">{r.label}</td>
                  <td className="py-2.5 pr-4 text-right font-medium text-[#2D2A26]">
                    {fmt.format(r.amount)}
                  </td>
                  <td className="py-2.5 text-right text-[#8A8580]">
                    {r.percentage.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
