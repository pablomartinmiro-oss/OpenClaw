"use client";

import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BUSINESS_TYPES, BusinessInfo, BusinessType } from "./types";

interface Step1Props {
  data: BusinessInfo;
  onChange: (next: BusinessInfo) => void;
  onNext: () => void;
  loading: boolean;
  error: string | null;
}

export function Step1Business({ data, onChange, onNext, loading, error }: Step1Props) {
  const valid = data.businessType && data.city.trim().length > 0;

  function set<K extends keyof BusinessInfo>(key: K, value: BusinessInfo[K]) {
    onChange({ ...data, [key]: value });
  }

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
          <Building2 className="h-5 w-5 text-coral" />
          <h2 className="text-xl font-semibold text-slate-900">Sobre tu negocio</h2>
        </div>
        <p className="text-sm text-slate-500">
          Cuentanos a que te dedicas para preparar la plataforma a tu medida.
        </p>
      </header>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-900">
          Tipo de negocio <span className="text-coral">*</span>
        </label>
        <div className="grid gap-2 sm:grid-cols-2">
          {BUSINESS_TYPES.map((b) => {
            const selected = data.businessType === b.value;
            return (
              <button
                key={b.value}
                type="button"
                onClick={() => set("businessType", b.value as BusinessType)}
                className={`rounded-xl border p-3 text-left transition-colors ${
                  selected
                    ? "border-coral bg-coral/5 ring-1 ring-coral"
                    : "border-warm-border bg-white hover:border-slate-300"
                }`}
              >
                <p className="text-sm font-semibold text-slate-900">{b.label}</p>
                <p className="text-xs text-slate-500">{b.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="city" className="text-sm font-medium text-slate-900">
            Ciudad / Estacion <span className="text-coral">*</span>
          </label>
          <Input
            id="city"
            value={data.city}
            onChange={(e) => set("city", e.target.value)}
            placeholder="Sierra Nevada"
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium text-slate-900">
            Telefono
          </label>
          <Input
            id="phone"
            type="tel"
            value={data.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="+34 600 000 000"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="website" className="text-sm font-medium text-slate-900">
          Sitio web actual <span className="text-xs text-slate-500">(opcional)</span>
        </label>
        <Input
          id="website"
          type="url"
          value={data.website}
          onChange={(e) => set("website", e.target.value)}
          placeholder="https://miempresa.com"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="logoUrl" className="text-sm font-medium text-slate-900">
          URL del logo <span className="text-xs text-slate-500">(opcional)</span>
        </label>
        <Input
          id="logoUrl"
          type="url"
          value={data.logoUrl}
          onChange={(e) => set("logoUrl", e.target.value)}
          placeholder="https://miempresa.com/logo.png"
        />
        <p className="text-xs text-slate-500">
          Pega la URL de tu logo. Podras subir un archivo desde Ajustes mas adelante.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={!valid || loading}>
          {loading ? "Guardando..." : "Continuar"}
        </Button>
      </div>
    </form>
  );
}
