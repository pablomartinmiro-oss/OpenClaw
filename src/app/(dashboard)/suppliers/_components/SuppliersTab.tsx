"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Truck, X } from "lucide-react";
import { toast } from "sonner";
import {
  useSuppliers,
  useCreateSupplier,
  useUpdateSupplier,
  useDeleteSupplier,
} from "@/hooks/useSuppliers";
import type { Supplier } from "@/hooks/useSuppliers";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";

const inputCls =
  "w-full rounded-[10px] border border-[#E8E4DE] px-3 py-2 text-sm text-[#2D2A26] placeholder:text-[#8A8580] focus:border-[#E87B5A] focus:outline-none focus:ring-1 focus:ring-[#E87B5A]";

const selectCls =
  "w-full rounded-[10px] border border-[#E8E4DE] px-3 py-2 text-sm text-[#2D2A26] focus:border-[#E87B5A] focus:outline-none focus:ring-1 focus:ring-[#E87B5A]";

const statusBadge: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700",
  inactive: "bg-gray-100 text-gray-500",
  blocked: "bg-red-50 text-[#C75D4A]",
};

const statusLabel: Record<string, string> = {
  active: "Activo",
  inactive: "Inactivo",
  blocked: "Bloqueado",
};

const paymentLabel: Record<string, string> = {
  transfer: "Transferencia",
  card: "Tarjeta",
};

const freqLabel: Record<string, string> = {
  biweekly: "Quincenal",
  monthly: "Mensual",
  quarterly: "Trimestral",
};

interface FormData {
  fiscalName: string;
  commercialName: string;
  nif: string;
  iban: string;
  email: string;
  phone: string;
  commissionPercentage: number;
  paymentMethod: string;
  settlementFrequency: string;
  status: string;
}

const emptyForm: FormData = {
  fiscalName: "",
  commercialName: "",
  nif: "",
  iban: "",
  email: "",
  phone: "",
  commissionPercentage: 0,
  paymentMethod: "transfer",
  settlementFrequency: "monthly",
  status: "active",
};

function fromSupplier(s: Supplier): FormData {
  return {
    fiscalName: s.fiscalName,
    commercialName: s.commercialName ?? "",
    nif: s.nif,
    iban: s.iban ?? "",
    email: s.email ?? "",
    phone: s.phone ?? "",
    commissionPercentage: s.commissionPercentage,
    paymentMethod: s.paymentMethod,
    settlementFrequency: s.settlementFrequency,
    status: s.status,
  };
}

export default function SuppliersTab() {
  const { data, isLoading } = useSuppliers();
  const createSup = useCreateSupplier();
  const updateSup = useUpdateSupplier();
  const deleteSup = useDeleteSupplier();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);

  if (isLoading) return <PageSkeleton />;
  const suppliers = data?.suppliers || [];

  const handleAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };
  const handleEdit = (s: Supplier) => {
    setEditing(s);
    setForm(fromSupplier(s));
    setModalOpen(true);
  };
  const handleDelete = async (s: Supplier) => {
    if (!confirm(`Eliminar proveedor "${s.fiscalName}"?`)) return;
    try {
      await deleteSup.mutateAsync(s.id);
      toast.success("Proveedor eliminado");
    } catch {
      toast.error("Error al eliminar proveedor");
    }
  };
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      commercialName: form.commercialName || null,
      iban: form.iban || null,
      email: form.email || null,
      phone: form.phone || null,
    };
    try {
      if (editing) {
        await updateSup.mutateAsync({ id: editing.id, ...payload });
        toast.success("Proveedor actualizado");
      } else {
        await createSup.mutateAsync(payload);
        toast.success("Proveedor creado");
      }
      setModalOpen(false);
    } catch {
      toast.error("Error al guardar proveedor");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#8A8580]">
          {suppliers.length} proveedor{suppliers.length !== 1 ? "es" : ""}
        </p>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 rounded-[10px] bg-[#E87B5A] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#D56E4F] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Anadir Proveedor
        </button>
      </div>

      {suppliers.length === 0 ? (
        <div className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-12 text-center">
          <Truck className="mx-auto h-10 w-10 text-[#8A8580] mb-3" />
          <p className="text-sm text-[#8A8580]">
            No hay proveedores creados
          </p>
          <p className="text-xs text-[#8A8580] mt-1">
            Crea tu primer proveedor para gestionar liquidaciones
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E8E4DE] bg-[#FAF9F7]/50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#8A8580] uppercase tracking-wider">
                    Nombre fiscal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#8A8580] uppercase tracking-wider">
                    NIF
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-[#8A8580] uppercase tracking-wider">
                    Comision %
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#8A8580] uppercase tracking-wider">
                    Metodo pago
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#8A8580] uppercase tracking-wider">
                    Frecuencia
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-[#8A8580] uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[#8A8580] uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E4DE]">
                {suppliers.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-[#FAF9F7]/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-[#8A8580]" />
                        <div>
                          <span className="font-medium text-sm text-[#2D2A26]">
                            {s.fiscalName}
                          </span>
                          {s.commercialName && (
                            <p className="text-xs text-[#8A8580]">
                              {s.commercialName}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-[6px] bg-[#FAF9F7] px-2 py-0.5 text-xs font-mono text-[#8A8580]">
                        {s.nif}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-[#2D2A26]">
                      {s.commissionPercentage}%
                    </td>
                    <td className="px-6 py-4 text-sm text-[#8A8580]">
                      {paymentLabel[s.paymentMethod] || s.paymentMethod}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#8A8580]">
                      {freqLabel[s.settlementFrequency] ||
                        s.settlementFrequency}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex rounded-[6px] px-2 py-0.5 text-xs font-medium ${statusBadge[s.status] || "bg-gray-100 text-gray-500"}`}
                      >
                        {statusLabel[s.status] || s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(s)}
                          className="rounded-[10px] p-1.5 text-[#8A8580] hover:bg-[#FAF9F7] hover:text-[#E87B5A] transition-colors"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(s)}
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

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E8E4DE] px-6 py-4">
              <h2 className="text-lg font-semibold text-[#2D2A26]">
                {editing ? "Editar Proveedor" : "Nuevo Proveedor"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-[10px] p-1.5 text-[#8A8580] hover:bg-[#FAF9F7] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4 p-6">
              <div>
                <label className="block text-sm font-medium text-[#2D2A26] mb-1">
                  Nombre fiscal *
                </label>
                <input
                  type="text"
                  value={form.fiscalName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, fiscalName: e.target.value }))
                  }
                  className={inputCls}
                  placeholder="Ej: Empresa Servicios S.L."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2D2A26] mb-1">
                  Nombre comercial
                </label>
                <input
                  type="text"
                  value={form.commercialName}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      commercialName: e.target.value,
                    }))
                  }
                  className={inputCls}
                  placeholder="Nombre comercial (opcional)"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2D2A26] mb-1">
                    NIF *
                  </label>
                  <input
                    type="text"
                    value={form.nif}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, nif: e.target.value }))
                    }
                    className={inputCls}
                    placeholder="B12345678"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2D2A26] mb-1">
                    IBAN
                  </label>
                  <input
                    type="text"
                    value={form.iban}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, iban: e.target.value }))
                    }
                    className={inputCls}
                    placeholder="ES00 0000 0000 0000 0000 0000"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2D2A26] mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, email: e.target.value }))
                    }
                    className={inputCls}
                    placeholder="contacto@empresa.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2D2A26] mb-1">
                    Telefono
                  </label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, phone: e.target.value }))
                    }
                    className={inputCls}
                    placeholder="+34 600 000 000"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2D2A26] mb-1">
                    Comision %
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={form.commissionPercentage}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        commissionPercentage:
                          parseFloat(e.target.value) || 0,
                      }))
                    }
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2D2A26] mb-1">
                    Metodo pago
                  </label>
                  <select
                    value={form.paymentMethod}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        paymentMethod: e.target.value,
                      }))
                    }
                    className={selectCls}
                  >
                    <option value="transfer">Transferencia</option>
                    <option value="card">Tarjeta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2D2A26] mb-1">
                    Frecuencia
                  </label>
                  <select
                    value={form.settlementFrequency}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        settlementFrequency: e.target.value,
                      }))
                    }
                    className={selectCls}
                  >
                    <option value="biweekly">Quincenal</option>
                    <option value="monthly">Mensual</option>
                    <option value="quarterly">Trimestral</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2D2A26] mb-1">
                  Estado
                </label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, status: e.target.value }))
                  }
                  className={selectCls}
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                  <option value="blocked">Bloqueado</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-[10px] border border-[#E8E4DE] px-4 py-2 text-sm font-medium text-[#8A8580] hover:bg-[#FAF9F7] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-[10px] bg-[#E87B5A] px-4 py-2 text-sm font-medium text-white hover:bg-[#D56E4F] transition-colors"
                >
                  {editing ? "Guardar Cambios" : "Crear Proveedor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
