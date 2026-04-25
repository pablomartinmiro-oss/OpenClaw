"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Trash2, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Client } from "@/hooks/useClients";
import { ProfileTab } from "./ProfileTab";
import { HistoryTab } from "./HistoryTab";
import { SizesTab } from "./SizesTab";
import { NotesTab } from "./NotesTab";
import { skiLevelMeta, stationLabel } from "./constants";

const EUR = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

interface Props {
  client: Client | null;
  onClose: () => void;
  onDelete: (c: Client) => void;
}

export function ClientDrawer({ client, onClose, onDelete }: Props) {
  return (
    <Sheet open={!!client} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto"
      >
        {client && (
          <>
            <SheetHeader className="border-b border-[#E8E4DE] pr-10">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <SheetTitle className="text-lg font-semibold text-[#2D2A26]">
                    {client.name}
                  </SheetTitle>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[#8A8580]">
                    {client.email && (
                      <span className="inline-flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {client.email}
                      </span>
                    )}
                    {client.phone && (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {client.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <Stat label="Gasto total" value={EUR.format(client.totalSpent / 100)} />
                <Stat label="Visitas" value={String(client.visitCount)} />
                <Stat
                  label="Última visita"
                  value={
                    client.lastVisit
                      ? new Date(client.lastVisit).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "short",
                        })
                      : "—"
                  }
                />
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                {client.skiLevel && (
                  <Pill color={skiLevelMeta(client.skiLevel)?.color ?? "#8A8580"}>
                    {skiLevelMeta(client.skiLevel)?.label ?? client.skiLevel}
                  </Pill>
                )}
                {client.preferredStation && (
                  <Pill color="#7C9CB8">{stationLabel(client.preferredStation)}</Pill>
                )}
                {client.conversionSource && (
                  <Pill color="#E87B5A">{client.conversionSource}</Pill>
                )}
              </div>
            </SheetHeader>

            <div className="px-4 pb-4">
              <Tabs defaultValue="perfil" className="mt-3">
                <TabsList className="w-full">
                  <TabsTrigger value="perfil">Perfil</TabsTrigger>
                  <TabsTrigger value="historial">Historial</TabsTrigger>
                  <TabsTrigger value="tallas">Tallas</TabsTrigger>
                  <TabsTrigger value="notas">Notas</TabsTrigger>
                </TabsList>
                <TabsContent value="perfil" className="pt-4">
                  <ProfileTab client={client} />
                </TabsContent>
                <TabsContent value="historial" className="pt-4">
                  <HistoryTab client={client} />
                </TabsContent>
                <TabsContent value="tallas" className="pt-4">
                  <SizesTab client={client} />
                </TabsContent>
                <TabsContent value="notas" className="pt-4">
                  <NotesTab client={client} />
                </TabsContent>
              </Tabs>

              <div className="mt-6 border-t border-[#E8E4DE] pt-3">
                <Button
                  variant="outline"
                  onClick={() => onDelete(client)}
                  className="text-[#C75D4A] border-[#C75D4A]/30 hover:bg-[#C75D4A]/10 hover:text-[#C75D4A]"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Eliminar cliente
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] border border-[#E8E4DE] bg-[#FAF9F7] px-3 py-2">
      <p className="text-[10px] font-medium uppercase tracking-wide text-[#8A8580]">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-[#2D2A26]">{value}</p>
    </div>
  );
}

function Pill({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span
      className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium"
      style={{ backgroundColor: `${color}1A`, color }}
    >
      {children}
    </span>
  );
}
