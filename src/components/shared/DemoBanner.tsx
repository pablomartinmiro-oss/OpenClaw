"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

export function DemoBanner() {
  const { data: session } = useSession();

  if (!session?.user?.isDemo) return null;

  return (
    <div className="flex items-center justify-between bg-slate-800/95 px-4 py-2 text-sm border-b border-slate-700">
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
        <span className="text-slate-300 text-xs">
          Modo demo — datos ficticios
        </span>
      </div>
      <Link
        href="/register"
        className="rounded-lg bg-blue-600 hover:bg-blue-700 px-3 py-1 text-xs font-semibold text-white transition-colors"
      >
        Crear cuenta real →
      </Link>
    </div>
  );
}
