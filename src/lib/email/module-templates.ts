// ==================== TYPES ====================

interface TenantInfo { name: string; email?: string; phone?: string }

interface HotelBookingData {
  tenant: TenantInfo; guestName: string; roomType: string;
  checkIn: string; checkOut: string; nights: number;
  guests: number; total: number; confirmationCode?: string;
}

interface SpaAppointmentData {
  tenant: TenantInfo; clientName: string; treatment: string;
  date: string; time: string; duration: string;
  therapist?: string; price: number;
}

interface RestaurantBookingData {
  tenant: TenantInfo; clientName: string; restaurant: string;
  date: string; time: string; guests: number; notes?: string;
}

interface InvoiceEmailData {
  tenant: TenantInfo; clientName: string; invoiceNumber: string;
  total: number; issuedAt: string; paymentUrl?: string;
}

interface SettlementNotificationData {
  tenant: TenantInfo; supplierName: string; settlementNumber: string;
  period: string; grossAmount: number;
  commissionAmount: number; netAmount: number;
}

interface StorefrontOrderData {
  tenant: TenantInfo; clientName: string; orderNumber: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number; date: string;
}

// ==================== HELPERS ====================

function formatEUR(amount: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function baseTemplate(
  tenant: TenantInfo,
  subtitle: string,
  bodyContent: string
): string {
  const contactEmail = tenant.email ?? "info@empresa.com";
  const contactPhone = tenant.phone ?? "";
  const phoneLine = contactPhone
    ? ` &middot; ${contactPhone}`
    : "";

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { margin:0; padding:0; background:#FAF9F7; font-family:'DM Sans',Arial,sans-serif; }
  .container { max-width:640px; margin:0 auto; background:#FFFFFF; }
  .header { background:#1a4a4a; color:#FFFFFF; padding:32px; text-align:center; }
  .header h1 { margin:0; font-size:28px; letter-spacing:2px; font-weight:700; }
  .header p { margin:8px 0 0; color:#d4e8e8; font-size:14px; }
  .body { padding:32px; color:#2D2A26; line-height:1.7; font-size:15px; }
  .body p { margin:0 0 14px; }
  .detail-box { background:#f5f5f0; border-radius:8px; padding:20px; margin:20px 0; font-size:14px; line-height:1.8; }
  .detail-box p { margin:4px 0; }
  .detail-label { color:#666; font-size:12px; text-transform:uppercase; }
  .detail-value { font-weight:600; color:#2D2A26; }
  .btn { display:inline-block; background:#E87B5A; color:#FFFFFF; padding:14px 32px; border-radius:10px; text-decoration:none; font-weight:600; font-size:16px; }
  table.items { width:100%; border-collapse:collapse; margin:0 0 20px; }
  table.items th { background:#f5f5f0; text-align:left; padding:10px 12px; font-size:12px; text-transform:uppercase; color:#666; border-bottom:2px solid #ddd; }
  table.items td { padding:10px 12px; font-size:14px; border-bottom:1px solid #eee; }
  table.items tr.total td { font-weight:700; font-size:16px; border-top:2px solid #2D2A26; border-bottom:none; padding-top:14px; }
  .footer { background:#f5f5f0; padding:20px 32px; text-align:center; font-size:12px; color:#8A8580; }
  .footer a { color:#E87B5A; text-decoration:none; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>${tenant.name.toUpperCase()}</h1>
    <p>${subtitle}</p>
  </div>
  <div class="body">
    ${bodyContent}
  </div>
  <div class="footer">
    <p>&copy; ${tenant.name}</p>
    <p><a href="mailto:${contactEmail}">${contactEmail}</a>${phoneLine}</p>
  </div>
</div>
</body>
</html>`;
}

function detailRow(label: string, value: string): string {
  return `<p><span class="detail-label">${label}:</span> <span class="detail-value">${value}</span></p>`;
}

// ==================== HOTEL ====================

export function buildHotelBookingConfirmationHTML(
  data: HotelBookingData
): string {
  const firstName = data.guestName.split(" ")[0];
  const codeBlock = data.confirmationCode
    ? `<p style="font-size:18px;color:#1a4a4a;font-weight:700;text-align:center;margin:20px 0;">Codigo de reserva: ${data.confirmationCode}</p>`
    : "";

  const body = `
    <p>Hola ${firstName},</p>
    <p>Su reserva de hotel ha sido confirmada. A continuacion los detalles:</p>
    ${codeBlock}
    <div class="detail-box">
      ${detailRow("Tipo de habitacion", data.roomType)}
      ${detailRow("Entrada", data.checkIn)}
      ${detailRow("Salida", data.checkOut)}
      ${detailRow("Noches", String(data.nights))}
      ${detailRow("Huespedes", String(data.guests))}
      ${detailRow("Total", formatEUR(data.total))}
    </div>
    <p>Si tiene alguna pregunta, no dude en contactarnos.</p>`;

  return baseTemplate(data.tenant, "Confirmacion de Reserva de Hotel", body);
}

// ==================== SPA ====================

export function buildSpaAppointmentConfirmationHTML(
  data: SpaAppointmentData
): string {
  const firstName = data.clientName.split(" ")[0];
  const therapistLine = data.therapist
    ? detailRow("Terapeuta", data.therapist)
    : "";

  const body = `
    <p>Hola ${firstName},</p>
    <p>Su cita en el spa ha sido confirmada.</p>
    <div class="detail-box">
      ${detailRow("Tratamiento", data.treatment)}
      ${detailRow("Fecha", data.date)}
      ${detailRow("Hora", data.time)}
      ${detailRow("Duracion", data.duration)}
      ${therapistLine}
      ${detailRow("Precio", formatEUR(data.price))}
    </div>
    <p>Le recomendamos llegar 15 minutos antes de su cita.</p>`;

  return baseTemplate(data.tenant, "Confirmacion de Cita — Spa", body);
}

// ==================== RESTAURANT ====================

export function buildRestaurantBookingConfirmationHTML(
  data: RestaurantBookingData
): string {
  const firstName = data.clientName.split(" ")[0];
  const notesLine = data.notes
    ? detailRow("Notas", data.notes)
    : "";

  const body = `
    <p>Hola ${firstName},</p>
    <p>Su reserva de restaurante ha sido confirmada.</p>
    <div class="detail-box">
      ${detailRow("Restaurante", data.restaurant)}
      ${detailRow("Fecha", data.date)}
      ${detailRow("Hora", data.time)}
      ${detailRow("Comensales", String(data.guests))}
      ${notesLine}
    </div>
    <p>En caso de cancelacion o cambio, por favor contactenos con antelacion.</p>`;

  return baseTemplate(data.tenant, "Confirmacion de Reserva — Restaurante", body);
}

// ==================== INVOICE ====================

export function buildInvoiceEmailHTML(data: InvoiceEmailData): string {
  const firstName = data.clientName.split(" ")[0];
  const paymentButton = data.paymentUrl
    ? `<div style="text-align:center;margin:24px 0;"><a href="${data.paymentUrl}" class="btn">Pagar factura</a></div>`
    : "";

  const body = `
    <p>Hola ${firstName},</p>
    <p>Le enviamos la factura correspondiente a los servicios prestados.</p>
    <div class="detail-box">
      ${detailRow("Factura N.o", data.invoiceNumber)}
      ${detailRow("Fecha de emision", data.issuedAt)}
      ${detailRow("Total", formatEUR(data.total))}
    </div>
    ${paymentButton}
    <p>Si tiene alguna consulta sobre esta factura, no dude en contactarnos.</p>`;

  return baseTemplate(data.tenant, `Factura ${data.invoiceNumber}`, body);
}

// ==================== SETTLEMENT ====================

export function buildSettlementNotificationHTML(
  data: SettlementNotificationData
): string {
  const body = `
    <p>Estimado/a ${data.supplierName},</p>
    <p>Le informamos que se ha generado una nueva liquidacion.</p>
    <div class="detail-box">
      ${detailRow("Liquidacion N.o", data.settlementNumber)}
      ${detailRow("Periodo", data.period)}
      ${detailRow("Importe bruto", formatEUR(data.grossAmount))}
      ${detailRow("Comision", formatEUR(data.commissionAmount))}
      ${detailRow("Importe neto", formatEUR(data.netAmount))}
    </div>
    <p>La liquidacion sera abonada segun las condiciones acordadas.</p>`;

  return baseTemplate(
    data.tenant,
    `Liquidacion ${data.settlementNumber}`,
    body
  );
}

// ==================== STOREFRONT ====================

export function buildStorefrontOrderConfirmationHTML(
  data: StorefrontOrderData
): string {
  const firstName = data.clientName.split(" ")[0];

  const rows = data.items
    .map(
      (item) => `
    <tr>
      <td>${item.name}</td>
      <td style="text-align:center">${item.quantity}</td>
      <td style="text-align:right">${formatEUR(item.price)}</td>
    </tr>`
    )
    .join("");

  const itemsTable = `
    <table class="items">
      <thead>
        <tr>
          <th>Producto</th>
          <th style="text-align:center">Cantidad</th>
          <th style="text-align:right">Precio</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
        <tr class="total">
          <td colspan="2" style="text-align:right">Total</td>
          <td style="text-align:right">${formatEUR(data.total)}</td>
        </tr>
      </tbody>
    </table>`;

  const body = `
    <p>Hola ${firstName},</p>
    <p>Gracias por su compra. Aqui tiene el resumen de su pedido:</p>
    <div class="detail-box">
      ${detailRow("Pedido", data.orderNumber)}
      ${detailRow("Fecha", data.date)}
    </div>
    ${itemsTable}
    <p>Le enviaremos actualizaciones sobre el estado de su pedido.</p>`;

  return baseTemplate(
    data.tenant,
    `Pedido ${data.orderNumber}`,
    body
  );
}
