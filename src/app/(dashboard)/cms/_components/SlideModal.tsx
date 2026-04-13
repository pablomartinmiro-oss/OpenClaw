"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { SlideshowItem } from "@/hooks/useCms";
import { CollapsibleSection, hasNonDefaultValues } from "@/components/shared/CollapsibleSection";

const inputCls =
  "w-full rounded-[10px] border border-[#E8E4DE] px-3 py-2 text-sm text-[#2D2A26] placeholder:text-[#8A8580] focus:border-[#E87B5A] focus:outline-none focus:ring-1 focus:ring-[#E87B5A]";

export interface SlideForm {
  imageUrl: string;
  caption: string;
  linkUrl: string;
  sortOrder: number;
  isActive: boolean;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
  reserveUrl: string;
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
          badge: slide.badge ?? "",
          title: slide.title ?? "",
          subtitle: slide.subtitle ?? "",
          description: slide.description ?? "",
          ctaText: slide.ctaText ?? "",
          ctaUrl: slide.ctaUrl ?? "",
          reserveUrl: slide.reserveUrl ?? "",
        }
      : { imageUrl: "", caption: "", linkUrl: "", sortOrder: 0, isActive: true, badge: "", title: "", subtitle: "", description: "", ctaText: "", ctaUrl: "", reserveUrl: "" }
  );
  const activeNoImage = form.isActive && !form.imageUrl;
  const contentOpen = hasNonDefaultValues({ badge: form.badge, title: form.title, subtitle: form.subtitle, description: form.description, ctaText: form.ctaText, ctaUrl: form.ctaUrl, reserveUrl: form.reserveUrl });

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
          {activeNoImage && (
            <p className="text-xs text-[#D4A853]">Slide activo sin imagen no se mostrará en el storefront.</p>
          )}

          <CollapsibleSection title="Contenido enriquecido" defaultOpen={contentOpen}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#8A8580] mb-1">Badge</label>
                <input type="text" value={form.badge} onChange={(e) => setForm((p) => ({ ...p, badge: e.target.value }))} className={inputCls} placeholder="ej: Nuevo, Temporada" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#8A8580] mb-1">Título</label>
                <input type="text" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className={inputCls} placeholder="Título principal" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8A8580] mb-1">Subtítulo</label>
              <input type="text" value={form.subtitle} onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))} className={inputCls} placeholder="Texto secundario" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8A8580] mb-1">Descripción</label>
              <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className={inputCls + " min-h-[60px] resize-y"} placeholder="Descripción larga del slide" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#8A8580] mb-1">Texto CTA</label>
                <input type="text" value={form.ctaText} onChange={(e) => setForm((p) => ({ ...p, ctaText: e.target.value }))} className={inputCls} placeholder="ej: Reservar ahora" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#8A8580] mb-1">URL CTA</label>
                <input type="url" value={form.ctaUrl} onChange={(e) => setForm((p) => ({ ...p, ctaUrl: e.target.value }))} className={inputCls} placeholder="https://..." />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8A8580] mb-1">URL Reservar</label>
              <input type="url" value={form.reserveUrl} onChange={(e) => setForm((p) => ({ ...p, reserveUrl: e.target.value }))} className={inputCls} placeholder="https://..." />
            </div>
          </CollapsibleSection>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-[10px] border border-[#E8E4DE] px-4 py-2 text-sm font-medium text-[#8A8580] hover:bg-[#FAF9F7] transition-colors">Cancelar</button>
            <button type="submit" className="rounded-[10px] bg-[#E87B5A] px-4 py-2 text-sm font-medium text-white hover:bg-[#D56E4F] transition-colors">{slide ? "Guardar Cambios" : "Crear Slide"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
