"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Invoice } from "@/hooks/useFinance";

const inputCls =
  "w-full rounded-[10px] border border-[#E8E4DE] px-3 py-2 text-sm text-[#2D2A26] focus:border-[#E87B5A] focus:outline-none focus:ring-1 focus:ring-[#E87B5A]";

interface Props {
  invoices: Invoice[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    invoiceId: string;
    operationType: string;
    costPercentage: number;
    marginPercentage: number;
    marginAmount: number;
    taxableBase: number;
    vat: number;
  }) => void;
}

export default function ExpedientModal({
  invoices,
  isOpen,
  onClose,
  onSave,
}: Props) {
  const [form, setForm] = useState({
    invoiceId: "",
    operationType: "standard",
    costPercentage: 0,
    marginPercentage: 0,
    marginAmount: 0,
    taxableBase: 0,
    vat: 0,
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    setForm({
      invoiceId: "",
      operationType: "standard",
      costPercentage: 0,
      marginPercentage: 0,
      marginAmount: 0,
      taxableBase: 0,
      vat: 0,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#E8E4DE] px-6 py-4">
          <h2 className="text-lg font-semibold text-[#2D2A26]">
            Nuevo Expediente REAV
          </h2>
          <button
            onClick={onClose}
            className="rounded-[10px] p-1.5 text-[#8A8580] hover:bg-[#FAF9F7] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {/* Invoice selector */}
          <div>
            <label className="block text-sm font-medium text-[#2D2A26] mb-1">
              Factura
            </label>
            <select
              value={form.invoiceId}
              onChange={(e) =>
                setForm((p) => ({ ...p, invoiceId: e.target.value }))
              }
              className={inputCls}
              required
            >
              <option value="">Seleccionar factura...</option>
              {invoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.number} — {inv.client?.name || "Sin cliente"}
                </option>
              ))}
            </select>
          </div>

          {/* Operation type */}
          <div>
            <label className="block text-sm font-medium text-[#2D2A26] mb-1">
              Tipo de operacion
            </label>
            <select
              value={form.operationType}
              onChange={(e) =>
                setForm((p) => ({ ...p, operationType: e.target.value }))
              }
              className={inputCls}
            >
              <option value="standard">Estandar</option>
              <option value="intra_eu">Intra-UE</option>
              <option value="extra_eu">Extra-UE</option>
              <option value="mixed">Mixta</option>
            </select>
          </div>

          {/* Percentages row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#2D2A26] mb-1">
                % Coste
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={form.costPercentage}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    costPercentage: parseFloat(e.target.value) || 0,
                  }))
                }
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2D2A26] mb-1">
                % Margen
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={form.marginPercentage}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    marginPercentage: parseFloat(e.target.value) || 0,
                  }))
                }
                className={inputCls}
              />
            </div>
          </div>

          {/* Amounts row */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#2D2A26] mb-1">
                Margen (EUR)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.marginAmount}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    marginAmount: parseFloat(e.target.value) || 0,
                  }))
                }
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2D2A26] mb-1">
                Base imponible
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.taxableBase}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    taxableBase: parseFloat(e.target.value) || 0,
                  }))
                }
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2D2A26] mb-1">
                % IVA
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={form.vat}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    vat: parseFloat(e.target.value) || 0,
                  }))
                }
                className={inputCls}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-[10px] border border-[#E8E4DE] px-4 py-2 text-sm font-medium text-[#8A8580] hover:bg-[#FAF9F7] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-[10px] bg-[#E87B5A] px-4 py-2 text-sm font-medium text-white hover:bg-[#D56E4F] transition-colors"
            >
              Crear Expediente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
