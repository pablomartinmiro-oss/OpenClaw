import { emailBase, section, divider, ctaButton, infoTable, h1, h2, p, highlight } from "./_base";

export interface BookingConfirmationData {
  reservationId: string;
  clientName: string;
  station: string;
  activityDate: string;
  schedule: string;
  services: string[];
  totalPrice: number;
  meetingPoint?: string;
  notes?: string;
  dashboardUrl?: string;
}

export function buildBookingConfirmationHTML(data: BookingConfirmationData): string {
  const firstName = data.clientName.split(" ")[0];

  const serviceList = data.services.length
    ? data.services.map((s) => `<li style="padding:4px 0;color:#4B5563;font-size:13px;">✓ ${s}</li>`).join("")
    : "<li style=\"padding:4px 0;color:#9CA3AF;font-size:13px;\">Sin servicios específicos</li>";

  const body = `
${section(`
  ${h1("¡Tu reserva está confirmada!")}
  ${p(`Hola <strong>${firstName}</strong>,`)}
  ${p("¡Buenas noticias! Tu reserva con Skicenter ha sido confirmada. Aquí tienes todos los detalles de tu viaje:")}
  ${highlight("✅ <strong>Reserva confirmada</strong> — Prepárate para disfrutar de la montaña")}
  ${infoTable([
    { label: "Referencia", value: `#${data.reservationId.slice(-8).toUpperCase()}` },
    { label: "Estación", value: data.station },
    { label: "Fecha", value: data.activityDate },
    { label: "Horario", value: data.schedule },
  ])}
`)}

${divider()}

${section(`
  ${h2("Servicios incluidos")}
  <ul style="margin:0;padding:0 0 0 4px;list-style:none;">
    ${serviceList}
  </ul>
`)}

${data.meetingPoint
  ? `${divider()}
${section(`
  ${h2("Punto de encuentro")}
  ${p(data.meetingPoint)}
  ${p('<span style="color:#9CA3AF;font-size:12px;">Por favor, preséntate 15 minutos antes de la hora indicada con tu DNI/pasaporte y el justificante de reserva.</span>')}
`)}`
  : ""}

${data.notes
  ? `${divider()}
${section(`
  ${h2("Instrucciones adicionales")}
  ${p(data.notes)}
`)}`
  : ""}

${divider()}

${section(`
  ${h2("¿Necesitas ayuda?")}
  ${p("Si tienes alguna pregunta sobre tu reserva, contáctanos:")}
  ${p(`📧 <a href="mailto:reservas@skicenter.es" style="color:#42A5F5;">reservas@skicenter.es</a><br>📞 639 576 627<br>💬 <a href="https://wa.me/34919041947" style="color:#42A5F5;">WhatsApp</a>`)}
  ${data.dashboardUrl ? ctaButton("VER MI RESERVA", data.dashboardUrl) : ""}
`)}`;

  return emailBase(body);
}
