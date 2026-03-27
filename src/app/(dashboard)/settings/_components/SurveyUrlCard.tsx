"use client";

import { useState } from "react";
import { Link2, Copy, Check, ExternalLink } from "lucide-react";

interface SurveyUrlCardProps {
  slug: string;
  loading?: boolean;
}

export function SurveyUrlCard({ slug, loading }: SurveyUrlCardProps) {
  const [copied, setCopied] = useState(false);

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://crm-dash-prod.up.railway.app";

  const surveyUrl = `${baseUrl}/survey/${slug}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(surveyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-5 animate-pulse space-y-3">
        <div className="h-4 w-32 rounded bg-slate-100" />
        <div className="h-10 rounded-lg bg-slate-100" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Link2 className="h-4 w-4 text-coral" />
        <h3 className="font-semibold text-slate-900">Formulario de captación</h3>
      </div>

      <p className="text-sm text-slate-500">
        Comparte este enlace o incrústalo en tu web para que los clientes soliciten presupuesto directamente.
      </p>

      <div className="flex items-center gap-2">
        <div className="flex-1 rounded-[10px] border border-border bg-slate-100/40 px-3 py-2.5 text-sm text-slate-500 font-mono truncate">
          {surveyUrl}
        </div>
        <button
          onClick={handleCopy}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-border bg-surface hover:bg-slate-100/60 transition-colors"
          title="Copiar URL"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-700" />
          ) : (
            <Copy className="h-4 w-4 text-slate-500" />
          )}
        </button>
        <a
          href={surveyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-border bg-surface hover:bg-slate-100/60 transition-colors"
          title="Abrir formulario"
        >
          <ExternalLink className="h-4 w-4 text-slate-500" />
        </a>
      </div>

      <div className="rounded-[10px] bg-soft-blue-light px-3 py-2.5 text-xs text-soft-blue">
        Los presupuestos generados desde este formulario aparecerán automáticamente en la sección <strong>Presupuestos</strong> con estado "Borrador".
      </div>
    </div>
  );
}
