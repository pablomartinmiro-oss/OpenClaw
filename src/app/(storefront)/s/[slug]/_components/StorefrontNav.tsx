"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useCart } from "./CartContext";
import React from "react";

const PHONE = "+34 91 904 19 47";
const HOURS = "L-V de 8:30 a 20:00";
const WHATSAPP_URL = "https://wa.me/34919041947";

const BEBAS: React.CSSProperties = {
  fontFamily: "var(--font-bebas-neue, 'Bebas Neue', cursive)",
};

const DESTINOS = [
  "Baqueira Beret",
  "Sierra Nevada",
  "Formigal",
  "Alto Campoo",
  "Candanchú",
  "Astún",
  "La Pinilla",
];

interface StorefrontNavProps {
  tenantName: string;
  slug: string;
}

export function StorefrontNav({ tenantName, slug }: StorefrontNavProps) {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [destinosOpen, setDestinosOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const base = `/s/${slug}`;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
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

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDestinosOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close destinos when navigating
  useEffect(() => {
    setDestinosOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      {/* ── Top bar ── */}
      <div className="bg-[#001D3D] text-white/80 text-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex items-center justify-between h-9">
          <a
            href={`tel:${PHONE.replace(/\s+/g, "")}`}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <PhoneSmIcon />
            <span>{PHONE}</span>
          </a>
          <span className="hidden sm:flex items-center gap-1.5">
            <ClockIcon />
            <span>{HOURS}</span>
          </span>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-[#2DB742] hover:text-[#25C039] transition-colors font-semibold"
          >
            <WhatsAppSmIcon />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>

      {/* ── Main nav ── */}
      <div
        className={`bg-white transition-shadow duration-200 ${scrolled ? "shadow-md" : "shadow-sm"}`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <Link href={base} className="flex items-center shrink-0">
              <Image
                src="/skicenter-logo-white.png"
                width={120}
                height={37}
                alt="Skicenter"
                style={{ filter: "brightness(0)" }}
                priority
              />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-0.5">
              {/* Destinos dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDestinosOpen(!destinosOpen)}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-[#001D3D] hover:text-[#42A5F5] transition-colors"
                >
                  Destinos
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className={`transition-transform duration-200 ${destinosOpen ? "rotate-180" : ""}`}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {destinosOpen && (
                  <div className="absolute top-full left-0 mt-0 w-52 bg-white border border-gray-100 shadow-xl z-50">
                    {DESTINOS.map((d) => (
                      <Link
                        key={d}
                        href={`${base}/experiencias?station=${encodeURIComponent(d)}`}
                        onClick={() => setDestinosOpen(false)}
                        className="block px-4 py-2.5 text-sm text-[#001D3D] hover:bg-[#F5F7F9] hover:text-[#42A5F5] transition-colors border-b border-gray-50 last:border-0"
                      >
                        {d}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link
                href={`${base}/experiencias`}
                className="px-3 py-2 text-sm font-medium text-[#001D3D] hover:text-[#42A5F5] transition-colors"
              >
                Servicios
              </Link>
              <Link
                href={base}
                className="px-3 py-2 text-sm font-medium text-[#001D3D] hover:text-[#42A5F5] transition-colors"
              >
                Inicio
              </Link>
              <Link
                href={`${base}/presupuesto`}
                className="px-3 py-2 text-sm font-medium text-[#001D3D] hover:text-[#42A5F5] transition-colors"
              >
                Contáctanos
              </Link>

              {/* Cart */}
              <Link
                href={`${base}/carrito`}
                className="relative ml-1 inline-flex items-center justify-center w-10 h-10 text-[#001D3D] hover:text-[#42A5F5] transition-colors"
                aria-label={`Carrito (${itemCount} articulos)`}
              >
                <CartIcon />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center bg-[#42A5F5] text-[11px] font-bold text-white">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </Link>

              {/* CTA button */}
              <Link
                href={`${base}/presupuesto`}
                className="ml-3 inline-flex items-center px-5 py-2.5 text-white bg-[#42A5F5] hover:bg-[#2196F3] transition-colors rounded-none text-sm tracking-wide"
                style={BEBAS}
              >
                SOLICITA TU PRESUPUESTO
              </Link>
            </nav>

            {/* Mobile: cart + hamburger */}
            <div className="flex items-center gap-2 md:hidden">
              <Link
                href={`${base}/carrito`}
                className="relative inline-flex items-center justify-center w-10 h-10 text-[#001D3D]"
              >
                <CartIcon />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center bg-[#42A5F5] text-[11px] font-bold text-white">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="inline-flex items-center justify-center w-10 h-10 text-[#001D3D]"
                aria-label={mobileOpen ? "Cerrar menu" : "Abrir menu"}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <CloseIcon /> : <MenuIcon />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/40 z-40"
            style={{ top: "100px" }}
            onClick={closeMobile}
          />
          <nav
            className="md:hidden fixed left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-xl px-4 py-4 overflow-y-auto max-h-[calc(100vh-100px)]"
            style={{ top: "100px" }}
          >
            <p className="px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-[#757575]">
              Destinos
            </p>
            {DESTINOS.map((d) => (
              <Link
                key={d}
                href={`${base}/experiencias?station=${encodeURIComponent(d)}`}
                onClick={closeMobile}
                className="block px-3 py-2.5 text-sm text-[#001D3D] hover:bg-[#F5F7F9] hover:text-[#42A5F5] border-b border-gray-50"
              >
                {d}
              </Link>
            ))}
            <div className="my-2 border-t border-gray-100" />
            <Link
              href={`${base}/experiencias`}
              onClick={closeMobile}
              className="block px-3 py-2.5 text-sm font-medium text-[#001D3D] hover:bg-[#F5F7F9]"
            >
              Servicios
            </Link>
            <Link
              href={base}
              onClick={closeMobile}
              className="block px-3 py-2.5 text-sm font-medium text-[#001D3D] hover:bg-[#F5F7F9]"
            >
              Inicio
            </Link>
            <Link
              href={`${base}/presupuesto`}
              onClick={closeMobile}
              className="block px-3 py-2.5 text-sm font-medium text-[#001D3D] hover:bg-[#F5F7F9]"
            >
              Contáctanos
            </Link>
            <div className="pt-3">
              <Link
                href={`${base}/presupuesto`}
                onClick={closeMobile}
                className="block text-center px-4 py-3 text-base text-white bg-[#42A5F5] hover:bg-[#2196F3] transition-colors rounded-none tracking-wide"
                style={BEBAS}
              >
                SOLICITA TU PRESUPUESTO
              </Link>
            </div>
          </nav>
        </>
      )}
    </header>
  );
}

function PhoneSmIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.37 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0122 16.92z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function WhatsAppSmIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.5 14.4c-.3-.1-1.7-.8-2-1-.3-.1-.5-.1-.7.1-.2.3-.7 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.2-.4-2.3-1.4-.8-.7-1.4-1.7-1.6-2-.2-.3 0-.4.1-.6.1-.1.3-.3.4-.5.1-.1.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.3 5.2 4.6.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3zM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.4c1.4.8 3.1 1.2 4.8 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2z" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M3 12h18M3 6h18M3 18h18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}
