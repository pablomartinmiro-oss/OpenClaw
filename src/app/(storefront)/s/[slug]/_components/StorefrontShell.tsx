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
      <div
        className="min-h-screen bg-white flex flex-col"
        style={{ fontFamily: "var(--font-raleway, 'Raleway', sans-serif)" }}
      >
        <StorefrontNav tenantName={tenantName} slug={slug} />
        {/* top bar 36px + main nav 64px = 100px offset for non-home pages */}
        <main className={`flex-1 ${isHome ? "" : "pt-[100px]"}`}>
          {children}
        </main>
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
