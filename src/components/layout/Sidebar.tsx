"use client";

import { useState, useMemo } from "react";
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
  Building2,
  Sparkles,
  UtensilsCrossed,
  Receipt,
  Truck,
  Scale,
  CreditCard,
  ShoppingCart,
  PanelsTopLeft,
  Ticket,
  Star,
  Boxes,
  ClipboardList,
  UserCheck,
  Wallet,
  GraduationCap,
  Calendar,
  Clock,
  XCircle,
  User,
  Snowflake,
  CalendarCog,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";
import { useModules } from "@/hooks/useModules";
import { useQuoteDraftCount } from "@/hooks/useQuotes";
import { Badge } from "@/components/ui/badge";
import { MODULE_REGISTRY, SECTION_ORDER } from "@/lib/modules/registry";
import type { PermissionKey } from "@/types/auth";

/** Map icon name strings from the registry to actual Lucide components */
const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Settings,
  Users,
  Kanban,
  MessageSquare,
  Package,
  FileText,
  CalendarCheck,
  ClipboardList,
  Building2,
  Sparkles,
  UtensilsCrossed,
  Receipt,
  Truck,
  Scale,
  CreditCard,
  ShoppingCart,
  PanelsTopLeft,
  Ticket,
  Star,
  Boxes,
  UserCheck,
  Wallet,
  GraduationCap,
  Calendar,
  Clock,
  XCircle,
  User,
  Snowflake,
  CalendarCog,
};

interface ResolvedNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  permission: PermissionKey | null;
  roles?: string[];
  badge?: string;
  section: string;
  sectionLabel: string;
  sectionOrder: number;
}

interface SidebarProps {
  unreadCount?: number;
  todayReservations?: number;
}

export function Sidebar({ unreadCount = 0, todayReservations = 0 }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { can, roleName } = usePermissions();
  const { isEnabled, modules } = useModules();
  const { data: draftCount = 0 } = useQuoteDraftCount();

  /** Build nav items from enabled modules */
  const resolvedItems = useMemo(() => {
    const items: ResolvedNavItem[] = [];

    for (const mod of Object.values(MODULE_REGISTRY)) {
      if (!isEnabled(mod.slug)) continue;

      const sectionMeta = SECTION_ORDER[mod.section] ?? { label: mod.section, order: 99 };

      for (const nav of mod.navItems) {
        const Icon = ICON_MAP[nav.icon];
        if (!Icon) continue;

        items.push({
          label: nav.label,
          href: nav.href,
          icon: Icon,
          permission: (nav.permission ?? null) as PermissionKey | null,
          roles: nav.roles,
          badge: nav.badge,
          section: mod.section,
          sectionLabel: sectionMeta.label,
          sectionOrder: sectionMeta.order,
        });
      }
    }

    // Sort by section order (items within a section keep registry order)
    items.sort((a, b) => a.sectionOrder - b.sectionOrder);
    return items;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modules]);

  /** Filter by permission and role */
  const visibleItems = resolvedItems.filter((item) => {
    if (item.permission !== null && !can(item.permission)) return false;
    if (item.roles && item.roles.length > 0 && !item.roles.includes(roleName)) {
      return false;
    }
    return true;
  });

  /** Get badge count for a nav item */
  function getBadgeCount(item: ResolvedNavItem): number {
    if (item.badge === "unreadMessages") return unreadCount;
    if (item.badge === "todayReservations") return todayReservations;
    if (item.badge === "draftQuotes") return draftCount;
    return 0;
  }

  /** Track which section labels have been rendered */
  let lastSection = "";

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-[#162032] bg-[#0C1220] transition-all duration-200",
        collapsed ? "w-16" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-border px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400">
              <Mountain className="h-4 w-4" />
            </div>
            <span className="text-[15px] font-bold text-white tracking-tight">
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
            "rounded-md p-1.5 text-slate-500 hover:bg-[#162032] hover:text-slate-300 transition-colors",
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
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
        {visibleItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          const badgeCount = getBadgeCount(item);
          const showBadge = badgeCount > 0;

          // Section header
          let sectionHeader: React.ReactNode = null;
          if (item.sectionLabel && item.section !== lastSection && !collapsed) {
            lastSection = item.section;
            sectionHeader = (
              <div
                key={`section-${item.section}`}
                className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500"
              >
                {item.sectionLabel}
              </div>
            );
          } else if (item.section !== lastSection) {
            lastSection = item.section;
          }

          return (
            <div key={item.href}>
              {sectionHeader}
              <Link
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-[#162032] text-white font-medium"
                    : "text-slate-400 hover:bg-[#162032] hover:text-slate-200 hover:translate-x-0.5",
                  collapsed && "justify-center px-2"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={cn(
                  "h-5 w-5 shrink-0 transition-colors duration-150",
                  isActive ? "text-blue-400" : "text-slate-500"
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
            </div>
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
