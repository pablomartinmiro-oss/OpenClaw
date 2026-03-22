"use client";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { KanbanCard } from "./KanbanCard";
import type { GHLOpportunity, GHLPipelineStage } from "@/lib/ghl/types";

interface KanbanColumnProps {
  stage: GHLPipelineStage;
  opportunities: GHLOpportunity[];
  dotColor?: string;
  onCardClick?: (opp: GHLOpportunity) => void;
}

const COLUMN_DOT_COLORS = [
  "bg-coral",
  "bg-sage",
  "bg-gold",
  "bg-soft-blue",
  "bg-muted-red",
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function KanbanColumn({ stage, opportunities, dotColor, onCardClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });
  const total = opportunities.reduce((sum, o) => sum + o.monetaryValue, 0);
  const color = dotColor ?? COLUMN_DOT_COLORS[stage.position % COLUMN_DOT_COLORS.length];

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-2xl transition-colors",
        "bg-[#f5f3ef] shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
        isOver && "ring-2 ring-coral/40 bg-coral/5"
      )}
    >
      {/* Stage header */}
      <div className="flex items-center justify-between rounded-t-2xl bg-white/70 p-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className={cn("h-2.5 w-2.5 rounded-full", color)} />
          <h3 className="text-sm font-semibold text-text-primary">{stage.name}</h3>
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-[10px] font-bold text-text-secondary shadow-sm">
            {opportunities.length}
          </span>
        </div>
        <span className="text-xs font-semibold text-text-secondary">
          {formatCurrency(total)}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 space-y-2 overflow-y-auto p-2">
        {opportunities.map((opp) => (
          <KanbanCard key={opp.id} opportunity={opp} onClick={() => onCardClick?.(opp)} />
        ))}
        {opportunities.length === 0 && !isOver && (
          <div className="rounded-[10px] border border-dashed border-border p-6 text-center text-xs text-text-secondary">
            Sin oportunidades
          </div>
        )}
        {opportunities.length === 0 && isOver && (
          <div className="rounded-[10px] border-2 border-dashed border-coral/30 p-4 text-center text-xs text-text-secondary">
            Soltar aqui
          </div>
        )}
      </div>
    </div>
  );
}
