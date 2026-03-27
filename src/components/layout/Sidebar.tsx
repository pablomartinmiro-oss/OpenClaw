"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  Kanban,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  FileText,
  Package,
  CalendarCheck,
  Mountain,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";
import { useQuoteDraftCount } from "@/hooks/useQuotes";
import { Badge } from "@/components/ui/badge";
import type { PermissionKey } from "@/types/auth";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  permission: PermissionKey | null;
  /** Roles allowed to see this item. Empty = all roles */
  roles?: string[];
  badge?: number;
}

// Role-based visibility:
// Owner/Manager: everything
// Sales Rep: Dashboard, Reservas, Comunicaciones, Catálogo
// VA/Admin + Marketing: permission-based filtering handles it
const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    permission: null,
  },
  {
    label: "Presupuestos",
    href: "/presupuestos",
    icon: FileText,
    permission: null,
    roles: ["Owner / Manager"],
  },
  {
    label: "Reservas",
    href: "/reservas",
    icon: CalendarCheck,
    permission: null,
  },
  {
    label: "Catálogo",
    href: "/catalogo",
    icon: Package,
    permission: null,
  },
  {
    label: "Comunicaciones",
    href: "/comms",
    icon: MessageSquare,
    permission: "comms:view",
  },
  {
    label: "Contactos",
    href: "/contacts",
    icon: Users,
    permission: "contacts:view",
    roles: ["Owner / Manager"],
  },
  {
    label: "Pipeline",
    href: "/pipeline",
    icon: Kanban,
    permission: "pipelines:view",
    roles: ["Owner / Manager"],
  },
  {
    label: "Ajustes",
    href: "/settings",
    icon: Settings,
    permission: "settings:team",
    roles: ["Owner / Manager"],
  },
];

interface SidebarProps {
  unreadCount?: number;
  todayReservations?: number;
}

export function Sidebar({ unreadCount = 0, todayReservations = 0 }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { can, roleName } = usePermissions();
  const { data: draftCount = 0 } = useQuoteDraftCount();

  const visibleItems = NAV_ITEMS.filter((item) => {
    // Permission check
    if (item.permission !== null && !can(item.permission)) return false;
    // Role check: if roles defined, user's role must be in the list
    if (item.roles && item.roles.length > 0 && !item.roles.includes(roleName)) {
      return false;
    }
    return true;
  });

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-[#1E2A3B] bg-[#0F1623] transition-all duration-200",
        collapsed ? "w-16" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-border px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-blue-600 text-white">
              <Mountain className="h-4 w-4" />
            </div>
            <span className="text-lg font-semibold text-white tracking-tight">
              Skicenter
            </span>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-[10px] bg-blue-600 text-white">
            <Mountain className="h-4 w-4" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "rounded-[10px] p-1.5 text-slate-400 hover:bg-[#1E2A3B] hover:text-white transition-colors",
            collapsed ? "mx-auto mt-2" : "ml-auto"
          )}
          aria-label={collapsed ? "Expandir barra lateral" : "Contraer barra lateral"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-3">
        {visibleItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          const badgeCount =
            item.href === "/comms" ? unreadCount :
            item.href === "/reservas" ? todayReservations :
            item.href === "/presupuestos" ? draftCount : 0;
          const showBadge = badgeCount > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "border-l-[3px] border-blue-500 bg-blue-500/10 text-white"
                  : "text-slate-400 hover:bg-[#1E2A3B] hover:text-white hover:translate-x-0.5",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={cn(
                "h-5 w-5 shrink-0 transition-colors duration-150",
                isActive && "text-blue-400"
              )} />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {showBadge && (
                    <Badge
                      variant={item.href === "/comms" || item.href === "/presupuestos" ? "destructive" : "secondary"}
                      className="h-5 min-w-5 justify-center rounded-full px-1 text-xs"
                    >
                      {badgeCount > 99 ? "99+" : badgeCount}
                    </Badge>
                  )}
                </>
              )}
              {collapsed && showBadge && (
                <span className="absolute right-1 top-0.5 h-2 w-2 rounded-full bg-destructive" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-3">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sage opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-sage" />
            </span>
            <p className="truncate text-xs text-slate-500">
              Skicenter v1.0
            </p>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sage opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-sage" />
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}
