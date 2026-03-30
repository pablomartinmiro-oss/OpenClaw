"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, TrendingUp, Users, UserCheck, Grid3x3, ChevronRight,
} from "lucide-react";

const nav = [
  { href: "/sensa-padel", label: "Dashboard", icon: LayoutDashboard },
  { href: "/sensa-padel/revenue", label: "Revenue", icon: TrendingUp },
  { href: "/sensa-padel/leads", label: "Leads", icon: UserCheck },
  { href: "/sensa-padel/members", label: "Members", icon: Users },
  { href: "/sensa-padel/courts", label: "Courts", icon: Grid3x3 },
];

export default function SensaLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-60 flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-500/20 flex items-center justify-center text-lg">🎾</div>
            <div>
              <span className="font-bold text-sm text-white">SENSA</span>
              <span className="font-bold text-sm text-blue-400 ml-1">PADEL</span>
              <div className="text-xs text-gray-400">GM Command Center</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/sensa-padel" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-green-500/20 text-green-400"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <Icon size={16} />
                {label}
                {active && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-800">
          <Link
            href="/sensa-padel"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            ← Inicio Sensa Padel
          </Link>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
