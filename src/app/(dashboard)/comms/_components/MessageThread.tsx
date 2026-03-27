"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { GHLMessage } from "@/lib/ghl/types";

interface MessageThreadProps {
  messages: GHLMessage[];
  loading: boolean;
}

export function MessageThread({ messages, loading }: MessageThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    if (!search) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, search]);

  const sorted = useMemo(
    () =>
      [...messages].sort(
        (a, b) => new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime()
      ),
    [messages]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return sorted;
    const q = search.toLowerCase();
    return sorted.filter((m) => m.body?.toLowerCase().includes(q));
  }, [sorted, search]);

  const groups = useMemo(() => {
    const result: { label: string; messages: typeof sorted }[] = [];
    for (const msg of filtered) {
      const label = getDayLabel(new Date(msg.dateAdded));
      const last = result[result.length - 1];
      if (last && last.label === label) {
        last.messages.push(msg);
      } else {
        result.push({ label, messages: [msg] });
      }
    }
    return result;
  }, [filtered]);

  if (loading) {
    return (
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={cn("flex", i % 2 === 0 ? "justify-start" : "justify-end")}>
            <Skeleton className="h-12 w-48 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        No hay mensajes aún
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Search bar */}
      <div className="flex items-center justify-end border-b border-border px-3 py-1.5">
        {showSearch ? (
          <div className="flex w-full items-center gap-2">
            <Search className="h-3.5 w-3.5 shrink-0 text-slate-500" />
            <input
              autoFocus
              type="text"
              placeholder="Buscar en la conversación..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm placeholder:text-slate-500 focus:outline-none"
            />
            {search && (
              <span className="text-[11px] text-slate-500">
                {filtered.length}/{sorted.length}
              </span>
            )}
            <button
              onClick={() => { setShowSearch(false); setSearch(""); }}
              className="rounded p-0.5 hover:bg-slate-100"
            >
              <X className="h-3.5 w-3.5 text-slate-500" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowSearch(true)}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <Search className="h-3 w-3" /> Buscar
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-surface p-4">
        {filtered.length === 0 && search ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            Sin resultados para &quot;{search}&quot;
          </div>
        ) : (
          <div className="space-y-4">
            {groups.map((group) => (
              <div key={group.label}>
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-[11px] font-medium text-slate-500">{group.label}</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="space-y-3">
                  {group.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex",
                        msg.direction === "outbound" ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
                          msg.direction === "outbound"
                            ? "bg-blue-50 text-slate-900"
                            : "bg-white text-slate-900 shadow-[0_1px_2px_rgba(0,0,0,0.06)]",
                          search && msg.body?.toLowerCase().includes(search.toLowerCase()) &&
                            "ring-2 ring-blue-500/40"
                        )}
                      >
                        <p className="whitespace-pre-wrap">
                          {highlightText(msg.body ?? "", search)}
                        </p>
                        <p className="mt-1 text-[10px] text-slate-500">
                          {new Date(msg.dateAdded).toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="rounded bg-gold/30 px-0.5 not-italic">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

function getDayLabel(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const msgDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((today.getTime() - msgDay.getTime()) / 86400000);

  if (msgDay.getTime() === today.getTime()) return "Hoy";
  if (msgDay.getTime() === yesterday.getTime()) return "Ayer";
  if (diffDays < 7) return date.toLocaleDateString("es-ES", { weekday: "long" });
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
}
