// Shared layout primitives — Skicenter navy/blue transactional email design

export function emailBase(body: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Skicenter</title>
</head>
<body style="margin:0;padding:0;background-color:#F5F7F9;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

<tr>
  <td style="background-color:#001D3D;padding:28px 40px;border-radius:8px 8px 0 0;" align="center">
    <div style="color:#FFFFFF;font-size:22px;font-weight:700;letter-spacing:4px;">SKICENTER</div>
    <div style="color:rgba(255,255,255,0.55);font-size:12px;margin-top:4px;letter-spacing:1px;">Tu viaje de esquí en un solo clic</div>
  </td>
</tr>

${body}

<tr>
  <td style="background-color:#0F1A2B;padding:24px 40px;border-radius:0 0 8px 8px;" align="center">
    <p style="margin:0;color:rgba(255,255,255,0.65);font-size:12px;line-height:1.8;">
      &copy; Skicenter — Agencia de viajes de esquí<br>
      <a href="mailto:reservas@skicenter.es" style="color:#42A5F5;text-decoration:none;">reservas@skicenter.es</a>
      &nbsp;·&nbsp; 639 576 627
    </p>
    <p style="margin:10px 0 0;color:rgba(255,255,255,0.3);font-size:11px;">
      Si no deseas recibir más emails,
      <a href="#unsubscribe" style="color:rgba(255,255,255,0.4);text-decoration:underline;">cancela tu suscripción</a>
    </p>
  </td>
</tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

export function section(content: string): string {
  return `<tr><td style="background-color:#FFFFFF;padding:32px 40px;">${content}</td></tr>`;
}

export function sectionAlt(content: string): string {
  return `<tr><td style="background-color:#F5F7F9;padding:24px 40px;">${content}</td></tr>`;
}

export function divider(): string {
  return `<tr><td style="background-color:#FFFFFF;padding:0 40px;"><hr style="border:none;border-top:1px solid #E5E7EB;margin:0;"></td></tr>`;
}

export function ctaButton(label: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px auto 0;">
<tr>
  <td style="background-color:#42A5F5;">
    <a href="${url}" style="display:inline-block;padding:14px 36px;color:#FFFFFF;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">${label}</a>
  </td>
</tr>
</table>`;
}

export function infoTable(rows: Array<{ label: string; value: string }>): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #E5E7EB;border-radius:6px;overflow:hidden;margin:16px 0;">
<tbody>
${rows
  .map(
    (r, i) =>
      `<tr style="background-color:${i % 2 === 0 ? "#FFFFFF" : "#F9FAFB"};">
  <td style="padding:10px 14px;color:#6B7280;font-size:13px;width:140px;">${r.label}</td>
  <td style="padding:10px 14px;color:#111827;font-size:13px;font-weight:600;">${r.value}</td>
</tr>`,
  )
  .join("")}
</tbody>
</table>`;
}

export function h1(text: string): string {
  return `<p style="margin:0 0 16px;color:#001D3D;font-size:22px;font-weight:700;line-height:1.3;">${text}</p>`;
}

export function h2(text: string): string {
  return `<p style="margin:0 0 12px;color:#001D3D;font-size:16px;font-weight:700;">${text}</p>`;
}

export function p(text: string): string {
  return `<p style="margin:0 0 14px;color:#4B5563;font-size:14px;line-height:1.7;">${text}</p>`;
}

export function highlight(content: string): string {
  return `<div style="background-color:#EFF6FF;border-left:4px solid #42A5F5;padding:14px 18px;border-radius:4px;margin:16px 0;">
<p style="margin:0;color:#1E3A5F;font-size:14px;line-height:1.6;">${content}</p>
</div>`;
}

export function formatEUR(amount: number): string {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(amount);
}
