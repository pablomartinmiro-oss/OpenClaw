# PORT-03: Redsys Payments

## Decision: ✅ Portar | Complejidad: L

## Estado actual OpenClaw

Stubs existen:
- `src/app/api/crm/redsys/test/route.ts` — test endpoint
- `src/app/api/crm/webhooks/redsys/route.ts` — webhook receiver stub
- Quote model tiene `redsysOrderId`, `redsysPaymentUrl`, `paymentMethod`, `paymentStatus`
- Public pages: `/presupuestos/[id]/success`, `/presupuestos/[id]/error`

Pero NO hay implementacion real de criptografia 3DES, HMAC-SHA256, form builder, ni IPN validator.

## Que aporta Nayade

Implementacion **completa y funcional** de Redsys:
- `buildRedsysForm()` — genera formulario HTML con datos encriptados
- `validateRedsysNotification()` — valida IPN con HMAC-SHA256
- `generateMerchantOrder()` — genera Ds_Order unico (12 chars)
- IPN callbacks para: experiencias, restaurantes, hotel, spa
- Post-pago: actualiza reserva, crea factura, crea expediente REAV, envia emails

## Archivos fuente Nayade

| Archivo | Proposito |
|---------|-----------|
| `server/redsys.ts` | Core: `buildRedsysForm`, `validateRedsysNotification`, `generateMerchantOrder`, `getRedsysUrl`, `getMerchantCode`, `getMerchantKey` |
| `server/redsysRoutes.ts` | Express router: POST `/api/redsys/notification` (experiencias), POST `/api/redsys/restaurant-notification` |
| `server/reservationEmails.ts` | Post-payment email notifications |

## Tablas Drizzle → Prisma

No se necesitan tablas nuevas. Los campos de pago ya existen en Quote y Reservation. Solo se necesita:

| Campo existente | Accion |
|-----------------|--------|
| `Quote.redsysOrderId` | Ya existe |
| `Quote.redsysPaymentUrl` | Ya existe |
| `Quote.paymentStatus` | Ya existe |
| `Reservation.merchantOrder` (Nayade) | Añadir si no existe en Reservation |

## Servicio core a crear

```typescript
// src/lib/payments/redsys.ts

// Config from env
const REDSYS_URL = process.env.REDSYS_ENVIRONMENT === 'production'
  ? 'https://sis.redsys.es/sis/realizarPago'
  : 'https://sis-t.redsys.es:25443/sis/realizarPago';

export function buildRedsysForm(params: {
  merchantOrder: string;      // 12 chars unique
  amount: number;             // cents (100 = 1.00 EUR)
  productDescription: string;
  merchantUrl: string;        // IPN callback URL
  urlOk: string;              // Redirect on success
  urlKo: string;              // Redirect on failure
}): { url: string; params: Record<string, string> }

export function validateRedsysNotification(
  merchantParams: string,
  signature: string
): { valid: boolean; data: RedsysResponse }

export function generateMerchantOrder(): string // 12 chars: timestamp + random
```

## Endpoints tRPC → Next.js API Routes

| Nayade | OpenClaw API | Metodo | Desc |
|--------|-------------|--------|------|
| POST `/api/redsys/notification` | `POST /api/payments/redsys/notification` | POST | IPN callback (experiencias/general) |
| POST `/api/redsys/restaurant-notification` | `POST /api/payments/redsys/restaurant` | POST | IPN callback (restaurante) |
| — | `POST /api/payments/redsys/generate` | POST | Generar formulario pago (admin/checkout) |
| — | `GET /api/payments/redsys/status/[orderId]` | GET | Consultar estado pago |

## Paginas a portar

| Nayade | OpenClaw | Nota |
|--------|----------|------|
| `ReservaOk.tsx` | Ya existe: `/presupuestos/[id]/success` | Adaptar |
| `ReservaError.tsx` | Ya existe: `/presupuestos/[id]/error` | Adaptar |

## PR Checklist

- [ ] Service: `src/lib/payments/redsys.ts` — 3DES encryption, HMAC-SHA256, form builder, IPN validator
- [ ] API routes: `/api/payments/redsys/notification` (IPN callback — public, no auth)
- [ ] API routes: `/api/payments/redsys/restaurant` (IPN callback — public)
- [ ] API routes: `/api/payments/redsys/generate` (generate payment form — protected)
- [ ] Middleware: add `/api/payments/*` to public routes
- [ ] Env vars: `REDSYS_ENVIRONMENT`, `REDSYS_MERCHANT_CODE`, `REDSYS_MERCHANT_KEY`, `REDSYS_MERCHANT_TERMINAL`
- [ ] Dependency: `crypto` (Node native — no package needed)
- [ ] Post-payment hooks: update reservation status, create invoice, create REAV expedient
- [ ] Tests: mock 3DES encryption/decryption, validate IPN signature
- [ ] Update Quote and Reservation flows to generate Redsys forms
