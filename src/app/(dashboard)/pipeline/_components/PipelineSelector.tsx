"use client";

import type { GHLPipeline } from "@/lib/ghl/types";

interface PipelineSelectorProps {
  pipelines: GHLPipeline[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function PipelineSelector({
  pipelines,
  selectedId,
  onSelect,
}: PipelineSelectorProps) {
  if (pipelines.length <= 1) return null;

  return (
    <div className="flex gap-2">
      {pipelines.map((p) => (
        <button
          key={p.id}
          onClick={() => onSelect(p.id)}
          type="button"
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            p.id === selectedId
              ? "bg-blue-50 text-coral"
              : "bg-muted text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          {p.name}
        </button>
      ))}
    </div>
  );
}
