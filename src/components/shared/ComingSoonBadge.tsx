"use client";

import { Clock } from "lucide-react";

interface ComingSoonBadgeProps {
  message: string;
  variant?: "inline" | "banner" | "tooltip";
}

export function ComingSoonBadge({ message, variant = "inline" }: ComingSoonBadgeProps) {
  if (variant === "banner") {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-[#D4A853]/30 bg-[#D4A853]/10 p-4">
        <Clock className="h-4 w-4 text-[#D4A853] mt-0.5 shrink-0" />
        <p className="text-sm text-[#2D2A26]">{message}</p>
      </div>
    );
  }

  if (variant === "tooltip") {
    return (
      <span className="group relative inline-flex items-center gap-1 rounded-[6px] bg-[#D4A853]/15 px-2 py-0.5 text-xs font-medium text-[#D4A853] cursor-help">
        <Clock className="h-3 w-3" />
        Próximamente
        <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] rounded-lg bg-[#2D2A26] px-3 py-2 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 z-10">
          {message}
        </span>
      </span>
    );
  }

  // inline
  return (
    <span className="inline-flex items-center gap-1 rounded-[6px] bg-[#D4A853]/15 px-2 py-0.5 text-xs font-medium text-[#D4A853]">
      <Clock className="h-3 w-3" />
      Próximamente
    </span>
  );
}
