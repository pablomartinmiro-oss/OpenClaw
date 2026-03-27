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

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 64;
  const h = 28;
  const pad = 2;

  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - 2 * pad);
    const y = h - pad - ((v - min) / range) * (h - 2 * pad);
    return `${x},${y}`;
  });

  // Fill area under the line
  const fillPts = [
    `${pad},${h}`,
    ...pts,
    `${w - pad},${h}`,
  ].join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0 opacity-80">
      <polygon points={fillPts} fill={color} fillOpacity={0.12} />
      <polyline
        points={pts.join(" ")}
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
  iconColor = "text-blue-500",
  iconBg = "bg-blue-500/10",
  trend,
  sparkline,
}: StatCardProps) {
  const trendPositive = trend && trend.value >= 0;

  const sparkColor =
    iconColor.includes("blue") ? "#0066FF" :
    iconColor.includes("green") || iconColor.includes("sage") ? "#10B981" :
    iconColor.includes("yellow") || iconColor.includes("gold") ? "#F59E0B" :
    iconColor.includes("red") || iconColor.includes("muted-red") ? "#EF4444" :
    iconColor.includes("purple") ? "#8B5CF6" :
    "#0066FF";

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white border border-slate-100 p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      {/* Subtle top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${
        sparkColor === "#0066FF" ? "bg-blue-500" :
        sparkColor === "#10B981" ? "bg-emerald-500" :
        sparkColor === "#F59E0B" ? "bg-amber-500" :
        sparkColor === "#EF4444" ? "bg-red-500" :
        "bg-blue-500"
      } opacity-0 group-hover:opacity-100 transition-opacity`} />

      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">{title}</p>
          {loading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <p className="text-2xl font-bold text-slate-900 leading-none">{value}</p>
          )}
          {!loading && (description || trend) && (
            <div className="flex items-center gap-1.5 mt-2">
              {trend && (
                <span className={`flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                  trendPositive
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-red-50 text-red-500"
                }`}>
                  {trendPositive ? "↑" : "↓"}
                  {Math.abs(trend.value)}%
                </span>
              )}
              {description && (
                <p className="text-xs text-slate-400">{description}</p>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
          {!loading && sparkline && sparkline.length >= 2 && (
            <Sparkline data={sparkline} color={sparkColor} />
          )}
        </div>
      </div>
    </div>
  );
}
