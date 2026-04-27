import { emailBase, section, divider, ctaButton, infoTable, h1, h2, p } from "./_base";

export interface ContactFormNotificationData {
  nombre: string;
  email: string;
  telefono?: string;
  asunto?: string;
  mensaje: string;
  replyUrl?: string;
}

export interface ContactFormConfirmationData {
  nombre: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildContactFormNotificationHTML(data: ContactFormNotificationData): string {
  const rows = [
    { label: "Nombre", value: escapeHtml(data.nombre) },
    { label: "Email", value: `<a href="mailto:${escapeHtml(data.email)}" style="color:#42A5F5;">${escapeHtml(data.email)}</a>` },
    ...(data.telefono ? [{ label: "Teléfono", value: escapeHtml(data.telefono) }] : []),
    { label: "Asunto", value: escapeHtml(data.asunto ?? "Información general") },
  ];

  const body = `
${section(`
  ${h1("Nuevo mensaje desde la web")}
  ${p("Has recibido un nuevo mensaje a través del formulario de contacto de tu web.")}
  ${infoTable(rows)}
`)}

${divider()}

${section(`
  ${h2("Mensaje")}
  <div style="background-color:#F9FAFB;border:1px solid #E5E7EB;border-radius:6px;padding:16px 20px;margin:8px 0;">
    <p style="margin:0;color:#111827;font-size:14px;line-height:1.7;white-space:pre-wrap;">${escapeHtml(data.mensaje)}</p>
  </div>
  ${data.replyUrl ? ctaButton("RESPONDER", data.replyUrl) : `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px auto 0;"><tr><td style="background-color:#42A5F5;"><a href="mailto:${escapeHtml(data.email)}" style="display:inline-block;padding:14px 36px;color:#FFFFFF;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">RESPONDER AL CLIENTE</a></td></tr></table>`}
`)}`;

  return emailBase(body);
}

export function buildContactFormConfirmationHTML(data: ContactFormConfirmationData): string {
  const firstName = data.nombre.split(" ")[0];

  const body = `
${section(`
  ${h1("Hemos recibido tu mensaje")}
  ${p(`Hola <strong>${firstName}</strong>,`)}
  ${p("Gracias por contactar con Skicenter. Hemos recibido tu mensaje y nuestro equipo te responderá en menos de 24 horas.")}
  ${p("Si tienes una urgencia, puedes contactarnos directamente:")}
  ${p(`📞 639 576 627<br>💬 <a href="https://wa.me/34919041947" style="color:#42A5F5;">WhatsApp</a><br>📧 <a href="mailto:reservas@skicenter.es" style="color:#42A5F5;">reservas@skicenter.es</a>`)}
`)}

${divider()}

${section(`
  ${p('<span style="color:#9CA3AF;font-size:12px;">Este email es una confirmación automática. Por favor, no respondas directamente a este mensaje.</span>')}
`)}`;

  return emailBase(body);
}
