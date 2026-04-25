"use client";

import { StorefrontNav } from "./StorefrontNav";
import { StorefrontFooter } from "./StorefrontFooter";
import { CartProvider } from "./CartContext";
import { usePathname } from "next/navigation";

export interface StorefrontShellProps {
  tenantName: string;
  slug: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  children: React.ReactNode;
}

export function StorefrontShell({
  tenantName,
  slug,
  contactEmail,
  contactPhone,
  children,
}: StorefrontShellProps) {
  const pathname = usePathname();
  const base = `/s/${slug}`;
  const isHome = pathname === base || pathname === `${base}/`;

  return (
    <CartProvider>
      <div className="min-h-screen bg-[#FAF9F7] flex flex-col font-sans">
        <StorefrontNav tenantName={tenantName} slug={slug} />
        <main className={`flex-1 ${isHome ? "" : "pt-16"}`}>{children}</main>
        <StorefrontFooter
          tenantName={tenantName}
          slug={slug}
          contactEmail={contactEmail}
          contactPhone={contactPhone}
        />
      </div>
    </CartProvider>
  );
}
