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
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  children,
}: EmptyStateProps) {
  return (
    <div className="animate-fade-in flex min-h-[320px] flex-col items-center justify-center gap-5 rounded-2xl border border-dashed border-border bg-white p-10 text-center">
      <div className="rounded-full bg-blue-50 p-5">
        <Icon className="h-10 w-10 text-coral" />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
        {description && (
          <p className="mx-auto max-w-sm text-sm leading-relaxed text-slate-500">
            {description}
          </p>
        )}
      </div>
      {action && (
        <Button onClick={action.onClick} className="mt-1 hover-lift">
          {action.label}
        </Button>
      )}
      {children}
    </div>
  );
}
