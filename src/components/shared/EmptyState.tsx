import { type ReactNode } from "react";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  children?: ReactNode;
  size?: "sm" | "md" | "lg";
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  children,
  size = "md",
}: EmptyStateProps) {
  const sizeMap = {
    sm: { wrapper: "min-h-[180px] p-6", icon: "h-8 w-8", iconWrap: "p-3", title: "text-base", desc: "text-sm max-w-xs" },
    md: { wrapper: "min-h-[280px] p-10", icon: "h-9 w-9", iconWrap: "p-4", title: "text-lg", desc: "text-sm max-w-sm" },
    lg: { wrapper: "min-h-[360px] p-12", icon: "h-11 w-11", iconWrap: "p-5", title: "text-xl", desc: "text-base max-w-md" },
  }[size];

  return (
    <div className={`animate-fade-in flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-white text-center ${sizeMap.wrapper}`}>
      {/* Icon */}
      <div className={`rounded-2xl bg-slate-50 ${sizeMap.iconWrap}`}>
        <Icon className={`text-slate-400 ${sizeMap.icon}`} />
      </div>

      {/* Text */}
      <div className="space-y-1">
        <h3 className={`font-semibold text-slate-800 ${sizeMap.title}`}>{title}</h3>
        {description && (
          <p className={`mx-auto leading-relaxed text-slate-500 ${sizeMap.desc}`}>
            {description}
          </p>
        )}
      </div>

      {/* Action */}
      {action && (
        <Button
          onClick={action.onClick}
          className="mt-1 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
        >
          {action.label}
        </Button>
      )}

      {children}
    </div>
  );
}

// ── Inline empty state (for table rows) ───────────────────
export function InlineEmpty({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-10 text-sm text-slate-400">
      {message}
    </div>
  );
}
