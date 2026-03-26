"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, CalendarDays, TrendingUp,
  Zap, Settings, ChevronRight
} from "lucide-react";

const nav = [
  { href: "/padel-club-madrid", label: "Dashboard", icon: LayoutDashboard },
  { href: "/padel-club-madrid/members", label: "Members", icon: Users },
  { href: "/padel-club-madrid/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/padel-club-madrid/pipeline", label: "Pipeline", icon: TrendingUp },
  { href: "/padel-club-madrid/automations", label: "Automations", icon: Zap },
];

export default function PadelLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-60 flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-500/20 flex items-center justify-center text-lg">🎾</div>
            <div>
              <div className="font-bold text-sm">Padel Club Madrid</div>
              <div className="text-xs text-gray-400">Viddix AI Client</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
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
            href="/agency"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            ← Back to Agency
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
