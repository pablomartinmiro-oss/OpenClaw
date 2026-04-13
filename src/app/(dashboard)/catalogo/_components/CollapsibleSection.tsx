"use client";

import { ChevronRight } from "lucide-react";

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function CollapsibleSection({ title, defaultOpen = false, children }: CollapsibleSectionProps) {
  return (
    <details
      open={defaultOpen || undefined}
      className="group rounded-xl border border-[#E8E4DE] bg-[#FAF9F7]"
    >
      <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#8A8580] select-none [&::-webkit-details-marker]:hidden">
        <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
        {title}
      </summary>
      <div className="space-y-3 px-4 pb-4">
        {children}
      </div>
    </details>
  );
}

/**
 * Determine if a collapsible section should auto-open based on field values.
 * Returns true if ANY field is non-null, non-empty, non-false, non-default.
 */
export function hasNonDefaultValues(
  fields: Record<string, unknown>,
  defaults?: Record<string, unknown>
): boolean {
  for (const [key, value] of Object.entries(fields)) {
    const def = defaults?.[key];
    if (value === null || value === undefined || value === "" || value === false) continue;
    if (def !== undefined && value === def) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    return true;
  }
  return false;
}
