"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Phone, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { GHLContact } from "@/lib/ghl/types";

type SortKey = "name" | "email" | "dateAdded" | "lastActivity";
type SortDir = "asc" | "desc";

interface ContactsTableProps {
  contacts: GHLContact[];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-ES", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatRelativeDate(dateStr: string | undefined): string {
  if (!dateStr) return "—";
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Ahora";
  if (mins < 60) return `Hace ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Hace ${days}d`;
  if (days < 30) return `Hace ${Math.floor(days / 7)}sem`;
  return formatDate(dateStr);
}

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ArrowUpDown className="ml-1 inline h-3 w-3 text-text-secondary/50" />;
  return sortDir === "asc"
    ? <ArrowUp className="ml-1 inline h-3 w-3 text-coral" />
    : <ArrowDown className="ml-1 inline h-3 w-3 text-coral" />;
}

const TAG_COLORS: Record<string, string> = {
  vip: "bg-gold-light text-gold border-gold/20",
  nuevo: "bg-soft-blue-light text-soft-blue border-soft-blue/20",
  activo: "bg-sage-light text-sage border-sage/20",
  lead: "bg-coral-light text-coral border-coral/20",
};

function getTagStyle(tag: string): string {
  const lower = tag.toLowerCase();
  return TAG_COLORS[lower] ?? "bg-warm-muted text-text-secondary border-border";
}

export function ContactsTable({ contacts }: ContactsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("dateAdded");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sorted = [...contacts].sort((a, b) => {
    let aVal = "";
    let bVal = "";
    if (sortKey === "name") {
      aVal = `${a.firstName} ${a.lastName}`.toLowerCase();
      bVal = `${b.firstName} ${b.lastName}`.toLowerCase();
    } else if (sortKey === "email") {
      aVal = (a.email ?? "").toLowerCase();
      bVal = (b.email ?? "").toLowerCase();
    } else if (sortKey === "lastActivity") {
      aVal = a.lastActivity ?? "1970-01-01";
      bVal = b.lastActivity ?? "1970-01-01";
    } else {
      aVal = a.dateAdded;
      bVal = b.dateAdded;
    }
    const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return sortDir === "asc" ? cmp : -cmp;
  });

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-[#f9f8f6]">
          <TableHead>
            <button onClick={() => toggleSort("name")} className="flex items-center font-medium hover:text-coral transition-colors">
              Nombre <SortIcon col="name" sortKey={sortKey} sortDir={sortDir} />
            </button>
          </TableHead>
          <TableHead>
            <button onClick={() => toggleSort("email")} className="flex items-center font-medium hover:text-coral transition-colors">
              Email <SortIcon col="email" sortKey={sortKey} sortDir={sortDir} />
            </button>
          </TableHead>
          <TableHead>Telefono</TableHead>
          <TableHead>Origen</TableHead>
          <TableHead>Etiquetas</TableHead>
          <TableHead>
            <button onClick={() => toggleSort("lastActivity")} className="flex items-center font-medium hover:text-coral transition-colors">
              Actividad <SortIcon col="lastActivity" sortKey={sortKey} sortDir={sortDir} />
            </button>
          </TableHead>
          <TableHead>
            <button onClick={() => toggleSort("dateAdded")} className="flex items-center font-medium hover:text-coral transition-colors">
              Fecha <SortIcon col="dateAdded" sortKey={sortKey} sortDir={sortDir} />
            </button>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((contact) => (
          <TableRow
            key={contact.id}
            className="transition-colors hover:bg-warm-muted/50 cursor-pointer group"
          >
            <TableCell>
              <Link
                href={`/contacts/${contact.id}`}
                className="font-medium text-text-primary group-hover:text-coral transition-colors"
              >
                {contact.firstName} {contact.lastName}
              </Link>
            </TableCell>
            <TableCell>
              {contact.email ? (
                <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5 text-text-secondary hover:text-coral transition-colors">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate max-w-[180px]">{contact.email}</span>
                </a>
              ) : (
                <span className="text-text-secondary">—</span>
              )}
            </TableCell>
            <TableCell>
              {contact.phone ? (
                <a href={`tel:${contact.phone}`} className="flex items-center gap-1.5 text-text-secondary hover:text-coral transition-colors">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  {contact.phone}
                </a>
              ) : (
                <span className="text-text-secondary">—</span>
              )}
            </TableCell>
            <TableCell>
              {contact.source ? (
                <span className="rounded-[6px] bg-warm-muted px-2 py-0.5 text-[11px] font-medium text-text-secondary">
                  {contact.source}
                </span>
              ) : (
                <span className="text-text-secondary">—</span>
              )}
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {contact.tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className={`text-[10px] border ${getTagStyle(tag)}`}
                  >
                    {tag}
                  </Badge>
                ))}
                {contact.tags.length > 3 && (
                  <Badge variant="outline" className="text-[10px] border-border text-text-secondary">
                    +{contact.tags.length - 3}
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell>
              <span className="text-xs text-text-secondary">
                {formatRelativeDate(contact.lastActivity)}
              </span>
            </TableCell>
            <TableCell className="text-text-secondary text-xs">
              {formatDate(contact.dateAdded)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
