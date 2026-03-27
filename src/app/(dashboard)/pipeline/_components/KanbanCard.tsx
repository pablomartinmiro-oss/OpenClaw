"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { User, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GHLOpportunity } from "@/lib/ghl/types";

interface KanbanCardProps {
  opportunity: GHLOpportunity;
  isDragOverlay?: boolean;
  onClick?: () => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function getDaysInStage(createdAt: string): number {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000);
}

function getBorderColor(days: number): string {
  if (days <= 3) return "border-l-green-500";
  if (days <= 7) return "border-l-amber-400";
  return "border-l-red-400";
}

export function KanbanCard({ opportunity, isDragOverlay, onClick }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: opportunity.id,
  });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  const daysInStage = getDaysInStage(opportunity.createdAt);
  const borderColor = getBorderColor(daysInStage);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => {
        if (!isDragging && !isDragOverlay) onClick?.();
      }}
      className={cn(
        "rounded-[10px] border border-border/50 bg-surface p-3 transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] cursor-grab active:cursor-grabbing",
        "border-l-[3px]",
        borderColor,
        isDragging && "opacity-40",
        isDragOverlay && "shadow-lg ring-1 ring-blue-500/20 rotate-2"
      )}
    >
      {/* Contact name */}
      <p className="mb-1.5 text-sm font-medium leading-tight text-slate-900">
        {opportunity.contactName || opportunity.name}
      </p>

      {/* Deal value (bold) */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-slate-900">
          {formatCurrency(opportunity.monetaryValue)}
        </span>
        {opportunity.assignedTo && (
          <div className="flex items-center gap-1 text-[10px] text-slate-500">
            <User className="h-3 w-3" />
            Asignado
          </div>
        )}
      </div>

      {/* Days in stage + status */}
      <div className="mt-2 flex items-center justify-between">
        <p className="text-[10px] text-slate-500 capitalize">{opportunity.status}</p>
        <span className={cn(
          "flex items-center gap-0.5 rounded-[6px] px-1.5 py-0.5 text-[10px] font-medium",
          daysInStage <= 3
            ? "bg-green-50 text-green-700"
            : daysInStage <= 7
            ? "bg-amber-50 text-amber-700"
            : "bg-muted-red-light text-muted-red"
        )}>
          <Clock className="h-2.5 w-2.5" />
          {daysInStage}d
        </span>
      </div>
    </div>
  );
}
