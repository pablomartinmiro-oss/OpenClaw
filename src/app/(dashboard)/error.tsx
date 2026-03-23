"use client";

import { useEffect } from "react";
import { LayoutDashboard, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-text-secondary max-w-md text-center px-4">
        <LayoutDashboard className="h-12 w-12 text-muted-red" />
        <h2 className="text-lg font-semibold text-text-primary">
          Error al cargar el dashboard
        </h2>
        <p className="text-sm">
          {error.message || "Ha ocurrido un error inesperado."}
        </p>
        <button
          onClick={reset}
          className="flex items-center gap-2 rounded-lg bg-coral px-4 py-2 text-sm font-medium text-white hover:bg-coral-hover transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Reintentar
        </button>
      </div>
    </div>
  );
}
