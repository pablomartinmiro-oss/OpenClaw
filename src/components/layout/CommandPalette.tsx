"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, MessageSquare, Columns3,
  CalendarDays, FileText, ShoppingBag, Settings,
  Plus, Search, ArrowRight, Zap, Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  section: string;
  action: () => void;
  keywords?: string[];
  shortcut?: string;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const nav = useCallback((path: string) => {
    setOpen(false);
    router.push(path);
  }, [router]);

  const commands: Command[] = useMemo(() => [
    { id: "nav-dash",          label: "Dashboard",        description: "Vista general y KPIs",      icon: <LayoutDashboard className="h-4 w-4" />, section: "Navegar",  action: () => nav("/"),              keywords: ["inicio", "home"] },
    { id: "nav-contacts",      label: "Contactos",        description: "5,674 contactos",           icon: <Users className="h-4 w-4" />,          section: "Navegar",  action: () => nav("/contacts"),      keywords: ["clientes"] },
    { id: "nav-comms",         label: "Comunicaciones",   description: "SMS, email, WhatsApp",      icon: <MessageSquare className="h-4 w-4" />,  section: "Navegar",  action: () => nav("/comms"),         keywords: ["mensajes", "chat"] },
    { id: "nav-pipeline",      label: "Pipeline",         description: "Oportunidades y ventas",    icon: <Columns3 className="h-4 w-4" />,       section: "Navegar",  action: () => nav("/pipeline"),      keywords: ["kanban", "ventas"] },
    { id: "nav-reservas",      label: "Reservas",         description: "Gestión de reservas",       icon: <CalendarDays className="h-4 w-4" />,   section: "Navegar",  action: () => nav("/reservas"),      keywords: ["booking"] },
    { id: "nav-presupuestos",  label: "Presupuestos",     description: "Quotes y propuestas",       icon: <FileText className="h-4 w-4" />,       section: "Navegar",  action: () => nav("/presupuestos"),  keywords: ["quotes"] },
    { id: "nav-catalogo",      label: "Catálogo",         description: "93 productos",              icon: <ShoppingBag className="h-4 w-4" />,    section: "Navegar",  action: () => nav("/catalogo"),      keywords: ["productos"] },
    { id: "nav-settings",      label: "Ajustes",          description: "Configuración",             icon: <Settings className="h-4 w-4" />,       section: "Navegar",  action: () => nav("/settings"),      keywords: ["config"] },
    { id: "act-new-reserva",   label: "Nueva reserva",    description: "Crear reserva",             icon: <Plus className="h-4 w-4" />,           section: "Acciones", action: () => nav("/reservas"),      shortcut: "N R" },
    { id: "act-new-quote",     label: "Nuevo presupuesto",description: "Crear presupuesto",         icon: <Plus className="h-4 w-4" />,           section: "Acciones", action: () => nav("/presupuestos"),  shortcut: "N P" },
    { id: "act-agency",        label: "Agency Overview",  description: "Ver todos los clientes",    icon: <Building2 className="h-4 w-4" />,      section: "Acciones", action: () => nav("/agency") },
    { id: "act-command",       label: "Command Center",   description: "Agentes y tareas AI",       icon: <Zap className="h-4 w-4" />,            section: "Acciones", action: () => nav("/command") },
  ], [nav]);

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(c =>
      c.label.toLowerCase().includes(q) ||
      c.section.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q) ||
      c.keywords?.some(k => k.includes(q))
    );
  }, [commands, query]);

  useEffect(() => { setSelectedIdx(0); }, [filtered.length]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(prev => { if (!prev) { setQuery(""); setSelectedIdx(0); } return !prev; });
      }
      if (e.key === "Escape" && open) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, filtered.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && filtered[selectedIdx]) { e.preventDefault(); filtered[selectedIdx].action(); }
  }

  useEffect(() => {
    listRef.current?.querySelector(`[data-idx="${selectedIdx}"]`)?.scrollIntoView({ block: "nearest" });
  }, [selectedIdx]);

  if (!open) return null;

  const sections: { label: string; items: (Command & { globalIdx: number })[] }[] = [];
  filtered.forEach((cmd, i) => {
    const last = sections[sections.length - 1];
    if (last?.label === cmd.section) last.items.push({ ...cmd, globalIdx: i });
    else sections.push({ label: cmd.section, items: [{ ...cmd, globalIdx: i }] });
  });

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[3px] animate-fade-in"
        onClick={() => setOpen(false)}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-[18%] z-[61] w-full max-w-[520px] -translate-x-1/2 animate-scale-in">
        <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-[0_24px_64px_rgba(0,0,0,0.18),0_0_0_1px_rgba(0,0,0,0.04)]">
          
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Buscar páginas, acciones..."
              className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none font-medium"
            />
            <kbd className="hidden sm:inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-[320px] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600">Sin resultados</p>
                <p className="text-xs text-slate-400 mt-1">Intenta con otro término</p>
              </div>
            ) : (
              sections.map(section => (
                <div key={section.label}>
                  <div className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {section.label}
                  </div>
                  {section.items.map(cmd => (
                    <button
                      key={cmd.id}
                      data-idx={cmd.globalIdx}
                      onClick={cmd.action}
                      onMouseEnter={() => setSelectedIdx(cmd.globalIdx)}
                      className={cn(
                        "flex w-full items-center gap-3 px-3 py-2.5 mx-1 rounded-lg text-left transition-colors",
                        cmd.globalIdx === selectedIdx
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-700 hover:bg-slate-50"
                      )}
                      style={{ width: "calc(100% - 8px)" }}
                    >
                      <span className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                        cmd.globalIdx === selectedIdx ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"
                      )}>
                        {cmd.icon}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-medium">{cmd.label}</span>
                        {cmd.description && (
                          <span className="block text-xs text-slate-400 truncate">{cmd.description}</span>
                        )}
                      </span>
                      {cmd.shortcut && (
                        <span className="flex items-center gap-0.5">
                          {cmd.shortcut.split(" ").map((k, i) => (
                            <kbd key={i} className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">{k}</kbd>
                          ))}
                        </span>
                      )}
                      {cmd.globalIdx === selectedIdx && !cmd.shortcut && (
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-blue-400" />
                      )}
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-4 border-t border-slate-100 px-4 py-2.5">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <kbd className="rounded border border-slate-200 bg-slate-50 px-1 py-0.5 text-[10px]">↑↓</kbd>
              <span>navegar</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <kbd className="rounded border border-slate-200 bg-slate-50 px-1 py-0.5 text-[10px]">↵</kbd>
              <span>abrir</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <kbd className="rounded border border-slate-200 bg-slate-50 px-1 py-0.5 text-[10px]">esc</kbd>
              <span>cerrar</span>
            </div>
            <div className="ml-auto flex items-center gap-1 text-[11px] text-slate-400">
              <kbd className="rounded border border-slate-200 bg-slate-50 px-1 py-0.5 text-[10px]">⌘K</kbd>
              <span>para abrir</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
