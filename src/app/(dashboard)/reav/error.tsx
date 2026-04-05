"use client";

import { useEffect } from "react";
import { Scale, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("reav page error:", error);
  }, [error]);

  return (
    <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-[#8A8580] max-w-md text-center px-4">
        <Scale className="h-12 w-12 text-[#C75D4A]" />
        <h2 className="text-lg font-semibold text-[#2D2A26]">
          Error al cargar REAV
        </h2>
        <p className="text-sm">
          {error.message || "Ha ocurrido un error inesperado."}
        </p>
        <button
          onClick={reset}
          className="flex items-center gap-2 rounded-[10px] bg-[#E87B5A] px-4 py-2 text-sm font-medium text-white hover:bg-[#D56E4F] transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Reintentar
        </button>
      </div>
    </div>
  );
}
