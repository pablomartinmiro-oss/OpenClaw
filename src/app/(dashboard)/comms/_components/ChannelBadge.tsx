"use client";

import { cn } from "@/lib/utils";

const CHANNEL_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  WhatsApp: { label: "WhatsApp", color: "bg-green-50 text-green-600", icon: "💬" },
  Instagram: { label: "Instagram", color: "bg-pink-50 text-pink-600", icon: "📸" },
  Facebook: { label: "Facebook", color: "bg-blue-50 text-blue-600", icon: "👤" },
  SMS: { label: "SMS", color: "bg-coral-light text-coral", icon: "📱" },
  Email: { label: "Email", color: "bg-soft-blue-light text-soft-blue", icon: "✉️" },
  GMB: { label: "Google", color: "bg-yellow-50 text-yellow-600", icon: "🔍" },
};

interface ChannelBadgeProps {
  type: string;
  size?: "sm" | "md";
}

export function ChannelBadge({ type, size = "sm" }: ChannelBadgeProps) {
  const config = CHANNEL_CONFIG[type] || { label: type, color: "bg-muted text-text-secondary", icon: "💬" };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        config.color,
        size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
      )}
    >
      <span>{config.icon}</span>
      {size === "md" && <span>{config.label}</span>}
    </span>
  );
}

export function ChannelIcon({ type }: { type: string }) {
  const config = CHANNEL_CONFIG[type] || { icon: "💬" };
  return <span className="text-xs">{config.icon}</span>;
}

export { CHANNEL_CONFIG };
