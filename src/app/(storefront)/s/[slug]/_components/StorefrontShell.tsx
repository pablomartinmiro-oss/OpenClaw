"use client";

import { StorefrontNav } from "./StorefrontNav";
import { CartProvider } from "./CartContext";

interface StorefrontShellProps {
  tenantName: string;
  slug: string;
  children: React.ReactNode;
}

export function StorefrontShell({ tenantName, slug, children }: StorefrontShellProps) {
  return (
    <CartProvider>
      <div className="min-h-screen bg-white flex flex-col">
        <StorefrontNav tenantName={tenantName} slug={slug} />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-gray-200 bg-white px-6 py-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} {tenantName}. Todos los derechos reservados.
        </footer>
      </div>
    </CartProvider>
  );
}
