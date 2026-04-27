import { emailBase, section, divider, ctaButton, h1, h2, p } from "./_base";

export interface WelcomeTenantData {
  ownerName: string;
  companyName: string;
  dashboardUrl: string;
}

function step(num: number, title: string, description: string): string {
  return `<tr>
  <td style="vertical-align:top;padding:0 16px 0 0;width:40px;">
    <div style="width:36px;height:36px;background-color:#42A5F5;border-radius:50%;text-align:center;line-height:36px;color:#FFFFFF;font-size:15px;font-weight:700;">${num}</div>
  </td>
  <td style="vertical-align:top;padding-bottom:24px;">
    <p style="margin:0 0 4px;color:#001D3D;font-size:14px;font-weight:700;">${title}</p>
    <p style="margin:0;color:#6B7280;font-size:13px;line-height:1.6;">${description}</p>
  </td>
</tr>`;
}

export function buildWelcomeTenantHTML(data: WelcomeTenantData): string {
  const firstName = data.ownerName.split(" ")[0];

  const body = `
${section(`
  ${h1(`¡Bienvenido a Skiinet, ${firstName}!`)}
  ${p(`Tu cuenta de <strong>${data.companyName}</strong> está lista. Ahora puedes gestionar tu negocio de viajes de esquí desde un solo lugar: presupuestos, reservas, catálogo de productos y mucho más.`)}
`)}

${divider()}

${section(`
  ${h2("Empieza en 3 pasos")}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;">
    <tbody>
      ${step(1, "Configura tu catálogo", "Accede a Ajustes → Catálogo y haz clic en \"Sembrar Catálogo\" para importar todos los productos preconfigurados (alquiler, forfaits, clases, packs y más).")}
      ${step(2, "Crea tu primer presupuesto", "Ve a Presupuestos → Nuevo y prueba el sistema de precios automático. Selecciona destino, fechas y servicios — el precio se calcula solo.")}
      ${step(3, "Gestiona tus reservas", "Desde Reservas puedes confirmar, modificar y exportar todas tus reservas. También puedes leer bonos de Groupon con la cámara.")}
    </tbody>
  </table>
  ${ctaButton("IR A MI DASHBOARD", data.dashboardUrl)}
`)}

${divider()}

${section(`
  ${h2("¿Necesitas ayuda?")}
  ${p("Nuestro equipo está aquí para ayudarte a poner en marcha tu cuenta:")}
  ${p(`📧 <a href="mailto:soporte@skiinet.com" style="color:#42A5F5;">soporte@skiinet.com</a>`)}
  ${p('<span style="color:#9CA3AF;font-size:12px;">Skiinet es una plataforma para agencias de viajes de esquí. Este es un email automático generado al crear tu cuenta.</span>')}
`)}`;

  return emailBase(body);
}
