import { emailBase, section, divider, ctaButton, infoTable, h1, p, highlight, formatEUR } from "./_base";

export interface QuoteReminderData {
  quoteNumber: string;
  clientName: string;
  destination: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  expiresAt: string;
  paymentUrl: string;
}

export function buildQuoteReminderHTML(data: QuoteReminderData): string {
  const firstName = data.clientName.split(" ")[0];

  const body = `
${section(`
  ${h1("Tu presupuesto expira pronto")}
  ${p(`Hola <strong>${firstName}</strong>,`)}
  ${p("Queremos recordarte que tu presupuesto de viaje está a punto de expirar. No pierdas tu plaza — confirma ahora para asegurar disponibilidad en las fechas que elegiste.")}
  ${highlight(`⏰ <strong>Tu presupuesto #${data.quoteNumber} expira el ${data.expiresAt}</strong>`)}
  ${infoTable([
    { label: "Presupuesto", value: `#${data.quoteNumber}` },
    { label: "Destino", value: data.destination },
    { label: "Llegada", value: data.checkIn },
    { label: "Salida", value: data.checkOut },
    { label: "Total", value: formatEUR(data.totalAmount) },
    { label: "Expira el", value: data.expiresAt },
  ])}
  ${ctaButton("CONFIRMAR MI PRESUPUESTO", data.paymentUrl)}
`)}

${divider()}

${section(`
  ${p("Si tienes alguna duda o quieres modificar algo, escríbenos antes de que expire:")}
  ${p(`📧 <a href="mailto:reservas@skicenter.es" style="color:#42A5F5;">reservas@skicenter.es</a><br>📞 639 576 627`)}
  ${p('<span style="color:#9CA3AF;font-size:12px;">Si ya no estás interesado, puedes ignorar este email.</span>')}
`)}`;

  return emailBase(body);
}
