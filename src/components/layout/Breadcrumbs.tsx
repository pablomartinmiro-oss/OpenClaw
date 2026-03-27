"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const LABELS: Record<string, string> = {
  "contacts": "Contactos",
  "pipeline": "Pipeline",
  "comms": "Comunicaciones",
  "presupuestos": "Presupuestos",
  "reservas": "Reservas",
  "catalogo": "Catálogo",
  "settings": "Ajustes",
  "agency": "Agency",
  "command": "Command Center",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  const crumbs = segments.map((seg, i) => ({
    label: LABELS[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1),
    href: "/" + segments.slice(0, i + 1).join("/"),
    isLast: i === segments.length - 1,
  }));

  return (
    <nav className="flex items-center gap-1 text-xs text-slate-400 mb-4">
      <Link href="/" className="hover:text-slate-600 transition-colors">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {crumbs.map((crumb) => (
        <span key={crumb.href} className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3 text-slate-300" />
          {crumb.isLast ? (
            <span className="text-slate-600 font-medium">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="hover:text-slate-600 transition-colors">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
