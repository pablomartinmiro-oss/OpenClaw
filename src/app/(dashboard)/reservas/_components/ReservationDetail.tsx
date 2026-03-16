"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, ArrowLeft, Copy, Edit3, Save, X, Users, CreditCard, FileText, Clock } from "lucide-react";
import { toast } from "sonner";
import { useUpdateReservation, type Reservation } from "@/hooks/useReservations";
import { STATUS_CONFIG, SOURCE_CONFIG, formatDate, formatEUR, getStationLabel } from "./constants";
import type { Participant } from "@/hooks/useReservations";

interface ReservationDetailProps {
  reservation: Reservation;
  onBack: () => void;
}

export function ReservationDetail({ reservation, onBack }: ReservationDetailProps) {
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState(reservation.notes ?? "");
  const [internalNotes, setInternalNotes] = useState(reservation.internalNotes ?? "");
  const updateReservation = useUpdateReservation();

  const statusCfg = STATUS_CONFIG[reservation.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pendiente;
  const sourceCfg = SOURCE_CONFIG[reservation.source as keyof typeof SOURCE_CONFIG];

  const handleStatusChange = useCallback(
    (newStatus: string) => {
      updateReservation.mutate(
        { id: reservation.id, status: newStatus },
        {
          onSuccess: () => toast.success(`Estado actualizado a "${STATUS_CONFIG[newStatus as keyof typeof STATUS_CONFIG]?.label ?? newStatus}"`),
          onError: () => toast.error("Error al actualizar el estado"),
        }
      );
    },
    [reservation.id, updateReservation]
  );

  const handleSaveNotes = useCallback(() => {
    updateReservation.mutate(
      { id: reservation.id, notes, internalNotes },
      {
        onSuccess: () => { toast.success("Notas guardadas"); setEditingNotes(false); },
        onError: () => toast.error("Error al guardar notas"),
      }
    );
  }, [reservation.id, notes, internalNotes, updateReservation]);

  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado`);
  }, []);

  const finalPrice = reservation.discount > 0
    ? reservation.totalPrice * (1 - reservation.discount / 100)
    : reservation.totalPrice;

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-5 py-3">
        <button onClick={onBack} className="rounded-lg p-1.5 text-text-secondary hover:bg-warm-muted">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {sourceCfg && <span className="text-base">{sourceCfg.icon}</span>}
            <h2 className="text-base font-semibold text-text-primary">{reservation.clientName}</h2>
          </div>
          <p className="text-xs text-text-secondary">Creada {formatDate(reservation.createdAt)}</p>
        </div>
        <Badge className={cn("text-xs", statusCfg.color)}>{statusCfg.label}</Badge>
      </div>

      <div className="flex-1 space-y-5 p-5">
        {/* Status actions */}
        <div className="flex flex-wrap gap-2">
          {reservation.status !== "confirmada" && (
            <Button size="sm" className="gap-1.5 bg-sage text-white hover:bg-sage/90" onClick={() => handleStatusChange("confirmada")} disabled={updateReservation.isPending}>
              <CheckCircle className="h-3.5 w-3.5" /> Confirmar
            </Button>
          )}
          {reservation.status !== "sin_disponibilidad" && (
            <Button size="sm" variant="destructive" className="gap-1.5" onClick={() => handleStatusChange("sin_disponibilidad")} disabled={updateReservation.isPending}>
              <XCircle className="h-3.5 w-3.5" /> Sin disponibilidad
            </Button>
          )}
          {reservation.status !== "cancelada" && (
            <Button size="sm" variant="outline" className="gap-1.5 text-text-secondary" onClick={() => handleStatusChange("cancelada")} disabled={updateReservation.isPending}>
              <X className="h-3.5 w-3.5" /> Cancelar
            </Button>
          )}
          {reservation.status !== "pendiente" && (
            <Button size="sm" variant="outline" className="gap-1.5 text-gold" onClick={() => handleStatusChange("pendiente")} disabled={updateReservation.isPending}>
              <Clock className="h-3.5 w-3.5" /> Pendiente
            </Button>
          )}
        </div>

        {/* Client info */}
        <Section icon={<Users className="h-4 w-4" />} title="Cliente">
          <InfoRow label="Nombre" value={reservation.clientName} onCopy={() => copyToClipboard(reservation.clientName, "Nombre")} />
          <InfoRow label="Teléfono" value={reservation.clientPhone} onCopy={() => copyToClipboard(reservation.clientPhone, "Teléfono")} />
          <InfoRow label="Email" value={reservation.clientEmail} onCopy={() => copyToClipboard(reservation.clientEmail, "Email")} />
          {reservation.couponCode && <InfoRow label="Cupón" value={reservation.couponCode} onCopy={() => copyToClipboard(reservation.couponCode!, "Cupón")} />}
        </Section>

        {/* Reservation details */}
        <Section icon={<FileText className="h-4 w-4" />} title="Detalles">
          <InfoRow label="Estación" value={getStationLabel(reservation.station)} />
          <InfoRow label="Fecha" value={formatDate(reservation.activityDate)} />
          <InfoRow label="Horario" value={reservation.schedule} />
          <InfoRow label="Idioma" value={reservation.language === "es" ? "Español" : reservation.language === "en" ? "Inglés" : reservation.language} />
          <InfoRow label="Origen" value={sourceCfg?.label ?? reservation.source} />
        </Section>

        {/* Participants */}
        {reservation.participants && reservation.participants.length > 0 && (
          <Section icon={<Users className="h-4 w-4" />} title={`Participantes (${reservation.participants.length})`}>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-text-secondary">Nombre</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-text-secondary">Tipo</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-text-secondary">Servicio</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-text-secondary">Nivel</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-text-secondary">Material</th>
                  </tr>
                </thead>
                <tbody>
                  {(reservation.participants as Participant[]).map((p, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="px-3 py-2 text-text-primary">{p.name || "—"}</td>
                      <td className="px-3 py-2 capitalize text-text-secondary">{p.type}</td>
                      <td className="px-3 py-2 text-text-secondary">{p.service}</td>
                      <td className="px-3 py-2 text-text-secondary">{p.level}</td>
                      <td className="px-3 py-2 text-text-secondary">{p.material ? "Sí" : "No"}</td>
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
        {reservation.source === "groupon" && (
          <Section icon={<FileText className="h-4 w-4" />} title="Voucher Groupon">
            {reservation.couponCode && <InfoRow label="Código cupón" value={reservation.couponCode} onCopy={() => copyToClipboard(reservation.couponCode!, "Código")} />}
          </Section>
        )}

        {/* Notes */}
        <Section
          icon={<Edit3 className="h-4 w-4" />}
          title="Notas"
          action={
            editingNotes
              ? <div className="flex gap-1">
                  <Button size="sm" variant="outline" className="h-6 gap-1 px-2 text-xs" onClick={() => setEditingNotes(false)}><X className="h-3 w-3" /> Cancelar</Button>
                  <Button size="sm" className="h-6 gap-1 bg-sage px-2 text-xs text-white hover:bg-sage/90" onClick={handleSaveNotes} disabled={updateReservation.isPending}><Save className="h-3 w-3" /> Guardar</Button>
                </div>
              : <Button size="sm" variant="outline" className="h-6 gap-1 px-2 text-xs" onClick={() => setEditingNotes(true)}><Edit3 className="h-3 w-3" /> Editar</Button>
          }
        >
          {editingNotes ? (
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-text-secondary">Notas para el cliente</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full resize-none rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coral" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-text-secondary">Notas internas</label>
                <textarea value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} rows={3} className="w-full resize-none rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coral" />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {reservation.notes ? <p className="text-sm text-text-primary">{reservation.notes}</p> : <p className="text-sm italic text-text-secondary">Sin notas para el cliente</p>}
              {reservation.internalNotes && (
                <div className="rounded-lg bg-warm-muted p-2">
                  <span className="text-[10px] font-semibold uppercase text-text-secondary">Internas</span>
                  <p className="text-sm text-text-primary">{reservation.internalNotes}</p>
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
          <div className="rounded-lg border border-coral/30 bg-coral-light p-3">
            <span className="text-xs font-medium text-coral">Vinculada a presupuesto #{reservation.quote.id.slice(-4).toUpperCase()}</span>
            <p className="text-sm text-text-primary">{reservation.quote.clientName}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Helpers ── */

function Section({ icon, title, action, children }: { icon: React.ReactNode; title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-2">
      <div className="flex items-center justify-between">
        <legend className="flex items-center gap-1.5 text-sm font-semibold text-text-primary">
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
      <span className="text-xs text-text-secondary">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className={cn("text-sm", highlight ? "font-semibold text-coral" : "text-text-primary")}>{value}</span>
        {onCopy && (
          <button onClick={onCopy} className="rounded p-0.5 text-text-secondary hover:text-coral">
            <Copy className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}
