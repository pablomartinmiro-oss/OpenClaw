interface QuoteEmailParams {
  quoteNumber: string;
  clientName: string;
  destination: string;
  checkIn: string;
  checkOut: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    totalPrice: number;
  }>;
  totalAmount: number;
  paymentUrl?: string;
  expiresAt?: string;
  iban: string;
  pdfUrl?: string; // download link included in body (GHL API has no attachment support)
}

function formatEUR(amount: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function baseStyles(): string {
  return `
    body { margin: 0; padding: 0; background: #FAF9F7; font-family: 'DM Sans', Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; overflow: hidden; }
    .header { background: #2D2A26; color: #FFFFFF; padding: 32px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; letter-spacing: 2px; }
    .header p { margin: 8px 0 0; color: #E8E4DE; font-size: 14px; }
    .body { padding: 32px; color: #2D2A26; line-height: 1.6; }
    .body p { margin: 0 0 16px; }
    table.items { width: 100%; border-collapse: collapse; margin: 24px 0; }
    table.items th { background: #FAF9F7; text-align: left; padding: 10px 12px; font-size: 13px; color: #8A8580; border-bottom: 2px solid #E8E4DE; }
    table.items td { padding: 10px 12px; font-size: 14px; border-bottom: 1px solid #E8E4DE; }
    table.items tr.total td { font-weight: 700; font-size: 16px; border-top: 2px solid #2D2A26; border-bottom: none; }
    .btn { display: inline-block; background: #E87B5A; color: #FFFFFF; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 16px; }
    .btn:hover { background: #D56E4F; }
    .payment-box { background: #FAF9F7; border-radius: 10px; padding: 20px; margin: 24px 0; }
    .payment-box p { margin: 4px 0; font-size: 14px; }
    .footer { background: #FAF9F7; padding: 24px 32px; text-align: center; font-size: 12px; color: #8A8580; }
    .footer a { color: #E87B5A; text-decoration: none; }
  `;
}

function buildItemsTable(
  items: QuoteEmailParams["items"],
  totalAmount: number
): string {
  const rows = items
    .map(
      (item) => `
    <tr>
      <td>${item.name}</td>
      <td style="text-align:center">${item.quantity}</td>
      <td style="text-align:right">${formatEUR(item.unitPrice)}</td>
      <td style="text-align:center">${item.discount > 0 ? `${item.discount}%` : "—"}</td>
      <td style="text-align:right">${formatEUR(item.totalPrice)}</td>
    </tr>`
    )
    .join("");

  return `
    <table class="items">
      <thead>
        <tr>
          <th>Concepto</th>
          <th style="text-align:center">Cantidad</th>
          <th style="text-align:right">Precio/ud</th>
          <th style="text-align:center">Descuento</th>
          <th style="text-align:right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
        <tr class="total">
          <td colspan="4" style="text-align:right">TOTAL</td>
          <td style="text-align:right">${formatEUR(totalAmount)}</td>
        </tr>
      </tbody>
    </table>`;
}

export function buildQuoteEmailHTML(params: QuoteEmailParams): string {
  const itemsTable = buildItemsTable(params.items, params.totalAmount);

  const paymentSection = params.paymentUrl
    ? `
    <div style="text-align:center; margin: 24px 0;">
      <a href="${params.paymentUrl}" class="btn">Pagar ahora</a>
    </div>
    <div class="payment-box">
      <p><strong>O por transferencia bancaria:</strong></p>
      <p>IBAN: ${params.iban}</p>
      <p>Concepto: Presupuesto ${params.quoteNumber}</p>
    </div>`
    : `
    <div class="payment-box">
      <p><strong>Datos para transferencia bancaria:</strong></p>
      <p>IBAN: ${params.iban}</p>
      <p>Concepto: Presupuesto ${params.quoteNumber}</p>
    </div>`;

  const validityLine = params.expiresAt
    ? `<p style="color:#D4A853; font-size:13px;"><strong>Válido hasta ${params.expiresAt}.</strong> Pasada esta fecha, los precios podrían variar.</p>`
    : "";

  const pdfLine = params.pdfUrl
    ? `<p style="font-size:14px; margin-top:16px;">📄 <a href="${params.pdfUrl}" style="color:#E87B5A;">Descargar presupuesto en PDF</a></p>`
    : "";

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><style>${baseStyles()}</style></head>
<body>
<div class="container">
  <div class="header">
    <h1>SKICENTER</h1>
    <p>Presupuesto N.&ordm; ${params.quoteNumber}</p>
  </div>
  <div class="body">
    <p>Hola ${params.clientName},</p>
    <p>Aquí tienes tu presupuesto para <strong>${params.destination}</strong> (${params.checkIn} — ${params.checkOut}):</p>
    ${itemsTable}
    ${paymentSection}
    ${validityLine}
    ${pdfLine}
    <p style="font-size:14px;">¿Tienes alguna duda? Llámanos al <strong>639 576 627</strong> o escríbenos a <a href="mailto:reservas@skicenter.es" style="color:#E87B5A;">reservas@skicenter.es</a>.</p>
  </div>
  <div class="footer">
    <p>&copy; Skicenter — Agencia de viajes de esquí</p>
    <p><a href="https://crm-dash-prod.up.railway.app/terms">Condiciones generales de contratación</a></p>
  </div>
</div>
</body>
</html>`;
}

interface ConfirmationEmailParams {
  quoteNumber: string;
  clientName: string;
  destination: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  paymentRef?: string;
}

export function buildConfirmationEmailHTML(
  params: ConfirmationEmailParams
): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><style>${baseStyles()}</style></head>
<body>
<div class="container">
  <div class="header">
    <h1>SKICENTER</h1>
    <p>Confirmación de Pago</p>
  </div>
  <div class="body">
    <p>Hola ${params.clientName},</p>
    <p style="font-size:18px; color:#5B8C6D;"><strong>Tu pago ha sido confirmado.</strong></p>
    <div class="payment-box">
      <p><strong>Presupuesto:</strong> ${params.quoteNumber}</p>
      <p><strong>Destino:</strong> ${params.destination}</p>
      <p><strong>Fechas:</strong> ${params.checkIn} — ${params.checkOut}</p>
      <p><strong>Total pagado:</strong> ${formatEUR(params.totalAmount)}</p>
      ${params.paymentRef ? `<p><strong>Referencia:</strong> ${params.paymentRef}</p>` : ""}
    </div>
    <p>Próximamente recibirás la información detallada de tus servicios.</p>
    <p style="font-size:18px; text-align:center; margin:32px 0;">¡Nos vemos en la nieve! &#9924;</p>
    <p style="font-size:14px;">¿Tienes alguna duda? Llámanos al <strong>639 576 627</strong> o escríbenos a <a href="mailto:reservas@skicenter.es" style="color:#E87B5A;">reservas@skicenter.es</a>.</p>
  </div>
  <div class="footer">
    <p>&copy; Skicenter — Agencia de viajes de esquí</p>
  </div>
</div>
</body>
</html>`;
}

interface ReminderEmailParams {
  quoteNumber: string;
  clientName: string;
  destination: string;
  totalAmount: number;
  paymentUrl?: string;
  expiresAt: string;
  iban: string;
}

export function buildReminderEmailHTML(
  params: ReminderEmailParams
): string {
  const payBtn = params.paymentUrl
    ? `<div style="text-align:center; margin:24px 0;"><a href="${params.paymentUrl}" class="btn">Pagar ahora</a></div>`
    : "";

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><style>${baseStyles()}</style></head>
<body>
<div class="container">
  <div class="header">
    <h1>SKICENTER</h1>
    <p>Recordatorio de Presupuesto</p>
  </div>
  <div class="body">
    <p>Hola ${params.clientName},</p>
    <p>Te recordamos que tu presupuesto <strong>N.&ordm; ${params.quoteNumber}</strong> para <strong>${params.destination}</strong> por un total de <strong>${formatEUR(params.totalAmount)}</strong> <span style="color:#D4A853;">expira el ${params.expiresAt}</span>.</p>
    <p>Si deseas confirmar tu reserva, puedes realizar el pago antes de esa fecha:</p>
    ${payBtn}
    <div class="payment-box">
      <p><strong>Transferencia bancaria:</strong></p>
      <p>IBAN: ${params.iban}</p>
      <p>Concepto: Presupuesto ${params.quoteNumber}</p>
    </div>
    <p style="font-size:14px;">¿Necesitas más tiempo o tienes dudas? Llámanos al <strong>639 576 627</strong> o escríbenos a <a href="mailto:reservas@skicenter.es" style="color:#E87B5A;">reservas@skicenter.es</a>.</p>
  </div>
  <div class="footer">
    <p>&copy; Skicenter — Agencia de viajes de esquí</p>
  </div>
</div>
</body>
</html>`;
}
