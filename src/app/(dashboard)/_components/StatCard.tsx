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
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  loading,
  iconColor = "text-coral",
  iconBg = "bg-coral-light",
}: StatCardProps) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-shadow">
      <div className="flex items-center gap-4">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-text-secondary">{title}</p>
          {loading ? (
            <Skeleton className="mt-1 h-7 w-20" />
          ) : (
            <p className="text-2xl font-bold text-text-primary">{value}</p>
          )}
          {!loading && description && (
            <p className="mt-0.5 text-xs text-text-secondary">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
