"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { CmsMenuItem } from "@/hooks/useCms";

const inputCls =
  "w-full rounded-[10px] border border-[#E8E4DE] px-3 py-2 text-sm text-[#2D2A26] placeholder:text-[#8A8580] focus:border-[#E87B5A] focus:outline-none focus:ring-1 focus:ring-[#E87B5A]";

export interface MenuForm {
  label: string;
  url: string;
  position: string;
  parentId: string;
  sortOrder: number;
  isActive: boolean;
}

export default function MenuItemModal({
  item,
  allItems,
  isOpen,
  onClose,
  onSave,
}: {
  item: CmsMenuItem | null;
  allItems: CmsMenuItem[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (d: MenuForm & { id?: string }) => void;
}) {
  const [form, setForm] = useState<MenuForm>(() =>
    item
      ? {
          label: item.label,
          url: item.url,
          position: item.position,
          parentId: item.parentId ?? "",
          sortOrder: item.sortOrder,
          isActive: item.isActive,
        }
      : {
          label: "",
          url: "/",
          position: "header",
          parentId: "",
          sortOrder: 0,
          isActive: true,
        }
  );

  if (!isOpen) return null;

  const parentCandidates = allItems.filter(
    (i) => i.id !== item?.id && !i.parentId
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...(item && { id: item.id }),
      ...form,
      parentId: form.parentId || "",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#E8E4DE] px-6 py-4">
          <h2 className="text-lg font-semibold text-[#2D2A26]">
            {item ? "Editar Item" : "Nuevo Item"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-[10px] p-1.5 text-[#8A8580] hover:bg-[#FAF9F7] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label className="block text-sm font-medium text-[#2D2A26] mb-1">
              Etiqueta
            </label>
            <input
              type="text"
              value={form.label}
              onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
              className={inputCls}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2D2A26] mb-1">
              URL
            </label>
            <input
              type="text"
              value={form.url}
              onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
              className={inputCls}
              placeholder="/pagina"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#2D2A26] mb-1">
                Posicion
              </label>
              <select
                value={form.position}
                onChange={(e) => setForm((p) => ({ ...p, position: e.target.value }))}
                className={inputCls}
              >
                <option value="header">Header</option>
                <option value="footer">Footer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2D2A26] mb-1">
                Orden
              </label>
              <input
                type="number"
                min="0"
                value={form.sortOrder}
                onChange={(e) =>
                  setForm((p) => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))
                }
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2D2A26] mb-1">
              Item padre (opcional)
            </label>
            <select
              value={form.parentId}
              onChange={(e) => setForm((p) => ({ ...p, parentId: e.target.value }))}
              className={inputCls}
            >
              <option value="">Sin padre (raiz)</option>
              {parentCandidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="menu-active"
              checked={form.isActive}
              onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
              className="h-4 w-4 rounded border-[#E8E4DE] text-[#E87B5A] focus:ring-[#E87B5A]"
            />
            <label htmlFor="menu-active" className="text-sm font-medium text-[#2D2A26]">
              Activo
            </label>
          </div>
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
              {item ? "Guardar Cambios" : "Crear Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
