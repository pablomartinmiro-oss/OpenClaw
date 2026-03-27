"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, UserPlus, CalendarCheck, FileText, X, CircleDollarSign, RefreshCw, AlertTriangle, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  type AppNotification,
} from "@/hooks/useNotifications";

const TYPE_ICON: Record<string, React.ReactNode> = {
  new_lead: <UserPlus className="h-4 w-4 text-coral" />,
  reservation_created: <CalendarCheck className="h-4 w-4 text-green-700" />,
  quote_expiring: <FileText className="h-4 w-4 text-amber-700" />,
  new_opportunity: <UserPlus className="h-4 w-4 text-soft-blue" />,
  payment_received: <CircleDollarSign className="h-4 w-4 text-green-700" />,
  sync_complete: <RefreshCw className="h-4 w-4 text-green-700" />,
  sync_error: <AlertTriangle className="h-4 w-4 text-red-500" />,
  new_message: <MessageSquare className="h-4 w-4 text-blue-600" />,
};

const TYPE_ROUTE: Record<string, string> = {
  new_lead: "/contacts",
  new_opportunity: "/pipeline",
  reservation_created: "/reservas",
  quote_expiring: "/presupuestos",
  payment_received: "/presupuestos",
  sync_complete: "/settings",
  sync_error: "/settings",
  new_message: "/comms",
};

const TYPE_BORDER: Record<string, string> = {
  new_lead: "border-l-coral",
  reservation_created: "border-l-sage",
  quote_expiring: "border-l-gold",
  new_opportunity: "border-l-soft-blue",
  payment_received: "border-l-sage",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  return `hace ${Math.floor(hours / 24)}d`;
}

function getTimeGroup(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 86_400_000);
  const weekStart = new Date(todayStart.getTime() - 7 * 86_400_000);

  if (date >= todayStart) return "Hoy";
  if (date >= yesterdayStart) return "Ayer";
  if (date >= weekStart) return "Esta semana";
  return "Anteriores";
}

function groupNotifications(items: AppNotification[]) {
  const groups: { label: string; items: AppNotification[] }[] = [];
  const order = ["Hoy", "Ayer", "Esta semana", "Anteriores"];
  const map = new Map<string, AppNotification[]>();

  for (const n of items) {
    const g = getTimeGroup(n.createdAt);
    if (!map.has(g)) map.set(g, []);
    map.get(g)!.push(n);
  }

  for (const label of order) {
    const groupItems = map.get(label);
    if (groupItems && groupItems.length > 0) {
      groups.push({ label, items: groupItems });
    }
  }
  return groups;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { data } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  const grouped = useMemo(() => groupNotifications(notifications), [notifications]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleItemClick(n: AppNotification) {
    if (!n.isRead) markRead.mutate(n.id);
    const route = (n.data?.route as string | undefined) ?? TYPE_ROUTE[n.type];
    if (route) {
      setOpen(false);
      router.push(route);
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-muted hover:text-slate-900"
        aria-label="Notificaciones"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral px-1 text-[10px] font-semibold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="animate-slide-in-right absolute right-0 top-10 z-50 w-80 rounded-2xl border border-warm-border bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-warm-border px-4 py-3">
            <span className="text-sm font-semibold text-slate-900">Notificaciones</span>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAll.mutate()}
                  className="flex items-center gap-1 text-[11px] text-slate-500 transition-colors hover:text-blue-600"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Marcar todo leído
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="rounded p-0.5 hover:bg-surface"
              >
                <X className="h-3.5 w-3.5 text-slate-500" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-sm text-slate-500">
                <Bell className="h-8 w-8 opacity-25" />
                <span>No hay notificaciones</span>
              </div>
            ) : (
              grouped.map((group) => (
                <div key={group.label}>
                  <div className="sticky top-0 bg-white/95 px-4 py-1.5 backdrop-blur-sm">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      {group.label}
                    </span>
                  </div>
                  {group.items.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => handleItemClick(n)}
                      className={cn(
                        "flex w-full items-start gap-3 border-l-[3px] px-4 py-3 text-left transition-colors hover:bg-surface",
                        TYPE_BORDER[n.type] ?? "border-l-transparent",
                        !n.isRead && "bg-coral/5"
                      )}
                    >
                      <div className="mt-0.5 shrink-0">
                        {TYPE_ICON[n.type] ?? <Bell className="h-4 w-4 text-slate-500" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "text-sm leading-snug",
                            !n.isRead
                              ? "font-semibold text-slate-900"
                              : "font-medium text-slate-900"
                          )}
                        >
                          {n.title}
                        </p>
                        {n.body && (
                          <p className="mt-0.5 truncate text-xs text-slate-500">{n.body}</p>
                        )}
                        <p className="mt-1 text-[10px] text-slate-500">{timeAgo(n.createdAt)}</p>
                      </div>
                      {!n.isRead && (
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-coral" />
                      )}
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
