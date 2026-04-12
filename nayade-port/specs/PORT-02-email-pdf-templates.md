# PORT-02: Email + PDF Templates

## Decision: ✅ Portar | Complejidad: XL

## Estado actual OpenClaw

No existe ningun sistema de plantillas email ni PDF. Actualmente no se envian emails transaccionales ni se generan PDFs de presupuestos/facturas.

## Que aporta Nayade

### Email Templates
- 19 builder functions (todas en espanol, HTML premium compatible con Outlook)
- Templates para: confirmacion reserva, fallo pago, confirmacion restaurante, invitacion, reset password, presupuesto, factura, confirmacion transferencia, cancelacion (5 variantes), ticket TPV, cupon recibido, pago pendiente, reminder pago
- CRUD admin para plantillas custom
- Preview HTML en admin
- Test send a email arbitrario
- Variables dinamicas por template

### PDF Templates
- Generacion HTML → PDF via puppeteer-core
- Templates configurables: logo, colores, datos empresa, textos legales
- CRUD admin similar a email
- Singleton browser con auto-reconnect

## Archivos fuente Nayade

| Archivo | Proposito |
|---------|-----------|
| `server/emailTemplates.ts` | 19 builder functions (HTML) |
| `server/mailer.ts` | Dual-strategy: Brevo API + Nodemailer SMTP |
| `server/pdfGenerator.ts` | `htmlToPdf`, `closePdfBrowser` |
| `server/routers/emailTemplatesRouter.ts` | Email template CRUD |
| `server/routers/pdfTemplatesRouter.ts` | PDF template CRUD |
| `drizzle/schema.ts` → `email_templates`, `pdf_templates` | Schema |
| `client/src/pages/admin/EmailTemplatesManager.tsx` | Email admin UI |
| `client/src/pages/admin/PdfTemplatesManager.tsx` | PDF admin UI |

## Tablas Drizzle → Prisma (+ tenantId)

| Nayade | OpenClaw | Cambios |
|--------|----------|---------|
| `email_templates` | `EmailTemplate` | + tenantId, id cambia de varchar PK a cuid |
| `pdf_templates` | `PdfTemplate` | + tenantId, id cambia de varchar PK a cuid |

### Prisma models

```prisma
model EmailTemplate {
  id              String   @id @default(cuid())
  tenantId        String
  templateKey     String   // "reservation_confirm" | "quote_send" | etc.
  name            String
  description     String?
  category        String?  // "reservations" | "crm" | "cancellations" | "tpv"
  recipient       String?  // "client" | "admin" | "both"
  subject         String
  headerImageUrl  String?
  headerTitle     String?
  headerSubtitle  String?
  bodyHtml        String   @db.Text
  footerText      String?
  ctaLabel        String?
  ctaUrl          String?
  variables       String?  // JSON string of available variables
  isCustom        Boolean  @default(false)
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId, templateKey])
  @@index([tenantId])
}

model PdfTemplate {
  id              String   @id @default(cuid())
  tenantId        String
  templateKey     String   // "quote" | "invoice" | "settlement" | "ticket"
  name            String
  description     String?
  category        String?
  logoUrl         String?
  headerColor     String?  @default("#E87B5A")
  accentColor     String?  @default("#5B8C6D")
  companyName     String?
  companyAddress  String?
  companyPhone    String?
  companyEmail    String?
  companyNif      String?
  footerText      String?
  legalText       String?
  showLogo        Boolean  @default(true)
  showWatermark   Boolean  @default(false)
  bodyHtml        String   @db.Text
  variables       String?
  isCustom        Boolean  @default(false)
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId, templateKey])
  @@index([tenantId])
}
```

## Endpoints tRPC → Next.js API Routes

### Email Templates

| Nayade tRPC | OpenClaw API | Metodo |
|-------------|-------------|--------|
| `emailTemplates.list` | `GET /api/settings/email-templates` | GET |
| `emailTemplates.get` | `GET /api/settings/email-templates/[id]` | GET |
| `emailTemplates.preview` | `GET /api/settings/email-templates/[id]/preview` | GET |
| `emailTemplates.save` | `PATCH /api/settings/email-templates/[id]` | PATCH |
| `emailTemplates.create` | `POST /api/settings/email-templates` | POST |
| `emailTemplates.delete` | `DELETE /api/settings/email-templates/[id]` | DELETE |
| `emailTemplates.restore` | `POST /api/settings/email-templates/[id]/restore` | POST |
| `emailTemplates.sendTest` | `POST /api/settings/email-templates/[id]/test` | POST |

### PDF Templates

| Nayade tRPC | OpenClaw API | Metodo |
|-------------|-------------|--------|
| `pdfTemplates.list` | `GET /api/settings/pdf-templates` | GET |
| `pdfTemplates.get` | `GET /api/settings/pdf-templates/[id]` | GET |
| `pdfTemplates.save` | `PATCH /api/settings/pdf-templates/[id]` | PATCH |
| `pdfTemplates.create` | `POST /api/settings/pdf-templates` | POST |
| `pdfTemplates.delete` | `DELETE /api/settings/pdf-templates/[id]` | DELETE |
| `pdfTemplates.restore` | `POST /api/settings/pdf-templates/[id]/restore` | POST |

## Servicios internos a crear

| Servicio | Ubicacion | Funcion |
|----------|-----------|---------|
| Email builder | `src/lib/email/builders.ts` | 19 builder functions (HTML) |
| Email sender | `src/lib/email/mailer.ts` | Brevo API + Nodemailer SMTP fallback |
| PDF generator | `src/lib/pdf/generator.ts` | HTML → PDF (puppeteer-core o @react-pdf/renderer) |

## Paginas admin a portar

| Nayade | OpenClaw |
|--------|----------|
| `EmailTemplatesManager.tsx` | `src/app/(dashboard)/settings/_components/EmailTemplatesManager.tsx` (o pagina separada) |
| `PdfTemplatesManager.tsx` | `src/app/(dashboard)/settings/_components/PdfTemplatesManager.tsx` |

## PR Checklist

- [ ] Prisma migration: add `EmailTemplate`, `PdfTemplate` + Tenant relations
- [ ] Service: `src/lib/email/mailer.ts` — dual Brevo/SMTP sender
- [ ] Service: `src/lib/email/builders.ts` — port 19 HTML builder functions
- [ ] Service: `src/lib/pdf/generator.ts` — HTML to PDF
- [ ] API routes: `/api/settings/email-templates` (7 endpoints)
- [ ] API routes: `/api/settings/pdf-templates` (6 endpoints)
- [ ] Validation: `src/lib/validation/core.ts` — template schemas
- [ ] UI: EmailTemplatesManager with HTML editor + preview
- [ ] UI: PdfTemplatesManager with company info editor
- [ ] Seed: default system templates for demo tenant
- [ ] Env vars: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `BREVO_API_KEY`
- [ ] Note: existing `/api/settings/email-templates/route.ts` already exists — extend it
