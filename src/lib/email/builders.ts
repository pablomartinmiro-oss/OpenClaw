/**
 * Email Template Builders — OpenClaw
 *
 * Generates HTML email bodies for transactional emails.
 * Design: warm/premium aesthetic matching OpenClaw UI.
 * Compatibility: Outlook, Gmail, Apple Mail, responsive.
 * Max width: 600px, table-based layout, inline CSS.
 *
 * Ported from Nayade, adapted to OpenClaw brand colors.
 */

// ─── Brand constants ─────────────────────────────────────────────────────────
const BRAND = {
  coral: "#E87B5A",
  coralDark: "#D56E4F",
  sage: "#5B8C6D",
  gold: "#D4A853",
  danger: "#C75D4A",
  bg: "#FAF9F7",
  white: "#FFFFFF",
  text: "#2D2A26",
  textSecondary: "#8A8580",
  border: "#E8E4DE",
};

// ─── Shared layout components ────────────────────────────────────────────────

function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>OpenClaw</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.bg};font-family:'DM Sans',Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.bg};">
<tr><td align="center" style="padding:24px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
${content}
</table>
</td></tr>
</table>
</body>
</html>`;
}

function headerBlock(title: string, subtitle?: string): string {
  return `<tr><td style="background-color:${BRAND.coral};padding:32px 40px;border-radius:16px 16px 0 0;" align="center">
<h1 style="margin:0;color:${BRAND.white};font-size:22px;font-weight:700;letter-spacing:0.5px;">${title}</h1>
${subtitle ? `<p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">${subtitle}</p>` : ""}
</td></tr>`;
}

function bodyBlock(html: string): string {
  return `<tr><td style="background-color:${BRAND.white};padding:32px 40px;">
${html}
</td></tr>`;
}

function ctaButton(label: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px auto;">
<tr><td align="center" style="background-color:${BRAND.coral};border-radius:10px;">
<a href="${url}" style="display:inline-block;padding:14px 32px;color:${BRAND.white};text-decoration:none;font-size:14px;font-weight:600;letter-spacing:0.5px;">${label}</a>
</td></tr>
</table>`;
}

function statusBox(
  text: string,
  type: "success" | "warning" | "error"
): string {
  const colors = {
    success: { bg: "#e8f5ec", text: BRAND.sage, border: BRAND.sage },
    warning: { bg: "#fef8e8", text: BRAND.gold, border: BRAND.gold },
    error: { bg: "#fde8e5", text: BRAND.danger, border: BRAND.danger },
  };
  const c = colors[type];
  return `<div style="background-color:${c.bg};border-left:4px solid ${c.border};padding:14px 18px;border-radius:6px;margin:16px 0;">
<p style="margin:0;color:${c.text};font-size:14px;font-weight:600;">${text}</p>
</div>`;
}

function detailRow(label: string, value: string): string {
  return `<tr>
<td style="padding:8px 0;color:${BRAND.textSecondary};font-size:13px;border-bottom:1px solid ${BRAND.border};width:40%;">${label}</td>
<td style="padding:8px 0;color:${BRAND.text};font-size:13px;font-weight:500;border-bottom:1px solid ${BRAND.border};">${value}</td>
</tr>`;
}

function detailsTable(rows: Array<{ label: string; value: string }>): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0;">
${rows.map((r) => detailRow(r.label, r.value)).join("")}
</table>`;
}

function footerBlock(companyName?: string): string {
  const name = companyName ?? "OpenClaw";
  return `<tr><td style="background-color:${BRAND.bg};padding:24px 40px;border-radius:0 0 16px 16px;text-align:center;">
<p style="margin:0;color:${BRAND.textSecondary};font-size:12px;">${name}</p>
<p style="margin:4px 0 0;color:${BRAND.textSecondary};font-size:11px;">Este email fue generado automaticamente. No responda a este mensaje.</p>
</td></tr>`;
}

// ─── Template builders ───────────────────────────────────────────────────────

export interface ReservationConfirmVars {
  clientName: string;
  reservationNumber?: string;
  station: string;
  activityDate: string;
  schedule: string;
  services: string;
  totalPrice: string;
  paymentMethod?: string;
  companyName?: string;
}

export function buildReservationConfirm(vars: ReservationConfirmVars): string {
  return emailWrapper(
    headerBlock("Reserva Confirmada", vars.station) +
    bodyBlock(
      `<p style="margin:0 0 16px;color:${BRAND.text};font-size:15px;">Hola <strong>${vars.clientName}</strong>,</p>` +
      statusBox("Tu reserva ha sido confirmada correctamente", "success") +
      detailsTable([
        ...(vars.reservationNumber ? [{ label: "N. Reserva", value: vars.reservationNumber }] : []),
        { label: "Estacion", value: vars.station },
        { label: "Fecha", value: vars.activityDate },
        { label: "Horario", value: vars.schedule },
        { label: "Servicios", value: vars.services },
        { label: "Total", value: vars.totalPrice },
        ...(vars.paymentMethod ? [{ label: "Metodo de pago", value: vars.paymentMethod }] : []),
      ])
    ) +
    footerBlock(vars.companyName)
  );
}

export interface QuoteSendVars {
  clientName: string;
  quoteNumber?: string;
  destination: string;
  checkIn: string;
  checkOut: string;
  totalAmount: string;
  expiresAt?: string;
  paymentUrl?: string;
  companyName?: string;
}

export function buildQuoteSend(vars: QuoteSendVars): string {
  return emailWrapper(
    headerBlock("Tu Presupuesto", vars.destination) +
    bodyBlock(
      `<p style="margin:0 0 16px;color:${BRAND.text};font-size:15px;">Hola <strong>${vars.clientName}</strong>,</p>` +
      `<p style="margin:0 0 16px;color:${BRAND.textSecondary};font-size:14px;">Te enviamos el presupuesto detallado para tu experiencia.</p>` +
      detailsTable([
        ...(vars.quoteNumber ? [{ label: "N. Presupuesto", value: vars.quoteNumber }] : []),
        { label: "Destino", value: vars.destination },
        { label: "Entrada", value: vars.checkIn },
        { label: "Salida", value: vars.checkOut },
        { label: "Total", value: vars.totalAmount },
        ...(vars.expiresAt ? [{ label: "Valido hasta", value: vars.expiresAt }] : []),
      ]) +
      (vars.paymentUrl ? ctaButton("Pagar ahora", vars.paymentUrl) : "")
    ) +
    footerBlock(vars.companyName)
  );
}

export interface PaymentFailedVars {
  clientName: string;
  quoteNumber?: string;
  amount: string;
  retryUrl?: string;
  companyName?: string;
}

export function buildPaymentFailed(vars: PaymentFailedVars): string {
  return emailWrapper(
    headerBlock("Error en el Pago") +
    bodyBlock(
      `<p style="margin:0 0 16px;color:${BRAND.text};font-size:15px;">Hola <strong>${vars.clientName}</strong>,</p>` +
      statusBox("No hemos podido procesar tu pago", "error") +
      `<p style="margin:16px 0;color:${BRAND.textSecondary};font-size:14px;">El pago de <strong>${vars.amount}</strong>${vars.quoteNumber ? ` para el presupuesto ${vars.quoteNumber}` : ""} no se ha completado.</p>` +
      (vars.retryUrl ? ctaButton("Reintentar pago", vars.retryUrl) : "")
    ) +
    footerBlock(vars.companyName)
  );
}

export interface PaymentConfirmVars {
  clientName: string;
  quoteNumber?: string;
  amount: string;
  paymentRef?: string;
  companyName?: string;
}

export function buildPaymentConfirm(vars: PaymentConfirmVars): string {
  return emailWrapper(
    headerBlock("Pago Confirmado") +
    bodyBlock(
      `<p style="margin:0 0 16px;color:${BRAND.text};font-size:15px;">Hola <strong>${vars.clientName}</strong>,</p>` +
      statusBox("Hemos recibido tu pago correctamente", "success") +
      detailsTable([
        ...(vars.quoteNumber ? [{ label: "Presupuesto", value: vars.quoteNumber }] : []),
        { label: "Importe", value: vars.amount },
        ...(vars.paymentRef ? [{ label: "Referencia", value: vars.paymentRef }] : []),
      ])
    ) +
    footerBlock(vars.companyName)
  );
}

export interface InvoiceEmailVars {
  clientName: string;
  invoiceNumber: string;
  total: string;
  issuedAt: string;
  pdfUrl?: string;
  companyName?: string;
}

export function buildInvoiceEmail(vars: InvoiceEmailVars): string {
  return emailWrapper(
    headerBlock("Factura", vars.invoiceNumber) +
    bodyBlock(
      `<p style="margin:0 0 16px;color:${BRAND.text};font-size:15px;">Hola <strong>${vars.clientName}</strong>,</p>` +
      `<p style="margin:0 0 16px;color:${BRAND.textSecondary};font-size:14px;">Adjuntamos tu factura.</p>` +
      detailsTable([
        { label: "N. Factura", value: vars.invoiceNumber },
        { label: "Total", value: vars.total },
        { label: "Fecha emision", value: vars.issuedAt },
      ]) +
      (vars.pdfUrl ? ctaButton("Descargar PDF", vars.pdfUrl) : "")
    ) +
    footerBlock(vars.companyName)
  );
}

export interface CancellationClientVars {
  clientName: string;
  cancellationNumber?: string;
  reason?: string;
  resolution?: string;
  companyName?: string;
}

export function buildCancellationClient(vars: CancellationClientVars): string {
  return emailWrapper(
    headerBlock("Cancelacion Procesada") +
    bodyBlock(
      `<p style="margin:0 0 16px;color:${BRAND.text};font-size:15px;">Hola <strong>${vars.clientName}</strong>,</p>` +
      statusBox("Tu solicitud de cancelacion ha sido procesada", "warning") +
      detailsTable([
        ...(vars.cancellationNumber ? [{ label: "N. Cancelacion", value: vars.cancellationNumber }] : []),
        ...(vars.reason ? [{ label: "Motivo", value: vars.reason }] : []),
        ...(vars.resolution ? [{ label: "Resolucion", value: vars.resolution }] : []),
      ])
    ) +
    footerBlock(vars.companyName)
  );
}

export interface VoucherIssuedVars {
  clientName: string;
  voucherCode: string;
  amount: string;
  expiresAt: string;
  redeemUrl?: string;
  companyName?: string;
}

export function buildVoucherIssued(vars: VoucherIssuedVars): string {
  return emailWrapper(
    headerBlock("Bono de Compensacion") +
    bodyBlock(
      `<p style="margin:0 0 16px;color:${BRAND.text};font-size:15px;">Hola <strong>${vars.clientName}</strong>,</p>` +
      statusBox("Se ha emitido un bono de compensacion a tu nombre", "success") +
      detailsTable([
        { label: "Codigo", value: `<strong style="font-family:monospace;letter-spacing:1px;">${vars.voucherCode}</strong>` },
        { label: "Valor", value: vars.amount },
        { label: "Valido hasta", value: vars.expiresAt },
      ]) +
      (vars.redeemUrl ? ctaButton("Canjear bono", vars.redeemUrl) : "")
    ) +
    footerBlock(vars.companyName)
  );
}

export interface QuoteReminderVars {
  clientName: string;
  quoteNumber?: string;
  totalAmount: string;
  expiresAt?: string;
  paymentUrl?: string;
  step: string; // "reminder_1" | "reminder_2" | "discount" | "expiry_warning"
  discountPercent?: number;
  companyName?: string;
}

export function buildQuoteReminder(vars: QuoteReminderVars): string {
  const titles: Record<string, string> = {
    reminder_1: "Recordatorio de Presupuesto",
    reminder_2: "Tu presupuesto expira pronto",
    discount: "Oferta especial para ti",
    expiry_warning: "Ultimo aviso — presupuesto a punto de expirar",
  };
  const title = titles[vars.step] ?? "Recordatorio";

  return emailWrapper(
    headerBlock(title) +
    bodyBlock(
      `<p style="margin:0 0 16px;color:${BRAND.text};font-size:15px;">Hola <strong>${vars.clientName}</strong>,</p>` +
      statusBox(
        vars.step === "discount"
          ? `Tenemos un ${vars.discountPercent ?? 10}% de descuento para ti`
          : "Tienes un presupuesto pendiente de confirmacion",
        vars.step === "expiry_warning" ? "warning" : "success"
      ) +
      detailsTable([
        ...(vars.quoteNumber ? [{ label: "Presupuesto", value: vars.quoteNumber }] : []),
        { label: "Total", value: vars.totalAmount },
        ...(vars.expiresAt ? [{ label: "Valido hasta", value: vars.expiresAt }] : []),
      ]) +
      (vars.paymentUrl ? ctaButton("Ver presupuesto", vars.paymentUrl) : "")
    ) +
    footerBlock(vars.companyName)
  );
}

export interface TpvTicketVars {
  clientName: string;
  ticketNumber: string;
  date: string;
  items: Array<{ description: string; quantity: number; total: string }>;
  totalAmount: string;
  companyName?: string;
}

export function buildTpvTicket(vars: TpvTicketVars): string {
  const itemRows = vars.items
    .map(
      (item) =>
        `<tr>
      <td style="padding:6px 0;color:${BRAND.text};font-size:13px;border-bottom:1px solid ${BRAND.border};">${item.description}</td>
      <td style="padding:6px 0;color:${BRAND.textSecondary};font-size:13px;text-align:center;border-bottom:1px solid ${BRAND.border};">${item.quantity}</td>
      <td style="padding:6px 0;color:${BRAND.text};font-size:13px;text-align:right;font-weight:500;border-bottom:1px solid ${BRAND.border};">${item.total}</td>
    </tr>`
    )
    .join("");

  return emailWrapper(
    headerBlock("Ticket de Compra", vars.ticketNumber) +
    bodyBlock(
      `<p style="margin:0 0 16px;color:${BRAND.text};font-size:15px;">Hola <strong>${vars.clientName}</strong>,</p>` +
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0;">
      <tr>
        <th style="padding:8px 0;color:${BRAND.textSecondary};font-size:12px;text-align:left;border-bottom:2px solid ${BRAND.border};">Concepto</th>
        <th style="padding:8px 0;color:${BRAND.textSecondary};font-size:12px;text-align:center;border-bottom:2px solid ${BRAND.border};">Uds.</th>
        <th style="padding:8px 0;color:${BRAND.textSecondary};font-size:12px;text-align:right;border-bottom:2px solid ${BRAND.border};">Total</th>
      </tr>
      ${itemRows}
      <tr>
        <td colspan="2" style="padding:12px 0;color:${BRAND.text};font-size:15px;font-weight:700;">TOTAL</td>
        <td style="padding:12px 0;color:${BRAND.coral};font-size:15px;font-weight:700;text-align:right;">${vars.totalAmount}</td>
      </tr>
      </table>`
    ) +
    footerBlock(vars.companyName)
  );
}

// ─── Template key → builder mapping ──────────────────────────────────────────

export const TEMPLATE_KEYS = [
  "reservation_confirm",
  "quote_send",
  "payment_failed",
  "payment_confirm",
  "invoice_email",
  "cancellation_client",
  "voucher_issued",
  "quote_reminder",
  "tpv_ticket",
] as const;

export type TemplateKey = (typeof TEMPLATE_KEYS)[number];

export const TEMPLATE_METADATA: Record<
  TemplateKey,
  { name: string; category: string; recipient: string; description: string }
> = {
  reservation_confirm: {
    name: "Confirmacion de reserva",
    category: "reservations",
    recipient: "client",
    description: "Se envia al cliente cuando su reserva se confirma",
  },
  quote_send: {
    name: "Envio de presupuesto",
    category: "quotes",
    recipient: "client",
    description: "Se envia al cliente con el detalle del presupuesto",
  },
  payment_failed: {
    name: "Fallo de pago",
    category: "quotes",
    recipient: "client",
    description: "Se envia cuando un pago con Redsys falla",
  },
  payment_confirm: {
    name: "Confirmacion de pago",
    category: "quotes",
    recipient: "client",
    description: "Se envia cuando se confirma un pago exitoso",
  },
  invoice_email: {
    name: "Envio de factura",
    category: "finance",
    recipient: "client",
    description: "Se envia al cliente con la factura adjunta",
  },
  cancellation_client: {
    name: "Cancelacion - cliente",
    category: "cancellations",
    recipient: "client",
    description: "Notifica al cliente que su cancelacion fue procesada",
  },
  voucher_issued: {
    name: "Bono emitido",
    category: "cancellations",
    recipient: "client",
    description: "Se envia al cliente cuando se emite un bono de compensacion",
  },
  quote_reminder: {
    name: "Recordatorio de presupuesto",
    category: "quotes",
    recipient: "client",
    description: "Recordatorio automatico para presupuestos pendientes",
  },
  tpv_ticket: {
    name: "Ticket TPV",
    category: "tpv",
    recipient: "client",
    description: "Ticket digital de una venta en punto de venta",
  },
};
