"use client";

import { Snowflake, Sun } from "lucide-react";
import { formatEUR } from "./constants";
import type { PriceLineItem } from "./pricing-helpers";
import type { Season } from "@/lib/pricing/types";

interface PriceBreakdownProps {
  lines: PriceLineItem[];
  total: number;
  season: Season;
}

export function PriceBreakdown({ lines, total, season }: PriceBreakdownProps) {
  if (lines.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-slate-100/50 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Desglose automático
        </span>
        {season === "alta" ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-coral">
            <Snowflake className="h-3 w-3" /> Alta
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700">
            <Sun className="h-3 w-3" /> Media
          </span>
        )}
      </div>
      <div className="space-y-1">
        {lines.map((line, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="text-slate-500">{line.label}</span>
            <span className="font-medium text-slate-900">{formatEUR(line.subtotal)}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
        <span className="text-sm font-semibold text-slate-900">Total calculado</span>
        <span className="text-base font-bold text-coral">{formatEUR(total)}</span>
      </div>
    </div>
  );
}
