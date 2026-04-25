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
  { label: "Destinos", path: "/experiencias" },
  { label: "Servicios", path: "/#servicios" },
  { label: "Packs", path: "/experiencias?category=pack" },
  { label: "Contacto", path: "/#contacto" },
];

export function StorefrontNav({ tenantName, slug }: StorefrontNavProps) {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const base = `/s/${slug}`;

  const isHome = pathname === base || pathname === `${base}/`;
  const transparent = isHome && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);

  const headerCls = transparent
    ? "bg-transparent border-transparent"
    : "bg-white/95 backdrop-blur-md border-gray-200 shadow-sm";

  const linkCls = transparent
    ? "text-white/90 hover:text-white"
    : "text-gray-700 hover:text-gray-950";

  const logoCls = transparent ? "text-white" : "text-gray-950";

  const iconBtnCls = transparent
    ? "text-white hover:bg-white/10"
    : "text-gray-700 hover:bg-gray-100";

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 border-b transition-colors duration-300 ${headerCls}`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link
            href={base}
            className={`flex items-center gap-2 font-bold tracking-tight truncate ${logoCls}`}
          >
            <LogoMark transparent={transparent} />
            <span className="text-lg sm:text-xl truncate max-w-[180px]">
              {tenantName}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                href={`${base}${item.path}`}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${linkCls}`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={`${base}/presupuesto`}
              className="ml-2 inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-[#E87B5A] hover:bg-[#D56E4F] rounded-lg shadow-sm transition-colors"
            >
              Solicita Presupuesto
            </Link>
          </nav>

          <div className="flex items-center gap-1 md:gap-2">
            <Link
              href={`${base}/carrito`}
              className={`relative inline-flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${iconBtnCls}`}
              aria-label={`Carrito (${itemCount} articulos)`}
            >
              <CartIcon />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#E87B5A] text-[11px] font-bold text-white shadow-sm">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${iconBtnCls}`}
              aria-label={mobileOpen ? "Cerrar menu" : "Abrir menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 top-16 bg-black/40 z-40"
            onClick={closeMobile}
          />
          <nav className="md:hidden fixed top-16 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-lg px-4 py-4 space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                href={`${base}${item.path}`}
                onClick={closeMobile}
                className="block px-3 py-3 text-base font-medium rounded-lg text-gray-700 hover:text-gray-950 hover:bg-gray-50"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={`${base}/presupuesto`}
              onClick={closeMobile}
              className="block text-center mt-2 px-4 py-3 text-base font-semibold text-white bg-[#E87B5A] hover:bg-[#D56E4F] rounded-lg shadow-sm"
            >
              Solicita Presupuesto
            </Link>
            <Link
              href={`${base}/carrito`}
              onClick={closeMobile}
              className="flex items-center justify-between mt-1 px-3 py-3 text-base font-medium text-gray-700 rounded-lg hover:bg-gray-50"
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

function LogoMark({ transparent }: { transparent: boolean }) {
  return (
    <span
      className={`flex h-9 w-9 items-center justify-center rounded-xl shadow-sm ${
        transparent ? "bg-white/15 backdrop-blur" : "bg-[#E87B5A]"
      }`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 20l4.5-7 3.5 4 5-8 5 11z" />
        <circle cx="17" cy="6" r="1.5" />
      </svg>
    </span>
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
