"use client";

import {
  TrendingUp,
  TrendingDown,
  Receipt,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useFinanceDashboard } from "@/hooks/useFinance";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";

const fmt = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

const STATUS_LABELS: Record<string, string> = {
  draft: "Borrador",
  sent: "Enviada",
  paid: "Pagada",
  cancelled: "Cancelada",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-50 text-blue-700",
  paid: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-[#C75D4A]",
};

const METHOD_LABELS: Record<string, string> = {
  card: "Tarjeta",
  transfer: "Transferencia",
  cash: "Efectivo",
  bizum: "Bizum",
};

const TX_STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  completed: "Completado",
  failed: "Fallido",
};

const TX_STATUS_COLORS: Record<string, string> = {
  pending: "bg-[#D4A853]/15 text-[#D4A853]",
  completed: "bg-[#5B8C6D]/15 text-[#5B8C6D]",
  failed: "bg-[#C75D4A]/15 text-[#C75D4A]",
};

function SummaryCard({
  label,
  value,
  icon: Icon,
  iconColor,
  subtext,
}: {
  label: string;
  value: string;
  icon: typeof TrendingUp;
  iconColor: string;
  subtext?: string;
}) {
  return (
    <div className="rounded-2xl border border-[#E8E4DE] bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#8A8580]">{label}</p>
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${iconColor}15` }}
        >
          <Icon className="h-4 w-4" style={{ color: iconColor }} />
        </div>
      </div>
      <p className="mt-2 text-2xl font-bold text-[#2D2A26]">{value}</p>
      {subtext && (
        <p className="mt-1 text-xs text-[#8A8580]">{subtext}</p>
      )}
    </div>
  );
}

export default function DashboardTab() {
  const { data, isLoading, error } = useFinanceDashboard();

  if (isLoading) return <PageSkeleton />;
  if (error || !data) {
    return (
      <div className="rounded-2xl border border-[#E8E4DE] bg-white p-8 text-center text-[#8A8580]">
        Error al cargar el resumen financiero
      </div>
    );
  }

  const { summary, invoiceByStatus, expensesByCategory, recentTransactions } =
    data;

  const netIsPositive = summary.netProfit >= 0;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Total facturado"
          value={fmt.format(summary.totalInvoiced)}
          icon={TrendingUp}
          iconColor="#5B8C6D"
        />
        <SummaryCard
          label="Total gastos"
          value={fmt.format(summary.totalExpenses)}
          icon={TrendingDown}
          iconColor="#C75D4A"
        />
        <SummaryCard
          label="Beneficio neto"
          value={fmt.format(summary.netProfit)}
          icon={netIsPositive ? ArrowUpRight : ArrowDownRight}
          iconColor={netIsPositive ? "#5B8C6D" : "#C75D4A"}
        />
        <SummaryCard
          label="Facturas pendientes"
          value={String(summary.pendingInvoices)}
          icon={summary.pendingInvoices > 0 ? AlertCircle : Receipt}
          iconColor={summary.pendingInvoices > 0 ? "#D4A853" : "#8A8580"}
          subtext="Borrador + Enviada"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue by status */}
        <div className="rounded-2xl border border-[#E8E4DE] bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-[#2D2A26]">
            Facturacion por estado
          </h3>
          {invoiceByStatus.length === 0 ? (
            <p className="text-sm text-[#8A8580]">Sin facturas</p>
          ) : (
            <div className="space-y-3">
              {invoiceByStatus.map((s) => (
                <div
                  key={s.status}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[s.status] ?? "bg-gray-100 text-gray-700"}`}
                    >
                      {STATUS_LABELS[s.status] ?? s.status}
                    </span>
                    <span className="text-xs text-[#8A8580]">
                      ({s.count})
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-[#2D2A26]">
                    {fmt.format(s.total)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expenses by category */}
        <div className="rounded-2xl border border-[#E8E4DE] bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-[#2D2A26]">
            Gastos por categoria
          </h3>
          {expensesByCategory.length === 0 ? (
            <p className="text-sm text-[#8A8580]">Sin gastos</p>
          ) : (
            <div className="space-y-3">
              {expensesByCategory.map((e) => (
                <div
                  key={e.categoryId}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-[#2D2A26]">
                    {e.categoryName}
                  </span>
                  <span className="text-sm font-semibold text-[#2D2A26]">
                    {fmt.format(e.total)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="rounded-2xl border border-[#E8E4DE] bg-white p-5">
        <h3 className="mb-4 text-sm font-semibold text-[#2D2A26]">
          Ultimas transacciones
        </h3>
        {recentTransactions.length === 0 ? (
          <p className="text-sm text-[#8A8580]">
            Sin transacciones recientes
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E8E4DE] text-left text-xs text-[#8A8580]">
                  <th className="pb-2 pr-4 font-medium">Fecha</th>
                  <th className="pb-2 pr-4 font-medium">Factura</th>
                  <th className="pb-2 pr-4 font-medium">Metodo</th>
                  <th className="pb-2 pr-4 font-medium">Estado</th>
                  <th className="pb-2 text-right font-medium">Importe</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-b border-[#E8E4DE] last:border-0"
                  >
                    <td className="py-2.5 pr-4 text-[#2D2A26]">
                      {new Date(tx.date).toLocaleDateString("es-ES")}
                    </td>
                    <td className="py-2.5 pr-4 text-[#8A8580]">
                      {tx.invoice?.number ?? "-"}
                    </td>
                    <td className="py-2.5 pr-4 text-[#2D2A26]">
                      {METHOD_LABELS[tx.method] ?? tx.method}
                    </td>
                    <td className="py-2.5 pr-4">
                      <span
                        className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${TX_STATUS_COLORS[tx.status] ?? "bg-gray-100 text-gray-700"}`}
                      >
                        {TX_STATUS_LABELS[tx.status] ?? tx.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-semibold text-[#2D2A26]">
                      {fmt.format(tx.amount)}
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
