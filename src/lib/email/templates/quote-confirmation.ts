import { emailBase, section, divider, ctaButton, infoTable, h1, h2, p, formatEUR } from "./_base";

export interface QuoteConfirmationData {
  quoteNumber: string;
  clientName: string;
  destination: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  items: Array<{ name: string; quantity: number; totalPrice: number }>;
  expiresAt?: string;
  storefrontUrl?: string;
}

export function buildQuoteConfirmationHTML(data: QuoteConfirmationData): string {
  const firstName = data.clientName.split(" ")[0];

  const itemRows = data.items
    .map(
      (item) => `<tr>
  <td style="padding:10px 14px;color:#111827;font-size:13px;">${item.name}</td>
  <td style="padding:10px 14px;color:#6B7280;font-size:13px;text-align:center;">${item.quantity}</td>
  <td style="padding:10px 14px;color:#111827;font-size:13px;text-align:right;font-weight:600;">${formatEUR(item.totalPrice)}</td>
</tr>`,
    )
    .join("");

  const body = `
${section(`
  ${h1("Tu presupuesto ha sido recibido")}
  ${p(`Hola <strong>${firstName}</strong>,`)}
  ${p("Hemos recibido tu solicitud de presupuesto. Nuestro equipo está revisando los detalles y te contactará en menos de 24 horas para confirmar disponibilidad y responder cualquier pregunta.")}
  ${infoTable([
    { label: "Presupuesto", value: `#${data.quoteNumber}` },
    { label: "Destino", value: data.destination },
    { label: "Llegada", value: data.checkIn },
    { label: "Salida", value: data.checkOut },
    ...(data.expiresAt ? [{ label: "Válido hasta", value: data.expiresAt }] : []),
  ])}
`)}

${divider()}

${section(`
  ${h2("Servicios solicitados")}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #E5E7EB;border-radius:6px;overflow:hidden;">
    <thead>
      <tr style="background-color:#F5F7F9;">
        <th style="padding:10px 14px;color:#6B7280;font-size:11px;text-align:left;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Servicio</th>
        <th style="padding:10px 14px;color:#6B7280;font-size:11px;text-align:center;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Uds.</th>
        <th style="padding:10px 14px;color:#6B7280;font-size:11px;text-align:right;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Total</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
    <tfoot>
      <tr style="background-color:#001D3D;">
        <td colspan="2" style="padding:12px 14px;color:#FFFFFF;font-size:14px;font-weight:700;">TOTAL ESTIMADO</td>
        <td style="padding:12px 14px;color:#42A5F5;font-size:16px;font-weight:700;text-align:right;">${formatEUR(data.totalAmount)}</td>
      </tr>
    </tfoot>
  </table>
  <p style="margin:10px 0 0;color:#9CA3AF;font-size:12px;">El precio final puede variar según disponibilidad. Te lo confirmaremos en breve.</p>
  ${data.storefrontUrl ? ctaButton("VER MI PRESUPUESTO", data.storefrontUrl) : ""}
`)}

${divider()}

${section(`
  ${h2("¿Necesitas ayuda?")}
  ${p("Puedes contactarnos en cualquier momento:")}
  ${p(`📧 <a href="mailto:reservas@skicenter.es" style="color:#42A5F5;">reservas@skicenter.es</a><br>📞 639 576 627<br>💬 <a href="https://wa.me/34919041947" style="color:#42A5F5;">WhatsApp</a>`)}
`)}`;

  return emailBase(body);
}
