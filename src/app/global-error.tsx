"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log to error tracking service
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <div className="flex flex-col items-center gap-4 text-center max-w-md">
            <AlertTriangle className="h-16 w-16 text-destructive" />
            <h1 className="text-2xl font-bold text-foreground">
              Algo salió mal
            </h1>
            <p className="text-muted-foreground">
              Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.
            </p>
            {error.message && (
              <code className="text-xs bg-muted p-2 rounded w-full overflow-auto">
                {error.message}
              </code>
            )}
            <button
              onClick={reset}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
