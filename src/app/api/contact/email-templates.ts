interface NotificationData {
  nombre: string;
  email: string;
  telefono?: string;
  asunto?: string;
  mensaje: string;
}

export function buildNotificationEmail(data: NotificationData): string {
  const telefonoRow = data.telefono
    ? `<tr>
        <td style="padding: 8px 0; color: #8A8580; font-size: 14px;">Telefono</td>
        <td style="padding: 8px 0; color: #2D2A26; font-size: 14px;">${escapeHtml(data.telefono)}</td>
      </tr>`
    : "";

  return `
    <div style="font-family: 'DM Sans', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
      <div style="background: #1a4a4a; border-radius: 12px 12px 0 0; padding: 24px 32px;">
        <h1 style="color: #ffffff; font-size: 20px; margin: 0;">Nuevo contacto desde la web</h1>
      </div>
      <div style="background: #ffffff; border: 1px solid #E8E4DE; border-top: none; border-radius: 0 0 12px 12px; padding: 32px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #8A8580; font-size: 14px; width: 120px;">Nombre</td>
            <td style="padding: 8px 0; color: #2D2A26; font-size: 14px; font-weight: 600;">${escapeHtml(data.nombre)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #8A8580; font-size: 14px;">Email</td>
            <td style="padding: 8px 0; color: #2D2A26; font-size: 14px;">
              <a href="mailto:${escapeHtml(data.email)}" style="color: #E87B5A;">${escapeHtml(data.email)}</a>
            </td>
          </tr>
          ${telefonoRow}
          <tr>
            <td style="padding: 8px 0; color: #8A8580; font-size: 14px;">Asunto</td>
            <td style="padding: 8px 0; color: #2D2A26; font-size: 14px;">${escapeHtml(data.asunto || "Informacion general")}</td>
          </tr>
        </table>
        <div style="margin-top: 16px; padding: 16px; background: #FAF9F7; border-radius: 8px;">
          <p style="color: #8A8580; font-size: 12px; margin: 0 0 8px;">Mensaje:</p>
          <p style="color: #2D2A26; font-size: 14px; margin: 0; white-space: pre-wrap;">${escapeHtml(data.mensaje)}</p>
        </div>
      </div>
    </div>
  `;
}

export function buildConfirmationEmail(nombre: string): string {
  return `
    <div style="font-family: 'DM Sans', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
      <div style="background: #1a4a4a; border-radius: 12px 12px 0 0; padding: 24px 32px;">
        <h1 style="color: #ffffff; font-size: 20px; margin: 0;">Skicenter</h1>
      </div>
      <div style="background: #ffffff; border: 1px solid #E8E4DE; border-top: none; border-radius: 0 0 12px 12px; padding: 32px;">
        <p style="color: #2D2A26; font-size: 16px;">Hola ${escapeHtml(nombre)},</p>
        <p style="color: #2D2A26; font-size: 14px; line-height: 1.6;">
          Hemos recibido tu mensaje correctamente. Nuestro equipo lo revisara y te contactaremos en menos de 24 horas.
        </p>
        <p style="color: #2D2A26; font-size: 14px; line-height: 1.6;">
          Si tu consulta es urgente, puedes contactarnos directamente por WhatsApp o llamarnos.
        </p>
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #E8E4DE;">
          <p style="color: #8A8580; font-size: 12px; margin: 0;">Skicenter — Tu agencia de viajes de esqui</p>
        </div>
      </div>
    </div>
  `;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
