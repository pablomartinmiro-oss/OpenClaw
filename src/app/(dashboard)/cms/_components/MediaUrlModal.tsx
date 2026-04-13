"use client";

import { useState } from "react";
import { X } from "lucide-react";

const inputCls = "w-full rounded-[10px] border border-[#E8E4DE] px-3 py-2 text-sm text-[#2D2A26] placeholder:text-[#8A8580] focus:border-[#E87B5A] focus:outline-none focus:ring-1 focus:ring-[#E87B5A]";

export default function MediaUrlModal({
  isOpen, onClose, onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (d: { url: string; filename: string; altText: string }) => void;
}) {
  const [form, setForm] = useState({ url: "", filename: "", altText: "" });
  const [urlError, setUrlError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.url.startsWith("https://") && !form.url.startsWith("http://")) {
      setUrlError("URL inválida — debe empezar con https://");
      return;
    }
    setUrlError("");
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E8E4DE] px-6 py-4">
          <h2 className="text-lg font-semibold text-[#2D2A26]">Añadir archivo por URL</h2>
          <button onClick={onClose} className="rounded-[10px] p-1.5 text-[#8A8580] hover:bg-[#FAF9F7] transition-colors"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label htmlFor="media-url" className="block text-sm font-medium text-[#2D2A26] mb-1">URL del archivo</label>
            <input id="media-url" type="text" value={form.url} onChange={(e) => { setForm((p) => ({ ...p, url: e.target.value })); setUrlError(""); }} className={`${inputCls} ${urlError ? "border-[#C75D4A]" : ""}`} placeholder="https://..." required />
            {urlError && <p className="mt-1 text-xs text-[#C75D4A]">{urlError}</p>}
          </div>
          <div>
            <label htmlFor="media-filename" className="block text-sm font-medium text-[#2D2A26] mb-1">Nombre de archivo</label>
            <input id="media-filename" type="text" value={form.filename} onChange={(e) => setForm((p) => ({ ...p, filename: e.target.value }))} className={inputCls} placeholder="foto-portada.jpg" />
          </div>
          <div>
            <label htmlFor="media-alt" className="block text-sm font-medium text-[#2D2A26] mb-1">Texto alternativo</label>
            <input id="media-alt" type="text" value={form.altText} onChange={(e) => setForm((p) => ({ ...p, altText: e.target.value }))} className={inputCls} placeholder="Descripción para accesibilidad" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-[10px] border border-[#E8E4DE] px-4 py-2 text-sm font-medium text-[#8A8580] hover:bg-[#FAF9F7] transition-colors">Cancelar</button>
            <button type="submit" className="rounded-[10px] bg-[#E87B5A] px-4 py-2 text-sm font-medium text-white hover:bg-[#D56E4F] transition-colors">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
