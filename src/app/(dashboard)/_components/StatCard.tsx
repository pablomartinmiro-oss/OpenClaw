"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ElementType;
  loading?: boolean;
  iconColor?: string;
  iconBg?: string;
  trend?: { value: number; label: string };
  sparkline?: number[];
}

/** Mini SVG sparkline — 7 data points, 60x24 viewport */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 60;
  const h = 24;
  const pad = 2;

  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - 2 * pad);
    const y = h - pad - ((v - min) / range) * (h - 2 * pad);
    return `${x},${y}`;
  });

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0">
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  loading,
  iconColor = "text-coral",
  iconBg = "bg-coral-light",
  trend,
  sparkline,
}: StatCardProps) {
  const trendPositive = trend && trend.value >= 0;
  const trendColor = trendPositive ? "text-sage" : "text-muted-red";
  const sparkColor = iconColor.includes("coral")
    ? "#E87B5A"
    : iconColor.includes("sage")
      ? "#5B8C6D"
      : iconColor.includes("gold")
        ? "#D4A853"
        : iconColor.includes("soft-blue")
          ? "#6B8AAE"
          : iconColor.includes("muted-red")
            ? "#C75D4A"
            : "#E87B5A";

  return (
    <div className="card-hover rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconBg}`}
          >
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-text-secondary">{title}</p>
            {loading ? (
              <Skeleton className="mt-1 h-7 w-20" />
            ) : (
              <p className="text-xl font-bold text-text-primary">{value}</p>
            )}
          </div>
        </div>
        {!loading && sparkline && sparkline.length >= 2 && (
          <Sparkline data={sparkline} color={sparkColor} />
        )}
      </div>

      {!loading && (description || trend) && (
        <div className="mt-2 flex items-center gap-2 pl-[52px]">
          {trend && (
            <span className={`flex items-center gap-0.5 text-xs font-semibold ${trendColor}`}>
              {trendPositive ? "\u2191" : "\u2193"}
              {Math.abs(trend.value)}%
            </span>
          )}
          {description && (
            <p className="text-xs text-text-secondary">{description}</p>
          )}
        </div>
      )}
    </div>
  );
}
