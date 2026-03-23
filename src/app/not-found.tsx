"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Home, RefreshCw } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    console.log("404 - Page not found");
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center gap-4 text-center max-w-md">
        <AlertCircle className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-4xl font-bold text-foreground">404</h1>
        <h2 className="text-xl font-semibold text-foreground">
          Página no encontrada
        </h2>
        <p className="text-muted-foreground">
          La página que buscas no existe o ha sido movida.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Home className="h-4 w-4" />
            Ir al Dashboard
          </button>
          <button
            onClick={() => router.refresh()}
            className="flex items-center gap-2 rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </button>
        </div>
      </div>
    </div>
  );
}
