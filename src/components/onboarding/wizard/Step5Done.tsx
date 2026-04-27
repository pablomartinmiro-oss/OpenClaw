"use client";

import { CheckCircle2, Package, LayoutGrid, Globe, Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BUSINESS_TYPES, WizardData } from "./types";
import { MODULE_REGISTRY } from "@/lib/modules/registry";

interface Step5Props {
  data: WizardData;
  tenantSlug: string | null;
  onFinish: () => void;
  loading: boolean;
  error: string | null;
}

export function Step5Done({ data, tenantSlug, onFinish, loading, error }: Step5Props) {
  const businessLabel = BUSINESS_TYPES.find((b) => b.value === data.business.businessType)?.label;
  const moduleNames = data.enabledModules
    .map((s) => MODULE_REGISTRY[s]?.name)
    .filter(Boolean) as string[];

  return (
    <div className="space-y-6">
      <header className="space-y-2 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900">¡Listo!</h2>
        <p className="text-sm text-slate-500">
          Tu cuenta esta configurada. Aqui tienes un resumen de lo que hemos preparado.
        </p>
      </header>

      <div className="space-y-2 rounded-xl border border-warm-border bg-surface p-4">
        <SummaryRow icon={<Building2 className="h-4 w-4 text-coral" />} label="Tipo de negocio">
          {businessLabel ?? "—"}
        </SummaryRow>
        <SummaryRow icon={<LayoutGrid className="h-4 w-4 text-coral" />} label="Modulos activos">
          {moduleNames.length > 0 ? moduleNames.join(", ") : "Solo Principal"}
        </SummaryRow>
        <SummaryRow icon={<Package className="h-4 w-4 text-coral" />} label="Productos creados">
          {data.products.length > 0 ? `${data.products.length} producto(s)` : "Ninguno"}
        </SummaryRow>
        <SummaryRow icon={<Globe className="h-4 w-4 text-coral" />} label="Tienda online">
          {data.storefront.siteTitle}
          {tenantSlug && (
            <a
              href={`/s/${tenantSlug}`}
              target="_blank"
              rel="noreferrer"
              className="ml-2 text-xs text-coral hover:underline"
            >
              Ver tienda →
            </a>
          )}
        </SummaryRow>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      <Button onClick={onFinish} disabled={loading} className="w-full">
        {loading ? "Finalizando..." : (
          <>
            Ir al dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}

function SummaryRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-1">
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        <p className="text-sm text-slate-900">{children}</p>
      </div>
    </div>
  );
}
