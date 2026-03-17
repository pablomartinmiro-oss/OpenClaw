"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTenantSettings } from "@/hooks/useSettings";
import { Unplug } from "lucide-react";

interface GHLEmptyStateProps {
  /** Page-specific message shown when GHL is not connected */
  message: string;
  /** Optional action button */
  action?: {
    label: string;
    href: string;
  };
  children: React.ReactNode;
}

/**
 * Wraps page content. For non-demo tenants without GHL connected,
 * shows an empty state instead of the page content.
 * Demo tenants always see the children (they use mock data).
 */
export function GHLEmptyState({ message, action, children }: GHLEmptyStateProps) {
  const { data: session } = useSession();
  const { data: settings, isLoading } = useTenantSettings();

  // Demo tenants always see full content
  if (session?.user?.isDemo) {
    return <>{children}</>;
  }

  // Still loading — render children (skeletons will show)
  if (isLoading || !settings) {
    return <>{children}</>;
  }

  const isGHLConnected = !!settings.tenant.ghlLocationId;

  // GHL connected — show page content
  if (isGHLConnected) {
    return <>{children}</>;
  }

  // Not connected — show empty state
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-6 rounded-[16px] border border-dashed border-warm-border bg-white p-12 text-center">
      <div className="rounded-full bg-warm-muted p-5">
        <Unplug className="h-10 w-10 text-text-secondary" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-text-primary">
          {message}
        </h3>
        <p className="mt-2 max-w-md text-sm text-text-secondary">
          Conecta tu cuenta de GoHighLevel para sincronizar tus datos automáticamente.
        </p>
      </div>
      <div className="flex gap-3">
        <Link
          href="/api/crm/oauth/authorize"
          className="rounded-[10px] bg-coral px-6 py-2.5 text-sm font-medium text-white hover:bg-coral-hover transition-colors"
        >
          Conectar GoHighLevel
        </Link>
        {action && (
          <Link
            href={action.href}
            className="rounded-[10px] border border-warm-border px-6 py-2.5 text-sm font-medium text-text-primary hover:bg-warm-muted transition-colors"
          >
            {action.label}
          </Link>
        )}
      </div>
    </div>
  );
}
