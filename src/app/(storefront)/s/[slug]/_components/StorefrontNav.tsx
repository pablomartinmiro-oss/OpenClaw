"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useCart } from "./CartContext";

interface StorefrontNavProps {
  tenantName: string;
  slug: string;
}

const NAV_ITEMS = [
  { label: "Inicio", path: "" },
  { label: "Experiencias", path: "/experiencias" },
  { label: "Hotel", path: "/hotel" },
  { label: "Spa", path: "/spa" },
  { label: "Restaurante", path: "/restaurante" },
];

export function StorefrontNav({ tenantName, slug }: StorefrontNavProps) {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const base = `/s/${slug}`;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo / name */}
          <Link href={base} className="text-xl font-bold text-gray-900 truncate">
            {tenantName}
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const href = `${base}${item.path}`;
              const isActive =
                item.path === ""
                  ? pathname === base || pathname === `${base}/`
                  : pathname.startsWith(href);
              return (
                <Link
                  key={item.path}
                  href={href}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "text-[#E87B5A] bg-orange-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Cart + mobile toggle */}
          <div className="flex items-center gap-3">
            <Link
              href={`${base}/carrito`}
              className="relative inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            >
              <CartIcon />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#E87B5A] text-[11px] font-bold text-white">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              aria-label="Menu"
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-gray-100 bg-white px-4 pb-4 pt-2">
          {NAV_ITEMS.map((item) => {
            const href = `${base}${item.path}`;
            const isActive =
              item.path === ""
                ? pathname === base || pathname === `${base}/`
                : pathname.startsWith(href);
            return (
              <Link
                key={item.path}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? "text-[#E87B5A] bg-orange-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}

function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M3 12h18M3 6h18M3 18h18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}
