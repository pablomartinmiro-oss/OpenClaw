"use client";

import { StorefrontNav } from "./StorefrontNav";
import { CartProvider } from "./CartContext";

export interface StorefrontShellProps {
  tenantName: string;
  slug: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  children: React.ReactNode;
}

export function StorefrontShell({ tenantName, slug, contactEmail, contactPhone, children }: StorefrontShellProps) {
  return (
    <CartProvider>
      <div className="min-h-screen bg-white flex flex-col">
        <StorefrontNav tenantName={tenantName} slug={slug} />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-gray-200 bg-white px-6 py-8 text-center text-sm text-gray-500 space-y-2">
          {(contactEmail || contactPhone) && (
            <p>{contactEmail && <span>{contactEmail}</span>}{contactEmail && contactPhone && " · "}{contactPhone && <span>{contactPhone}</span>}</p>
          )}
          <p>&copy; {new Date().getFullYear()} {tenantName}. Todos los derechos reservados.</p>
          <div className="flex justify-center gap-4 text-xs">
            <a href={`/s/${slug}/politica-privacidad`} className="hover:underline">Privacidad</a>
            <a href={`/s/${slug}/terminos`} className="hover:underline">Términos</a>
            <a href={`/s/${slug}/cookies`} className="hover:underline">Cookies</a>
          </div>
        </footer>
      </div>
    </CartProvider>
  );
}
