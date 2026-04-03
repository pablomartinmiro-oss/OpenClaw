"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";
import {
  useInvoices,
  useUpdateInvoice,
  useDeleteInvoice,
} from "@/hooks/useFinance";
import type { Invoice } from "@/hooks/useFinance";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import InvoiceModal from "./InvoiceModal";

const STATUS_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "draft", label: "Borrador" },
  { value: "sent", label: "Enviada" },
  { value: "paid", label: "Pagada" },
  { value: "cancelled", label: "Cancelada" },
];

const STATUS_STYLE: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  sent: "bg-blue-50 text-blue-700",
  paid: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-[#C75D4A]",
};

const fmt = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const selectCls =
  "rounded-[10px] border border-[#E8E4DE] px-3 py-2 text-sm text-[#2D2A26] focus:border-[#E87B5A] focus:outline-none focus:ring-1 focus:ring-[#E87B5A]";

export default function InvoicesTab() {
  const [statusFilter, setStatusFilter] = useState("");
  const { data, isLoading } = useInvoices(statusFilter || undefined);
  const updateInvoice = useUpdateInvoice();
  const deleteInvoice = useDeleteInvoice();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Invoice | null>(null);

  if (isLoading) return <PageSkeleton />;

  const invoices = data?.invoices || [];

  const handleAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const handleEdit = (inv: Invoice) => {
    setEditing(inv);
    setModalOpen(true);
  };

  const handleDelete = async (inv: Invoice) => {
    if (inv.status !== "draft") {
      toast.error("Solo se pueden eliminar borradores");
      return;
    }
    if (!confirm(`Eliminar factura "${inv.number}"?`)) return;
    try {
      await deleteInvoice.mutateAsync(inv.id);
      toast.success("Factura eliminada");
    } catch {
      toast.error("Error al eliminar factura");
    }
  };

  const handleStatusChange = async (inv: Invoice, status: string) => {
    try {
      await updateInvoice.mutateAsync({ id: inv.id, status });
      toast.success("Estado actualizado");
    } catch {
      toast.error("Error al actualizar estado");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={selectCls}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="text-sm text-[#8A8580]">
            {invoices.length} factura{invoices.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 rounded-[10px] bg-[#E87B5A] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#D56E4F] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nueva Factura
        </button>
      </div>

      {invoices.length === 0 ? (
        <div className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-[#8A8580] mb-3" />
          <p className="text-sm text-[#8A8580]">No hay facturas</p>
          <p className="text-xs text-[#8A8580] mt-1">
            Crea tu primera factura para empezar a gestionar la facturacion
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E8E4DE] bg-[#FAF9F7]/50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#8A8580] uppercase tracking-wider">
                    Numero
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#8A8580] uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-[#8A8580] uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[#8A8580] uppercase tracking-wider">
                    Subtotal
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[#8A8580] uppercase tracking-wider">
                    IVA
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[#8A8580] uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#8A8580] uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[#8A8580] uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E4DE]">
                {invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-[#FAF9F7]/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-[#8A8580]" />
                        <span className="font-medium text-sm text-[#2D2A26]">
                          {inv.number}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#8A8580]">
                      {inv.client?.name || "Sin cliente"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <select
                        value={inv.status}
                        onChange={(e) =>
                          handleStatusChange(inv, e.target.value)
                        }
                        className={`inline-flex rounded-[6px] px-2 py-0.5 text-xs font-medium border-0 cursor-pointer ${STATUS_STYLE[inv.status] || "bg-gray-100 text-gray-600"}`}
                      >
                        {STATUS_OPTIONS.filter((o) => o.value).map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-[#8A8580]">
                      {fmt.format(inv.subtotal)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-[#8A8580]">
                      {fmt.format(inv.taxAmount)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-[#2D2A26]">
                      {fmt.format(inv.total)}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#8A8580]">
                      {formatDate(inv.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(inv)}
                          className="rounded-[10px] p-1.5 text-[#8A8580] hover:bg-[#FAF9F7] hover:text-[#E87B5A] transition-colors"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        {inv.status === "draft" && (
                          <button
                            onClick={() => handleDelete(inv)}
                            className="rounded-[10px] p-1.5 text-[#8A8580] hover:bg-red-50 hover:text-[#C75D4A] transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <InvoiceModal
        key={editing?.id ?? "new"}
        invoice={editing}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
