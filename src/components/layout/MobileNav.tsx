"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import {
  MessageSquare,
  Kanban,
  Users,
  Settings,
  LayoutDashboard,
  FileText,
  Package,
  CalendarCheck,
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
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";
import { useModules } from "@/hooks/useModules";
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
};

interface ResolvedNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  permission: PermissionKey | null;
  roles?: string[];
  section: string;
  sectionLabel: string;
  sectionOrder: number;
}

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { can, roleName } = usePermissions();
  const { isEnabled, modules } = useModules();

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
          section: mod.section,
          sectionLabel: sectionMeta.label,
          sectionOrder: sectionMeta.order,
        });
      }
    }

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

  /** Track which section labels have been rendered */
  let lastSection = "";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="rounded-md p-2 text-muted-foreground hover:bg-accent md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-64 bg-sidebar-bg p-0">
        <SheetTitle className="sr-only">Navigation menu</SheetTitle>
        <div className="flex h-14 items-center border-b border-border px-4">
          <span className="text-lg font-semibold text-slate-900">Skicenter</span>
        </div>
        <nav className="space-y-1 overflow-y-auto px-2 py-3">
          {visibleItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            // Section header
            let sectionHeader: React.ReactNode = null;
            if (item.sectionLabel && item.section !== lastSection) {
              lastSection = item.section;
              sectionHeader = (
                <div
                  key={`section-${item.section}`}
                  className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400"
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
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors min-h-[44px]",
                    isActive
                      ? "border-l-[3px] border-blue-500 bg-slate-100 text-slate-900"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </div>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
