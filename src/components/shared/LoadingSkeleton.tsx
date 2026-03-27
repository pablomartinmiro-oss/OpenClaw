import { cn } from "@/lib/utils";

// ── Base skeleton pulse ────────────────────────────────────
function Skel({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={cn(
        "rounded-md bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:400%_100%]",
        className
      )}
      style={{ animation: "shimmer 1.4s ease-in-out infinite", ...style }}
    />
  );
}

// Add shimmer keyframe globally via style tag trick
// ── Stat Card Skeleton ─────────────────────────────────────
export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Skel className="h-3 w-20 mb-3" />
          <Skel className="h-7 w-24 mb-2" />
          <Skel className="h-4 w-16" />
        </div>
        <Skel className="h-9 w-9 rounded-lg" />
      </div>
    </div>
  );
}

// ── Table Skeleton ─────────────────────────────────────────
export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-slate-100">
        {[32, 48, 28, 20, 16].map((w, i) => (
          <Skel key={i} className={`h-3 w-${w}`} style={{ width: `${w * 4}px`, minWidth: `${w * 4}px` }} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-4 py-3.5 border-b border-slate-50 last:border-0"
          style={{ opacity: 1 - i * 0.08 }}
        >
          <Skel className="h-8 w-8 rounded-full shrink-0" />
          <div className="flex-1 flex items-center gap-4">
            <Skel className="h-3.5 w-36" />
            <Skel className="h-3 w-44 hidden md:block" />
            <Skel className="h-3 w-24 hidden lg:block" />
            <Skel className="h-5 w-16 rounded-full ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Kanban Skeleton ────────────────────────────────────────
export function KanbanSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {Array.from({ length: 5 }).map((_, col) => (
        <div key={col} className="flex-shrink-0 w-64 bg-slate-50 rounded-xl p-3 border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <Skel className="h-3.5 w-24" />
            <Skel className="h-5 w-8 rounded-full" />
          </div>
          {Array.from({ length: 3 - (col % 2) }).map((_, card) => (
            <div key={card} className="bg-white rounded-lg p-3.5 mb-2 border border-slate-100">
              <Skel className="h-3.5 w-full mb-2" />
              <Skel className="h-3 w-2/3 mb-3" />
              <div className="flex items-center justify-between">
                <Skel className="h-5 w-16 rounded-full" />
                <Skel className="h-4 w-12" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Dashboard Skeleton ─────────────────────────────────────
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skel className="h-6 w-40 mb-2" />
          <Skel className="h-4 w-56" />
        </div>
        <Skel className="h-9 w-28 rounded-lg" />
      </div>
      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 p-5">
          <Skel className="h-4 w-32 mb-4" />
          <Skel className="h-48 w-full rounded-lg" />
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <Skel className="h-4 w-24 mb-4" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 mb-3">
              <Skel className="h-7 w-7 rounded-full shrink-0" />
              <div className="flex-1">
                <Skel className="h-3 w-24 mb-1.5" />
                <Skel className="h-2.5 w-16" />
              </div>
              <Skel className="h-4 w-12" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Page skeleton (generic) ────────────────────────────────
export function PageSkeleton() {
  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <Skel className="h-6 w-36" />
        <Skel className="h-9 w-28 rounded-lg" />
      </div>
      <TableSkeleton rows={10} />
    </div>
  );
}

// ── Card skeleton (legacy compat) ─────────────────────────
export function CardSkeleton() {
  return <StatCardSkeleton />;
}

// ── Conversation List Skeleton ─────────────────────────────
export function ConversationListSkeleton() {
  return (
    <div className="space-y-1 p-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg" style={{ opacity: 1 - i * 0.1 }}>
          <div className="h-9 w-9 rounded-full bg-slate-200 animate-pulse shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="h-3 w-32 bg-slate-200 rounded animate-pulse mb-1.5" />
            <div className="h-2.5 w-48 bg-slate-100 rounded animate-pulse" />
          </div>
          <div className="h-2.5 w-8 bg-slate-100 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}
