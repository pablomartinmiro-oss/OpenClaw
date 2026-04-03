"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { SlideshowItem } from "@/hooks/useCms";

const inputCls =
  "w-full rounded-[10px] border border-[#E8E4DE] px-3 py-2 text-sm text-[#2D2A26] placeholder:text-[#8A8580] focus:border-[#E87B5A] focus:outline-none focus:ring-1 focus:ring-[#E87B5A]";

export interface SlideForm {
  imageUrl: string;
  caption: string;
  linkUrl: string;
  sortOrder: number;
  isActive: boolean;
}

export default function SlideModal({
  slide,
  isOpen,
  onClose,
  onSave,
}: {
  slide: SlideshowItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (d: SlideForm & { id?: string }) => void;
}) {
  const [form, setForm] = useState<SlideForm>(() =>
    slide
      ? {
          imageUrl: slide.imageUrl,
          caption: slide.caption ?? "",
          linkUrl: slide.linkUrl ?? "",
          sortOrder: slide.sortOrder,
          isActive: slide.isActive,
        }
      : { imageUrl: "", caption: "", linkUrl: "", sortOrder: 0, isActive: true }
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...(slide && { id: slide.id }), ...form });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#E8E4DE] px-6 py-4">
          <h2 className="text-lg font-semibold text-[#2D2A26]">
            {slide ? "Editar Slide" : "Nuevo Slide"}
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
              URL de imagen
            </label>
            <input
              type="url"
              value={form.imageUrl}
              onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))}
              className={inputCls}
              placeholder="https://..."
              required
            />
          </div>
          {form.imageUrl && (
            <div className="rounded-[10px] border border-[#E8E4DE] overflow-hidden">
              <img
                src={form.imageUrl}
                alt="Vista previa"
                className="w-full h-40 object-cover"
                onError={(e) =>
                  ((e.target as HTMLImageElement).style.display = "none")
                }
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-[#2D2A26] mb-1">
              Texto del slide
            </label>
            <input
              type="text"
              value={form.caption}
              onChange={(e) => setForm((p) => ({ ...p, caption: e.target.value }))}
              className={inputCls}
              placeholder="Texto opcional"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2D2A26] mb-1">
              Enlace (URL destino)
            </label>
            <input
              type="url"
              value={form.linkUrl}
              onChange={(e) => setForm((p) => ({ ...p, linkUrl: e.target.value }))}
              className={inputCls}
              placeholder="https://..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
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
            <div className="flex items-end pb-1">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="slide-active"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, isActive: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-[#E8E4DE] text-[#E87B5A] focus:ring-[#E87B5A]"
                />
                <label htmlFor="slide-active" className="text-sm font-medium text-[#2D2A26]">
                  Activo
                </label>
              </div>
            </div>
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
              {slide ? "Guardar Cambios" : "Crear Slide"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
