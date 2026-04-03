"use client";

import { useState } from "react";
import { Trash2, Receipt, Eye, X } from "lucide-react";
import { toast } from "sonner";
import {
  useSessions,
  useSales,
  useDeleteSale,
} from "@/hooks/useTpv";
import type { TpvSale, PaymentMethods } from "@/hooks/useTpv";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";

const fmt = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });
const dtf = new Intl.DateTimeFormat("es-ES", {
  dateStyle: "short",
  timeStyle: "short",
});

function formatPaymentMethods(pm: PaymentMethods) {
  const parts: string[] = [];
  if (pm.cash > 0) parts.push(`Efectivo: ${fmt.format(pm.cash)}`);
  if (pm.card > 0) parts.push(`Tarjeta: ${fmt.format(pm.card)}`);
  if (pm.bizum > 0) parts.push(`Bizum: ${fmt.format(pm.bizum)}`);
  return parts.length > 0 ? parts.join(", ") : "—";
}

export default function SalesTab() {
  const { data: sessData } = useSessions();
  const sessions = sessData?.sessions ?? [];

  const [filterSession, setFilterSession] = useState<string>("");
  const [filterDate, setFilterDate] = useState<string>("");
  const [detailSale, setDetailSale] = useState<TpvSale | null>(null);

  const { data, isLoading } = useSales(
    filterSession || undefined,
    filterDate || undefined
  );
  const deleteSale = useDeleteSale();

  if (isLoading) return <PageSkeleton />;

  const sales = data?.sales ?? [];

  const handleDelete = async (sale: TpvSale) => {
    if (!confirm(`Eliminar el ticket "${sale.ticketNumber}"?`)) return;
    try {
      await deleteSale.mutateAsync(sale.id);
      toast.success("Venta eliminada");
    } catch {
      toast.error("Error al eliminar venta");
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filterSession}
          onChange={(e) => setFilterSession(e.target.value)}
          className="rounded-[10px] border border-[#E8E4DE] px-3 py-2 text-sm focus:border-[#E87B5A] focus:outline-none"
        >
          <option value="">Todas las sesiones</option>
          {sessions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.register?.name} — {dtf.format(new Date(s.openedAt))}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="rounded-[10px] border border-[#E8E4DE] px-3 py-2 text-sm focus:border-[#E87B5A] focus:outline-none"
        />
        {filterDate && (
          <button
            onClick={() => setFilterDate("")}
            className="text-xs text-[#8A8580] hover:text-[#E87B5A]"
          >
            Limpiar fecha
          </button>
        )}
      </div>

      {sales.length === 0 ? (
        <div className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-12 text-center">
          <Receipt className="mx-auto h-10 w-10 text-[#8A8580] mb-3" />
          <p className="text-sm text-[#8A8580]">No hay ventas registradas</p>
          <p className="text-xs text-[#8A8580] mt-1">
            Las ventas se crean desde una sesion abierta
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E8E4DE] bg-[#FAF9F7]/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#8A8580] uppercase tracking-wider">Ticket</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#8A8580] uppercase tracking-wider">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#8A8580] uppercase tracking-wider">Caja</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[#8A8580] uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[#8A8580] uppercase tracking-wider">Descuento</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[#8A8580] uppercase tracking-wider">IVA</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#8A8580] uppercase tracking-wider">Metodos pago</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[#8A8580] uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E4DE]">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-[#FAF9F7]/30 transition-colors">
                    <td className="px-4 py-4">
                      <span className="rounded-[6px] bg-[#FAF9F7] px-2 py-0.5 text-xs font-mono text-[#2D2A26]">
                        {sale.ticketNumber}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-[#8A8580]">{dtf.format(new Date(sale.date))}</td>
                    <td className="px-4 py-4 text-sm text-[#8A8580]">{sale.session?.register?.name ?? "—"}</td>
                    <td className="px-4 py-4 text-right text-sm font-medium text-[#2D2A26]">{fmt.format(sale.totalAmount)}</td>
                    <td className="px-4 py-4 text-right text-sm text-[#8A8580]">
                      {sale.discountApplied ? fmt.format(sale.discountApplied) : "—"}
                    </td>
                    <td className="px-4 py-4 text-right text-sm text-[#8A8580]">{fmt.format(sale.totalTax)}</td>
                    <td className="px-4 py-4 text-sm text-[#8A8580]">
                      {formatPaymentMethods(sale.paymentMethods)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setDetailSale(sale)}
                          className="rounded-[10px] p-1.5 text-[#8A8580] hover:bg-[#FAF9F7] hover:text-[#E87B5A] transition-colors"
                          title="Ver detalle"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(sale)}
                          className="rounded-[10px] p-1.5 text-[#8A8580] hover:bg-red-50 hover:text-[#C75D4A] transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sale detail modal */}
      {detailSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#2D2A26]">
                Detalle de venta {detailSale.ticketNumber}
              </h2>
              <button onClick={() => setDetailSale(null)} className="text-[#8A8580] hover:text-[#2D2A26]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-[#8A8580]">Fecha</span>
                <span className="text-[#2D2A26]">{dtf.format(new Date(detailSale.date))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#8A8580]">Total</span>
                <span className="font-medium text-[#2D2A26]">{fmt.format(detailSale.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#8A8580]">IVA</span>
                <span className="text-[#2D2A26]">{fmt.format(detailSale.totalTax)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#8A8580]">Pagos</span>
                <span className="text-[#2D2A26]">{formatPaymentMethods(detailSale.paymentMethods)}</span>
              </div>
            </div>
            {detailSale.items && detailSale.items.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-[#2D2A26] mb-2">Lineas</h3>
                <div className="rounded-[10px] border border-[#E8E4DE] overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#FAF9F7]/50 text-xs text-[#8A8580]">
                        <th className="px-3 py-2 text-left">Descripcion</th>
                        <th className="px-3 py-2 text-center">Cant.</th>
                        <th className="px-3 py-2 text-right">P. Unit.</th>
                        <th className="px-3 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E4DE]">
                      {detailSale.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-3 py-2 text-sm text-[#2D2A26]">{item.description}</td>
                          <td className="px-3 py-2 text-center text-sm text-[#8A8580]">{item.quantity}</td>
                          <td className="px-3 py-2 text-right text-sm text-[#8A8580]">{fmt.format(item.unitPrice)}</td>
                          <td className="px-3 py-2 text-right text-sm font-medium text-[#2D2A26]">{fmt.format(item.lineTotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setDetailSale(null)}
                className="rounded-[10px] border border-[#E8E4DE] px-4 py-2 text-sm font-medium text-[#8A8580] hover:bg-[#FAF9F7] transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
