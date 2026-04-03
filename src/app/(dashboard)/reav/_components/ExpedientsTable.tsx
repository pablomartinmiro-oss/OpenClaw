"use client";

import { useState, Fragment } from "react";
import {
  Plus, Trash2, ChevronDown, ChevronRight, Scale, FileText,
} from "lucide-react";
import { toast } from "sonner";
import {
  useReavExpedients, useCreateReavExpedient, useUpdateReavExpedient,
  useDeleteReavExpedient, useAddReavCost, useDeleteReavCost,
  useAddReavDocument, useDeleteReavDocument,
} from "@/hooks/useReav";
import type { ReavExpedient } from "@/hooks/useReav";
import { useInvoices } from "@/hooks/useFinance";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import ExpedientModal from "./ExpedientModal";
import ExpedientDetail from "./ExpedientDetail";

const fmt = new Intl.NumberFormat("es-ES", {
  style: "currency", currency: "EUR",
});

const OP_LABELS: Record<string, string> = {
  standard: "Estandar",
  intra_eu: "Intra-UE",
  extra_eu: "Extra-UE",
  mixed: "Mixta",
};

export default function ExpedientsTable() {
  const { data, isLoading } = useReavExpedients();
  const { data: invoiceData, isLoading: invoicesLoading } = useInvoices();
  const createExp = useCreateReavExpedient();
  const updateExp = useUpdateReavExpedient();
  const deleteExp = useDeleteReavExpedient();
  const addCost = useAddReavCost();
  const delCost = useDeleteReavCost();
  const addDoc = useAddReavDocument();
  const delDoc = useDeleteReavDocument();

  const [modalOpen, setModalOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading || invoicesLoading) return <PageSkeleton />;

  const expedients = data?.expedients || [];
  const invoices = invoiceData?.invoices || [];

  const handleCreate = async (d: {
    invoiceId: string; operationType: string;
    costPercentage: number; marginPercentage: number;
    marginAmount: number; taxableBase: number; vat: number;
  }) => {
    try {
      await createExp.mutateAsync(d);
      toast.success("Expediente REAV creado");
      setModalOpen(false);
    } catch {
      toast.error("Error al crear expediente");
    }
  };

  const handleUpdate = async (
    id: string,
    d: Partial<{
      operationType: string; costPercentage: number;
      marginPercentage: number; marginAmount: number;
      taxableBase: number; vat: number;
    }>
  ) => {
    try {
      await updateExp.mutateAsync({ id, ...d });
      toast.success("Expediente actualizado");
    } catch {
      toast.error("Error al actualizar expediente");
    }
  };

  const handleDelete = async (e: ReavExpedient) => {
    if (!confirm("Eliminar este expediente REAV?")) return;
    try {
      await deleteExp.mutateAsync(e.id);
      toast.success("Expediente eliminado");
      if (expandedId === e.id) setExpandedId(null);
    } catch {
      toast.error("Error al eliminar expediente");
    }
  };

  const handleAddCost = async (
    expedientId: string,
    d: { description: string; cost: number; notes?: string | null }
  ) => {
    try {
      await addCost.mutateAsync({ expedientId, ...d });
      toast.success("Coste anadido");
    } catch {
      toast.error("Error al anadir coste");
    }
  };

  const handleDeleteCost = async (expedientId: string, costId: string) => {
    try {
      await delCost.mutateAsync({ expedientId, costId });
      toast.success("Coste eliminado");
    } catch {
      toast.error("Error al eliminar coste");
    }
  };

  const handleAddDocument = async (
    expedientId: string,
    d: { type: string; url: string }
  ) => {
    try {
      await addDoc.mutateAsync({ expedientId, ...d });
      toast.success("Documento anadido");
    } catch {
      toast.error("Error al anadir documento");
    }
  };

  const handleDeleteDocument = async (expedientId: string, docId: string) => {
    try {
      await delDoc.mutateAsync({ expedientId, docId });
      toast.success("Documento eliminado");
    } catch {
      toast.error("Error al eliminar documento");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#8A8580]">
          {expedients.length} expediente{expedients.length !== 1 ? "s" : ""}
        </p>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-[10px] bg-[#E87B5A] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#D56E4F] transition-colors"
        >
          <Plus className="h-4 w-4" /> Nuevo Expediente
        </button>
      </div>

      {expedients.length === 0 ? (
        <div className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-12 text-center">
          <Scale className="mx-auto h-10 w-10 text-[#8A8580] mb-3" />
          <p className="text-sm text-[#8A8580]">
            No hay expedientes REAV creados
          </p>
          <p className="text-xs text-[#8A8580] mt-1">
            Crea tu primer expediente vinculado a una factura
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E8E4DE] bg-[#FAF9F7]/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#8A8580] uppercase tracking-wider w-8" />
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#8A8580] uppercase tracking-wider">
                    N. Factura
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#8A8580] uppercase tracking-wider">
                    Tipo operacion
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[#8A8580] uppercase tracking-wider">
                    Coste %
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[#8A8580] uppercase tracking-wider">
                    Margen %
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[#8A8580] uppercase tracking-wider">
                    Base imponible
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[#8A8580] uppercase tracking-wider">
                    IVA
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-[#8A8580] uppercase tracking-wider">
                    Costes
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[#8A8580] uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E4DE]">
                {expedients.map((e) => (
                  <Fragment key={e.id}>
                    <tr className="hover:bg-[#FAF9F7]/30 transition-colors">
                      <td className="px-4 py-4">
                        <button
                          onClick={() =>
                            setExpandedId(expandedId === e.id ? null : e.id)
                          }
                          className="text-[#8A8580] hover:text-[#2D2A26]"
                        >
                          {expandedId === e.id ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-[#8A8580]" />
                          <span className="font-medium text-sm text-[#2D2A26]">
                            {e.invoice?.number || "--"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-[#2D2A26]">
                        <span className="inline-flex rounded-[6px] bg-[#FAF9F7] px-2 py-0.5 text-xs font-medium text-[#8A8580]">
                          {OP_LABELS[e.operationType] || e.operationType}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right text-sm text-[#2D2A26]">
                        {e.costPercentage.toFixed(2)}%
                      </td>
                      <td className="px-4 py-4 text-right text-sm text-[#2D2A26]">
                        {e.marginPercentage.toFixed(2)}%
                      </td>
                      <td className="px-4 py-4 text-right text-sm text-[#2D2A26]">
                        {fmt.format(e.taxableBase)}
                      </td>
                      <td className="px-4 py-4 text-right text-sm text-[#2D2A26]">
                        {e.vat.toFixed(2)}%
                      </td>
                      <td className="px-4 py-4 text-center text-sm text-[#8A8580]">
                        {e._count?.costs ?? 0}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => handleDelete(e)}
                          className="rounded-[10px] p-1.5 text-[#8A8580] hover:bg-red-50 hover:text-[#C75D4A] transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                    {expandedId === e.id && (
                      <tr>
                        <td colSpan={9} className="p-0">
                          <ExpedientDetail
                            expedient={e}
                            onUpdate={(d) => handleUpdate(e.id, d)}
                            onAddCost={(d) => handleAddCost(e.id, d)}
                            onDeleteCost={(costId) =>
                              handleDeleteCost(e.id, costId)
                            }
                            onAddDocument={(d) => handleAddDocument(e.id, d)}
                            onDeleteDocument={(docId) =>
                              handleDeleteDocument(e.id, docId)
                            }
                          />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ExpedientModal
        invoices={invoices}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleCreate}
      />
    </div>
  );
}
