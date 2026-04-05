"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
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

  const closeMobile = () => setMobileOpen(false);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isActivePath = (path: string) => {
    const href = `${base}${path}`;
    return path === ""
      ? pathname === base || pathname === `${base}/`
      : pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo / name */}
          <Link
            href={base}
            className="text-xl font-bold text-gray-900 truncate max-w-[200px]"
          >
            {tenantName}
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const href = `${base}${item.path}`;
              const isActive = isActivePath(item.path);
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
          <div className="flex items-center gap-2">
            <Link
              href={`${base}/carrito`}
              className="relative inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              aria-label={`Carrito (${itemCount} articulos)`}
            >
              <CartIcon />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#E87B5A] text-[11px] font-bold text-white shadow-sm">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              aria-label={mobileOpen ? "Cerrar menu" : "Abrir menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav overlay */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 top-16 bg-black/20 z-40"
            onClick={() => setMobileOpen(false)}
          />
          {/* Menu */}
          <nav className="md:hidden fixed top-16 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-lg px-4 pb-4 pt-2">
            {NAV_ITEMS.map((item) => {
              const href = `${base}${item.path}`;
              const isActive = isActivePath(item.path);
              return (
                <Link
                  key={item.path}
                  href={href}
                  onClick={closeMobile}
                  className={`block px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "text-[#E87B5A] bg-orange-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            {/* Cart link in mobile menu */}
            <Link
              href={`${base}/carrito`}
              onClick={closeMobile}
              className={`flex items-center justify-between px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                pathname.startsWith(`${base}/carrito`)
                  ? "text-[#E87B5A] bg-orange-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <span>Carrito</span>
              {itemCount > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#E87B5A] px-1.5 text-[11px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </Link>
          </nav>
        </>
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
