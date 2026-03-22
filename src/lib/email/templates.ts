// ==================== TYPES ====================

interface QuoteEmailItem {
  name: string;
  category?: string | null;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
  // Per-product details (from QuoteItem fields)
  startDate?: string | null;
  numDays?: number | null;
  horario?: string | null;
  modalidad?: string | null;
  nivel?: string | null;
  sector?: string | null;
  idioma?: string | null;
  tipoCliente?: string | null;
  notes?: string | null;
}

interface QuoteEmailParams {
  quoteNumber: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  destination: string;
  checkIn: string;
  checkOut: string;
  items: QuoteEmailItem[];
  totalAmount: number;
  paymentUrl?: string;
  expiresAt?: string;
  iban: string;
  pdfUrl?: string;
}

interface ConfirmationEmailParams {
  quoteNumber: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  destination: string;
  checkIn: string;
  checkOut: string;
  items: QuoteEmailItem[];
  totalAmount: number;
  paymentRef?: string;
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

interface CancellationClientParams {
  quoteNumber: string;
  clientName: string;
  cancelType: string;
  bonoCode: string | null;
  bonoAmount: number | null;
  bonoExpiresAt: string | null;
}

interface CancellationAdminParams {
  quoteNumber: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  totalAmount: number;
  iban: string;
  titular: string;
  reason: string;
}

// ==================== HELPERS ====================

function formatEUR(amount: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function baseStyles(): string {
  return `
    body { margin: 0; padding: 0; background: #FAF9F7; font-family: 'DM Sans', Arial, sans-serif; }
    .container { max-width: 640px; margin: 0 auto; background: #FFFFFF; }
    .header { background: #1a4a4a; color: #FFFFFF; padding: 32px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; letter-spacing: 2px; font-weight: 700; }
    .header p { margin: 8px 0 0; color: #d4e8e8; font-size: 14px; }
    .body { padding: 32px; color: #2D2A26; line-height: 1.7; font-size: 15px; }
    .body p { margin: 0 0 14px; }
    .section-bar { background: #1a4a4a; color: #FFFFFF; padding: 12px 20px; font-weight: 600; font-size: 14px; margin: 24px 0 0; }
    .client-info { background: #f5f5f0; padding: 16px 20px; margin: 0 0 20px; font-size: 14px; line-height: 1.8; }
    table.items { width: 100%; border-collapse: collapse; margin: 0 0 24px; }
    table.items th { background: #f5f5f0; text-align: left; padding: 10px 12px; font-size: 12px; text-transform: uppercase; color: #666; border-bottom: 2px solid #ddd; }
    table.items td { padding: 10px 12px; font-size: 14px; border-bottom: 1px solid #eee; vertical-align: top; }
    table.items .product-name { font-weight: 600; }
    table.items .product-detail { font-size: 12px; color: #666; line-height: 1.5; margin-top: 4px; }
    table.items tr.total td { font-weight: 700; font-size: 16px; border-top: 2px solid #2D2A26; border-bottom: none; padding-top: 14px; }
    .btn { display: inline-block; background: #E87B5A; color: #FFFFFF; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 16px; }
    .payment-box { background: #f5f5f0; border-radius: 8px; padding: 20px; margin: 20px 0; font-size: 14px; }
    .payment-box p { margin: 4px 0; }
    .terms { font-size: 11px; color: #999; line-height: 1.6; margin-top: 32px; padding-top: 20px; border-top: 1px solid #eee; }
    .terms h4 { color: #666; font-size: 12px; margin: 0 0 8px; }
    .footer { background: #f5f5f0; padding: 20px 32px; text-align: center; font-size: 12px; color: #8A8580; }
    .footer a { color: #E87B5A; text-decoration: none; }
    .receptivo { background: #e8f4f0; padding: 12px 20px; border-radius: 8px; margin: 20px 0; font-size: 13px; text-align: center; }
  `;
}

/** Build per-product detail lines for the email table */
function buildProductDetails(item: QuoteEmailItem): string {
  const lines: string[] = [];
  if (item.startDate) {
    const dateStr = item.startDate;
    const timeStr = item.horario ? ` ${item.horario}` : "";
    lines.push(`Fecha: ${dateStr}${timeStr}`);
  }
  if (item.numDays) lines.push(`Días: ${item.numDays}`);
  if (item.modalidad) lines.push(`Modalidad: ${item.modalidad}`);
  if (item.nivel) lines.push(`Nivel: ${item.nivel}`);
  if (item.sector) lines.push(`Sector: ${item.sector}`);
  if (item.idioma) lines.push(`Idioma: ${item.idioma}`);
  if (item.tipoCliente) lines.push(`Cliente: ${item.tipoCliente}`);
  if (item.notes) lines.push(`${item.notes}`);
  if (lines.length === 0) return "";
  return `<div class="product-detail">${lines.join(" · ")}</div>`;
}

function buildItemsTableBDR(items: QuoteEmailItem[], totalAmount: number): string {
  const rows = items
    .map((item) => {
      const details = buildProductDetails(item);
      return `
    <tr>
      <td>
        <div class="product-name">${item.name}</div>
        ${details}
      </td>
      <td style="text-align:center">${item.quantity}</td>
      <td style="text-align:center">${item.discount > 0 ? `${item.discount}%` : "—"}</td>
      <td style="text-align:right">${formatEUR(item.totalPrice)}</td>
    </tr>`;
    })
    .join("");

  return `
    <table class="items">
      <thead>
        <tr>
          <th>Descripción</th>
          <th style="text-align:center">Cantidad</th>
          <th style="text-align:center">Descuento</th>
          <th style="text-align:right">Precio</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
        <tr class="total">
          <td colspan="3" style="text-align:right">Total</td>
          <td style="text-align:right">${formatEUR(totalAmount)}</td>
        </tr>
      </tbody>
    </table>`;
}

function cancellationTerms(): string {
  return `
    <div class="terms">
      <h4>CONDICIONES GENERALES DE CONTRATACIÓN</h4>
      <p><strong>Política de cancelación:</strong></p>
      <p>La cancelación del servicio con más de 15 días de antelación a la fecha de inicio generará un bono por el importe total, válido durante 1 año. Si el cliente rechaza el bono, se procederá a la devolución previa solicitud de IBAN.</p>
      <p>La cancelación con menos de 15 días de antelación supondrá el cargo del 100% del importe.</p>
      <p>No se admiten cancelaciones ni cambios de fecha durante los periodos de Navidades (22 dic – 6 ene) y febrero.</p>
      <p>Los productos adquiridos a través de Groupon no admiten cancelación ni cambio de fecha, salvo cierre de estación.</p>
      <p><strong>Seguro:</strong> SkiCenter recomienda la contratación de un seguro de esquí. El forfait NO incluye seguro de accidentes salvo que se contrate expresamente.</p>
      <p><strong>Material:</strong> El cliente es responsable del material alquilado. Cualquier daño o pérdida será facturado según tarifa del proveedor.</p>
      <p><strong>Clases:</strong> Las clases están sujetas a disponibilidad. SkiCenter se reserva el derecho de modificar horarios y monitores. El nivel indicado por el cliente es orientativo; el monitor podrá reasignar grupo.</p>
    </div>`;
}

function clientInfoBlock(name: string, phone?: string, email?: string): string {
  return `
    <div class="section-bar">Estos son los datos correspondientes a su reserva:</div>
    <div class="client-info">
      <strong>${name}</strong><br/>
      ${phone ? `${phone}<br/>` : ""}
      ${email ? `${email}` : ""}
    </div>`;
}

// ==================== PRESUPUESTO EMAIL ====================

export function buildQuoteEmailHTML(params: QuoteEmailParams): string {
  const itemsTable = buildItemsTableBDR(params.items, params.totalAmount);
  const firstName = params.clientName.split(" ")[0];

  const paymentSection = params.paymentUrl
    ? `
    <p>Para formalizar la reserva lo pueden hacer pinchando en el link o por transferencia bancaria
    <strong>${params.iban}</strong> y enviándonos el justificante a reservas@skicenter.es</p>
    <p>Presupuesto generado correctamente. Revisa la información y efectúa el pago en la siguiente URL:</p>
    <div style="text-align:center; margin: 20px 0;">
      <a href="${params.paymentUrl}" class="btn">Realizar pago</a>
    </div>`
    : `
    <div class="payment-box">
      <p><strong>Datos para transferencia bancaria:</strong></p>
      <p>IBAN: ${params.iban}</p>
      <p>Concepto: Presupuesto ${params.quoteNumber}</p>
      <p>Enviar justificante a reservas@skicenter.es</p>
    </div>`;

  const validityLine = params.expiresAt
    ? `<p>Este presupuesto tendrá validez hasta el <strong>${params.expiresAt}</strong>.</p>`
    : "";

  const pdfLine = params.pdfUrl
    ? `<p style="font-size:13px; margin-top:12px;"><a href="${params.pdfUrl}" style="color:#E87B5A;">Descargar presupuesto en PDF</a></p>`
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
    <p>Hola ${firstName},</p>
    <p>Encantados de saludarte.<br/>Te enviamos presupuesto para vuestra estancia.</p>

    ${paymentSection}
    ${validityLine}

    <p style="margin-top:24px;">A continuación le enviamos la información del presupuesto solicitado:</p>

    ${clientInfoBlock(params.clientName, params.clientPhone, params.clientEmail)}

    ${itemsTable}

    <div class="receptivo">
      ¿Estás de viaje y quieres contactar con nuestro servicio receptivo?
      Contáctanos en el teléfono <strong>639 576 627</strong>
    </div>

    ${pdfLine}

    ${cancellationTerms()}
  </div>
  <div class="footer">
    <p>&copy; SkiCenter — Agencia de viajes de esquí</p>
    <p><a href="mailto:reservas@skicenter.es">reservas@skicenter.es</a> · 639 576 627</p>
  </div>
</div>
</body>
</html>`;
}

// ==================== CONFIRMACIÓN EMAIL ====================

export function buildConfirmationEmailHTML(params: ConfirmationEmailParams): string {
  const itemsTable = buildItemsTableBDR(params.items, params.totalAmount);
  const firstName = params.clientName.split(" ")[0];

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><style>${baseStyles()}</style></head>
<body>
<div class="container">
  <div class="header">
    <h1>SKICENTER</h1>
    <p>Confirmación de Reserva</p>
  </div>
  <div class="body">
    <p>Hola ${firstName},</p>
    <p style="font-size:18px; color:#1a4a4a; font-weight:700;">
      SE HA COMPLETADO CON ÉXITO SU RESERVA NÚMERO ${params.quoteNumber}
    </p>

    <p>A continuación le enviamos la información del presupuesto solicitado:</p>

    ${clientInfoBlock(params.clientName, params.clientPhone, params.clientEmail)}

    ${itemsTable}

    <div class="receptivo">
      ¿Estás de viaje y quieres contactar con nuestro servicio receptivo?
      Contáctanos en el teléfono <strong>639 576 627</strong>
    </div>

    ${cancellationTerms()}
  </div>
  <div class="footer">
    <p>&copy; SkiCenter — Agencia de viajes de esquí</p>
    <p><a href="mailto:reservas@skicenter.es">reservas@skicenter.es</a> · 639 576 627</p>
  </div>
</div>
</body>
</html>`;
}

// ==================== REMINDER EMAIL ====================

export function buildReminderEmailHTML(params: ReminderEmailParams): string {
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
    <p>Hola ${params.clientName.split(" ")[0]},</p>
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
    <p>&copy; SkiCenter — Agencia de viajes de esquí</p>
  </div>
</div>
</body>
</html>`;
}

// ==================== CANCELLATION EMAILS ====================

export function buildCancellationClientEmailHTML(params: CancellationClientParams): string {
  let statusBlock = "";

  if (params.cancelType === "bono" && params.bonoCode) {
    statusBlock = `
      <div class="payment-box">
        <p><strong>Se ha generado un bono por el importe de su reserva:</strong></p>
        <p>Código: <strong style="font-size:18px; color:#1a4a4a;">${params.bonoCode}</strong></p>
        <p>Importe: <strong>${params.bonoAmount ? formatEUR(params.bonoAmount) : ""}</strong></p>
        <p>Válido hasta: <strong>${params.bonoExpiresAt}</strong></p>
        <p style="font-size:12px; color:#666;">Puede utilizar este bono para cualquier servicio de SkiCenter.</p>
      </div>`;
  } else if (params.cancelType === "devolucion") {
    statusBlock = `
      <div class="payment-box">
        <p>Hemos registrado su solicitud de devolución.</p>
        <p>El departamento de administración procesará la devolución en los próximos días laborables.</p>
      </div>`;
  } else if (params.cancelType === "sin_devolucion") {
    statusBlock = `
      <div class="payment-box">
        <p>Según la política de cancelación, no se admiten devoluciones con menos de 15 días de antelación a la fecha de inicio del servicio.</p>
      </div>`;
  }

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><style>${baseStyles()}</style></head>
<body>
<div class="container">
  <div class="header">
    <h1>SKICENTER</h1>
    <p>Cancelación de Reserva</p>
  </div>
  <div class="body">
    <p>Hola ${params.clientName.split(" ")[0]},</p>
    <p>Le confirmamos que su presupuesto <strong>N.&ordm; ${params.quoteNumber}</strong> ha sido cancelado.</p>
    ${statusBlock}
    <p style="font-size:14px;">Si tiene alguna consulta, contacte con nosotros en el <strong>639 576 627</strong> o en <a href="mailto:reservas@skicenter.es" style="color:#E87B5A;">reservas@skicenter.es</a>.</p>
  </div>
  <div class="footer">
    <p>&copy; SkiCenter — Agencia de viajes de esquí</p>
  </div>
</div>
</body>
</html>`;
}

export function buildCancellationAdminEmailHTML(params: CancellationAdminParams): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><style>${baseStyles()}</style></head>
<body>
<div class="container">
  <div class="header">
    <h1>SKICENTER</h1>
    <p>Solicitud de Devolución</p>
  </div>
  <div class="body">
    <p><strong>Se ha solicitado una devolución para el siguiente presupuesto:</strong></p>
    <div class="payment-box">
      <p><strong>Presupuesto:</strong> ${params.quoteNumber}</p>
      <p><strong>Cliente:</strong> ${params.clientName}</p>
      <p><strong>Email:</strong> ${params.clientEmail}</p>
      <p><strong>Teléfono:</strong> ${params.clientPhone}</p>
      <p><strong>Importe a devolver:</strong> ${formatEUR(params.totalAmount)}</p>
      <p><strong>Motivo:</strong> ${params.reason}</p>
    </div>
    <div class="payment-box" style="border-left: 4px solid #E87B5A;">
      <p><strong>Datos bancarios para la devolución:</strong></p>
      <p><strong>IBAN:</strong> ${params.iban}</p>
      <p><strong>Titular:</strong> ${params.titular}</p>
    </div>
  </div>
</div>
</body>
</html>`;
}
