"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { GalleryItem } from "@/hooks/useCmsExtended";

const inputCls = "w-full rounded-[10px] border border-[#E8E4DE] px-3 py-2 text-sm text-[#2D2A26] placeholder:text-[#8A8580] focus:border-[#E87B5A] focus:outline-none focus:ring-1 focus:ring-[#E87B5A]";

interface GalleryItemForm {
  imageUrl: string;
  title: string;
  category: string;
  sortOrder: number;
  isActive: boolean;
}

export default function GalleryItemModal({
  item, isOpen, onClose, onSave,
}: {
  item: GalleryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (d: GalleryItemForm & { id?: string }) => void;
}) {
  const [form, setForm] = useState<GalleryItemForm>(() =>
    item
      ? { imageUrl: item.imageUrl, title: item.title ?? "", category: item.category ?? "", sortOrder: item.sortOrder, isActive: item.isActive }
      : { imageUrl: "", title: "", category: "", sortOrder: 0, isActive: true }
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...(item && { id: item.id }), ...form });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#E8E4DE] px-6 py-4">
          <h2 className="text-lg font-semibold text-[#2D2A26]">{item ? "Editar Item" : "Nuevo Item"}</h2>
          <button onClick={onClose} className="rounded-[10px] p-1.5 text-[#8A8580] hover:bg-[#FAF9F7] transition-colors"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label htmlFor="gallery-url" className="block text-sm font-medium text-[#2D2A26] mb-1">URL de imagen</label>
            <input id="gallery-url" type="url" value={form.imageUrl} onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))} className={inputCls} placeholder="https://..." required />
          </div>
          {form.imageUrl && (
            <div className="rounded-[10px] border border-[#E8E4DE] overflow-hidden">
              <img src={form.imageUrl} alt="Vista previa" className="w-full h-40 object-cover" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
            </div>
          )}
          <div>
            <label htmlFor="gallery-title" className="block text-sm font-medium text-[#2D2A26] mb-1">Título</label>
            <input id="gallery-title" type="text" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className={inputCls} placeholder="Descripción de la imagen" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="gallery-category" className="block text-sm font-medium text-[#2D2A26] mb-1">Categoría</label>
              <input id="gallery-category" type="text" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className={inputCls} placeholder="ej: estacion, actividades" />
            </div>
            <div>
              <label htmlFor="gallery-order" className="block text-sm font-medium text-[#2D2A26] mb-1">Orden</label>
              <input id="gallery-order" type="number" min="0" value={form.sortOrder} onChange={(e) => setForm((p) => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))} className={inputCls} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="gallery-active" checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} className="h-4 w-4 rounded border-[#E8E4DE] text-[#E87B5A] focus:ring-[#E87B5A]" />
            <label htmlFor="gallery-active" className="text-sm font-medium text-[#2D2A26]">Activo</label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-[10px] border border-[#E8E4DE] px-4 py-2 text-sm font-medium text-[#8A8580] hover:bg-[#FAF9F7] transition-colors">Cancelar</button>
            <button type="submit" className="rounded-[10px] bg-[#E87B5A] px-4 py-2 text-sm font-medium text-white hover:bg-[#D56E4F] transition-colors">{item ? "Guardar Cambios" : "Crear Item"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
