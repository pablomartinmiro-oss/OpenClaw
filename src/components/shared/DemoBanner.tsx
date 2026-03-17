"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

export function DemoBanner() {
  const { data: session } = useSession();

  if (!session?.user?.isDemo) return null;

  return (
    <div
      className="flex items-center justify-between border-l-4 border-coral px-4 py-2.5 text-sm"
      style={{ backgroundColor: "rgba(232, 123, 90, 0.10)" }}
    >
      <span className="font-medium text-text-primary">
        Modo demostración — los datos son ficticios.
      </span>
      <Link
        href="/register"
        className="rounded-[10px] bg-coral px-4 py-1.5 text-sm font-medium text-white hover:bg-coral-hover transition-colors"
      >
        Crear tu cuenta real →
      </Link>
    </div>
  );
}
