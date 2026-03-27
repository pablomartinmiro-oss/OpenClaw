"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Copy, Edit3, Save, X, Users, CreditCard, FileText, Clock } from "lucide-react";
import type { Reservation, Participant } from "@/hooks/useReservations";
import { STATIONS, SOURCE_CONFIG, formatDate, formatEUR, getStationLabel, SCHEDULES } from "./constants";

interface DetailSectionsProps {
  reservation: Reservation;
  editingClient: boolean;
  setEditingClient: (v: boolean) => void;
  clientFields: { clientName: string; clientPhone: string; clientEmail: string };
  setClientFields: (v: { clientName: string; clientPhone: string; clientEmail: string }) => void;
  handleSaveClient: () => void;
  editingDetails: boolean;
  setEditingDetails: (v: boolean) => void;
  detailFields: { station: string; activityDate: string; schedule: string };
  setDetailFields: (v: { station: string; activityDate: string; schedule: string }) => void;
  handleSaveDetails: () => void;
  editingNotes: boolean;
  setEditingNotes: (v: boolean) => void;
  notes: string;
  setNotes: (v: string) => void;
  internalNotes: string;
  setInternalNotes: (v: string) => void;
  handleSaveNotes: () => void;
  copyToClipboard: (text: string, label: string) => void;
  finalPrice: number;
  isPending: boolean;
}

export function DetailSections(props: DetailSectionsProps) {
  const { reservation, copyToClipboard, finalPrice, isPending } = props;
  const sourceCfg = SOURCE_CONFIG[reservation.source as keyof typeof SOURCE_CONFIG];

  return (
    <>
      {/* Client info */}
      <Section
        icon={<Users className="h-4 w-4" />} title="Cliente"
        action={
          props.editingClient
            ? <EditActions onCancel={() => props.setEditingClient(false)} onSave={props.handleSaveClient} isPending={isPending} />
            : <EditButton onClick={() => props.setEditingClient(true)} />
        }
      >
        {props.editingClient ? (
          <div className="space-y-2">
            <EditField label="Nombre" value={props.clientFields.clientName} onChange={(v) => props.setClientFields({ ...props.clientFields, clientName: v })} />
            <EditField label="Teléfono" value={props.clientFields.clientPhone} onChange={(v) => props.setClientFields({ ...props.clientFields, clientPhone: v })} />
            <EditField label="Email" value={props.clientFields.clientEmail} onChange={(v) => props.setClientFields({ ...props.clientFields, clientEmail: v })} type="email" />
          </div>
        ) : (
          <>
            <InfoRow label="Nombre" value={reservation.clientName} onCopy={() => copyToClipboard(reservation.clientName, "Nombre")} />
            <InfoRow label="Teléfono" value={reservation.clientPhone} onCopy={() => copyToClipboard(reservation.clientPhone, "Teléfono")} />
            <InfoRow label="Email" value={reservation.clientEmail} onCopy={() => copyToClipboard(reservation.clientEmail, "Email")} />
            {reservation.couponCode && <InfoRow label="Cupón" value={reservation.couponCode} onCopy={() => copyToClipboard(reservation.couponCode!, "Cupón")} />}
          </>
        )}
      </Section>

      {/* Reservation details */}
      <Section
        icon={<FileText className="h-4 w-4" />} title="Detalles"
        action={
          props.editingDetails
            ? <EditActions onCancel={() => props.setEditingDetails(false)} onSave={props.handleSaveDetails} isPending={isPending} />
            : <EditButton onClick={() => props.setEditingDetails(true)} />
        }
      >
        {props.editingDetails ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between py-1">
              <span className="text-xs text-slate-500">Estación</span>
              <select value={props.detailFields.station} onChange={(e) => props.setDetailFields({ ...props.detailFields, station: e.target.value })} className="rounded-lg border border-border bg-white px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                {STATIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-xs text-slate-500">Fecha</span>
              <input type="date" value={props.detailFields.activityDate} onChange={(e) => props.setDetailFields({ ...props.detailFields, activityDate: e.target.value })} className="rounded-lg border border-border bg-white px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-xs text-slate-500">Horario</span>
              <select value={props.detailFields.schedule} onChange={(e) => props.setDetailFields({ ...props.detailFields, schedule: e.target.value })} className="rounded-lg border border-border bg-white px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                {SCHEDULES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
        ) : (
          <>
            <InfoRow label="Estación" value={getStationLabel(reservation.station)} />
            <InfoRow label="Fecha" value={formatDate(reservation.activityDate)} />
            <InfoRow label="Horario" value={reservation.schedule} />
            <InfoRow label="Idioma" value={reservation.language === "es" ? "Español" : reservation.language === "en" ? "Inglés" : reservation.language} />
            <InfoRow label="Origen" value={sourceCfg?.label ?? reservation.source} />
          </>
        )}
      </Section>

      {/* Participants */}
      {reservation.participants && reservation.participants.length > 0 && (
        <Section icon={<Users className="h-4 w-4" />} title={`Participantes (${reservation.participants.length})`}>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Nombre</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Tipo</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Servicio</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Nivel</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Material</th>
                </tr>
              </thead>
              <tbody>
                {(reservation.participants as Participant[]).map((p, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-3 py-2 text-slate-900">{p.name || "—"}</td>
                    <td className="px-3 py-2 capitalize text-slate-500">{p.type}</td>
                    <td className="px-3 py-2 text-slate-500">{p.service}</td>
                    <td className="px-3 py-2 text-slate-500">{p.level}</td>
                    <td className="px-3 py-2 text-slate-500">{p.material ? "Sí" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* Pricing */}
      <Section icon={<CreditCard className="h-4 w-4" />} title="Precio">
        <InfoRow label="Precio total" value={formatEUR(reservation.totalPrice)} />
        {reservation.discount > 0 && (
          <>
            <InfoRow label="Descuento" value={`${reservation.discount}%`} />
            <InfoRow label="Precio final" value={formatEUR(finalPrice)} highlight />
          </>
        )}
        {reservation.paymentMethod && <InfoRow label="Método de pago" value={reservation.paymentMethod} />}
        {reservation.paymentRef && <InfoRow label="Ref. pago" value={reservation.paymentRef} />}
      </Section>

      {/* Voucher info (Groupon) */}
      {reservation.source === "groupon" && reservation.couponCode && (
        <Section icon={<FileText className="h-4 w-4" />} title="Voucher Groupon">
          <InfoRow label="Código cupón" value={reservation.couponCode} onCopy={() => copyToClipboard(reservation.couponCode!, "Código")} />
        </Section>
      )}

      {/* Notes */}
      <Section
        icon={<Edit3 className="h-4 w-4" />} title="Notas"
        action={
          props.editingNotes
            ? <EditActions onCancel={() => props.setEditingNotes(false)} onSave={props.handleSaveNotes} isPending={isPending} />
            : <EditButton onClick={() => props.setEditingNotes(true)} />
        }
      >
        {props.editingNotes ? (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-slate-500">Notas para el cliente</label>
              <textarea value={props.notes} onChange={(e) => props.setNotes(e.target.value)} rows={3} className="w-full resize-none rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-500">Notas internas</label>
              <textarea value={props.internalNotes} onChange={(e) => props.setInternalNotes(e.target.value)} rows={3} className="w-full resize-none rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {reservation.notes ? <p className="text-sm text-slate-900">{reservation.notes}</p> : <p className="text-sm italic text-slate-500">Sin notas para el cliente</p>}
            {reservation.internalNotes && (
              <div className="rounded-lg bg-slate-100 p-2">
                <span className="text-[10px] font-semibold uppercase text-slate-500">Internas</span>
                <p className="text-sm text-slate-900">{reservation.internalNotes}</p>
              </div>
            )}
          </div>
        )}
      </Section>

      {/* Notification history */}
      {(reservation.emailSentAt || reservation.whatsappSentAt) && (
        <Section icon={<Clock className="h-4 w-4" />} title="Notificaciones">
          {reservation.emailSentAt && <InfoRow label="Email enviado" value={formatDate(reservation.emailSentAt)} />}
          {reservation.whatsappSentAt && <InfoRow label="WhatsApp enviado" value={formatDate(reservation.whatsappSentAt)} />}
        </Section>
      )}

      {/* Linked quote */}
      {reservation.quote && (
        <div className="rounded-lg border border-blue-500/30 bg-blue-50 p-3">
          <span className="text-xs font-medium text-coral">Vinculada a presupuesto #{reservation.quote.id.slice(-4).toUpperCase()}</span>
          <p className="text-sm text-slate-900">{reservation.quote.clientName}</p>
        </div>
      )}
    </>
  );
}

/* ── Helpers ── */

function Section({ icon, title, action, children }: { icon: React.ReactNode; title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-2">
      <div className="flex items-center justify-between">
        <legend className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
          {icon} {title}
        </legend>
        {action}
      </div>
      {children}
    </fieldset>
  );
}

function InfoRow({ label, value, onCopy, highlight }: { label: string; value: string; onCopy?: () => void; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-slate-500">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className={cn("text-sm", highlight ? "font-semibold text-coral" : "text-slate-900")}>{value}</span>
        {onCopy && (
          <button onClick={onCopy} className="rounded p-0.5 text-slate-500 hover:text-blue-600">
            <Copy className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}

function EditField({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-slate-500">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-48 rounded-lg border border-border bg-white px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
    </div>
  );
}

function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <Button size="sm" variant="outline" className="h-6 gap-1 px-2 text-xs" onClick={onClick}>
      <Edit3 className="h-3 w-3" /> Editar
    </Button>
  );
}

function EditActions({ onCancel, onSave, isPending }: { onCancel: () => void; onSave: () => void; isPending: boolean }) {
  return (
    <div className="flex gap-1">
      <Button size="sm" variant="outline" className="h-6 gap-1 px-2 text-xs" onClick={onCancel}><X className="h-3 w-3" /> Cancelar</Button>
      <Button size="sm" className="h-6 gap-1 bg-sage px-2 text-xs text-white hover:bg-sage/90" onClick={onSave} disabled={isPending}><Save className="h-3 w-3" /> Guardar</Button>
    </div>
  );
}
