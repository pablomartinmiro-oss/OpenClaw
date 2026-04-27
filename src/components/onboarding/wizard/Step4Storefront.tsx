"use client";

import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StorefrontConfig } from "./types";

interface Step4Props {
  data: StorefrontConfig;
  tenantSlug: string | null;
  onChange: (next: StorefrontConfig) => void;
  onBack: () => void;
  onNext: () => void;
  loading: boolean;
  error: string | null;
}

const COLOR_PRESETS = [
  { value: "#42A5F5", label: "Azul" },
  { value: "#E87B5A", label: "Coral" },
  { value: "#5B8C6D", label: "Verde" },
  { value: "#001D3D", label: "Marino" },
  { value: "#D4A853", label: "Oro" },
  { value: "#7C3AED", label: "Morado" },
];

export function Step4Storefront({
  data,
  tenantSlug,
  onChange,
  onBack,
  onNext,
  loading,
  error,
}: Step4Props) {
  function set<K extends keyof StorefrontConfig>(key: K, value: StorefrontConfig[K]) {
    onChange({ ...data, [key]: value });
  }

  const valid = data.siteTitle.trim().length > 0;
  const previewUrl = tenantSlug ? `/s/${tenantSlug}` : "/s/tu-empresa";

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid && !loading) onNext();
      }}
    >
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-coral" />
          <h2 className="text-xl font-semibold text-slate-900">Tu tienda online</h2>
        </div>
        <p className="text-sm text-slate-500">
          Configura el aspecto basico de tu tienda publica. Tus clientes podran reservar y comprar
          desde aqui.
        </p>
      </header>

      <div className="space-y-2">
        <label htmlFor="siteTitle" className="text-sm font-medium text-slate-900">
          Nombre de la tienda <span className="text-coral">*</span>
        </label>
        <Input
          id="siteTitle"
          value={data.siteTitle}
          onChange={(e) => set("siteTitle", e.target.value)}
          placeholder="Sierra Ski Resort"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="storeDesc" className="text-sm font-medium text-slate-900">
          Descripcion corta
        </label>
        <textarea
          id="storeDesc"
          value={data.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Tu viaje de esqui en un solo clic. Reserva clases, alquiler y forfaits."
          rows={3}
          className="w-full rounded-[10px] border border-warm-border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-900">Color principal</label>
        <div className="flex flex-wrap gap-2">
          {COLOR_PRESETS.map((c) => {
            const selected = data.primaryColor.toLowerCase() === c.value.toLowerCase();
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => set("primaryColor", c.value)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                  selected ? "border-slate-900 ring-1 ring-slate-900" : "border-warm-border"
                }`}
              >
                <span
                  className="h-4 w-4 rounded-full border border-warm-border"
                  style={{ backgroundColor: c.value }}
                />
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-warm-border bg-surface p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Vista previa
        </p>
        <div
          className="overflow-hidden rounded-lg border border-warm-border bg-white"
          style={{ borderTopColor: data.primaryColor, borderTopWidth: 4 }}
        >
          <div className="flex items-center justify-between border-b border-warm-border bg-white px-4 py-3">
            <span className="text-sm font-semibold text-slate-900">
              {data.siteTitle || "Tu tienda"}
            </span>
            <span
              className="rounded-md px-2.5 py-1 text-[10px] font-semibold text-white"
              style={{ backgroundColor: data.primaryColor }}
            >
              SOLICITAR PRESUPUESTO
            </span>
          </div>
          <div className="px-4 py-6 text-center">
            <p className="text-sm font-semibold text-slate-900">
              {data.description || "Tu descripcion aparecera aqui."}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Tu URL publica: <span className="font-mono">{previewUrl}</span>
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" onClick={onBack} disabled={loading}>
          Atras
        </Button>
        <Button type="submit" disabled={!valid || loading}>
          {loading ? "Publicando..." : "Publicar mi tienda"}
        </Button>
      </div>
    </form>
  );
}
