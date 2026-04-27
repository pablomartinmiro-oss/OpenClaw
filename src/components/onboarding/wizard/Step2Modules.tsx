"use client";

import { LayoutGrid, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MODULE_REGISTRY, ALL_MODULE_SLUGS, SECTION_ORDER } from "@/lib/modules/registry";

interface Step2Props {
  enabled: string[];
  onChange: (next: string[]) => void;
  onBack: () => void;
  onNext: () => void;
  loading: boolean;
  error: string | null;
}

export function Step2Modules({ enabled, onChange, onBack, onNext, loading, error }: Step2Props) {
  const nonCoreSlugs = ALL_MODULE_SLUGS.filter((s) => !MODULE_REGISTRY[s].isCore);

  const grouped = nonCoreSlugs.reduce<Record<string, string[]>>((acc, slug) => {
    const section = MODULE_REGISTRY[slug].section;
    (acc[section] ??= []).push(slug);
    return acc;
  }, {});

  function toggle(slug: string) {
    if (enabled.includes(slug)) {
      onChange(enabled.filter((s) => s !== slug));
    } else {
      onChange([...enabled, slug]);
    }
  }

  const sortedSections = Object.keys(grouped).sort(
    (a, b) => (SECTION_ORDER[a]?.order ?? 99) - (SECTION_ORDER[b]?.order ?? 99)
  );

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-5 w-5 text-coral" />
          <h2 className="text-xl font-semibold text-slate-900">Activa tus modulos</h2>
        </div>
        <p className="text-sm text-slate-500">
          Hemos preseleccionado los modulos recomendados para tu tipo de negocio. Activa o desactiva
          los que necesites — siempre podras cambiarlo desde Ajustes.
        </p>
      </header>

      <div className="space-y-5 max-h-[400px] overflow-y-auto pr-1">
        {sortedSections.map((section) => (
          <div key={section} className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {SECTION_ORDER[section]?.label ?? section}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {grouped[section].map((slug) => {
                const def = MODULE_REGISTRY[slug];
                const isOn = enabled.includes(slug);
                return (
                  <button
                    key={slug}
                    type="button"
                    onClick={() => toggle(slug)}
                    className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
                      isOn
                        ? "border-coral bg-coral/5"
                        : "border-warm-border bg-white hover:border-slate-300"
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded ${
                        isOn ? "bg-coral text-white" : "border border-slate-300 bg-white"
                      }`}
                    >
                      {isOn && <Check className="h-3.5 w-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{def.name}</p>
                      <p className="text-xs text-slate-500 line-clamp-2">{def.description}</p>
                      {def.dependencies.length > 0 && (
                        <p className="mt-1 text-[10px] text-slate-400">
                          Requiere: {def.dependencies.map((d) => MODULE_REGISTRY[d]?.name ?? d).join(", ")}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" onClick={onBack} disabled={loading}>
          Atras
        </Button>
        <Button onClick={onNext} disabled={loading}>
          {loading ? "Guardando..." : "Continuar"}
        </Button>
      </div>
    </div>
  );
}
