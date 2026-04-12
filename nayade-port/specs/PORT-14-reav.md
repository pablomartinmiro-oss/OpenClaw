# PORT-14: REAV Enhancement

## Decision: 🔧 Adaptar | Complejidad: M

## Estado actual OpenClaw

REAV module con: ReavExpedient (invoiceId, operationType, costPercentage, marginPercentage, marginAmount, taxableBase, vat), ReavCost, ReavDocument. API CRUD en `/api/reav/expedients`.

## Que aporta Nayade

1. **Expedient enriquecido**: expedientNumber secuencial, clientId, agentId, serviceDescription, serviceDate/EndDate, destination, numberOfPax, saleAmountTotal, providerCostEstimated/Real, agencyMarginEstimated/Real, reavTaxBase/TaxAmount, fiscalStatus (5 estados), operativeStatus (4 estados), clientName/Email/Phone/Dni/Address, channel, sourceRef, tpvSaleId, quoteId
2. **Calculation engine puro**: funciones `calcularLineaREAV`, `calcularREAV`, `calcularREAVSimple` — calculo fiscal REAV sin side effects
3. **Configuration validation**: `validarConfiguracionREAV` — valida que el setup fiscal es correcto
4. **Cost categories**: 7 categorias (alojamiento, transporte, actividad, seguro, guia, transfer, otros)
5. **Document types**: 6 tipos (factura_cliente, factura_proveedor, justificante, contrato, otro, soporte)

## Archivos fuente Nayade

| Archivo | Proposito |
|---------|-----------|
| `server/reav.ts` | Pure calculation engine: `validarConfiguracionREAV`, `calcularLineaREAV`, `calcularREAV`, `calcularREAVSimple` |
| `server/db.ts` → `createReavExpedient` | DB service |
| `drizzle/schema.ts` → `reav_expedients`, `reav_documents`, `reav_costs` | Schema |
| `client/src/pages/admin/fiscal/ReavManager.tsx` | Admin UI |

## Tablas Drizzle → Prisma

No tablas nuevas. Enriquecer ReavExpedient y ReavCost:

```prisma
// ReavExpedient — add:
expedientNumber       String?   // "REAV-2026-0001"
clientId              String?
agentId               String?
serviceDescription    String?
serviceDate           DateTime?
serviceEndDate        DateTime?
destination           String?
numberOfPax           Int?
saleAmountTotal       Float?
providerCostEstimated Float?
providerCostReal      Float?
agencyMarginEstimated Float?
agencyMarginReal      Float?
reavTaxBase           Float?
reavTaxAmount         Float?
fiscalStatus          String    @default("borrador") // borrador | calculado | declarado | cerrado | anulado
operativeStatus       String    @default("pendiente") // pendiente | en_curso | completado | cancelado
clientName            String?
clientEmail           String?
clientPhone           String?
clientDni             String?
clientAddress         String?
channel               String?   // "web" | "tpv" | "presupuesto"
sourceRef             String?
tpvSaleId             String?
quoteId               String?

// ReavCost — add:
providerName          String?
providerNif           String?
invoiceRef            String?
invoiceDate           DateTime?
currency              String    @default("EUR")
category              String?   // "alojamiento" | "transporte" | "actividad" | "seguro" | "guia" | "transfer" | "otros"
isPaid                Boolean   @default(false)
paidAt                DateTime?
includesVat           Boolean   @default(false)
createdBy             String?

// ReavDocument — add:
side                  String?   // "client" | "provider"
docType               String?   // "factura_cliente" | "factura_proveedor" | "justificante" | etc.
title                 String?
mimeType              String?
fileSize              Int?
notes                 String?
uploadedBy            String?
```

## Servicios internos a crear

```typescript
// src/lib/fiscal/reav-calculator.ts — pure functions, no DB

export function validarConfiguracionREAV(config: ReavConfig): ValidationResult
export function calcularLineaREAV(line: ReavLine): ReavLineResult
export function calcularREAV(expedient: ReavInput): ReavResult
export function calcularREAVSimple(saleAmount: number, costPercent: number): SimpleReavResult
```

## Endpoints tRPC → Next.js API Routes

| Nayade tRPC | OpenClaw API | Estado |
|-------------|-------------|--------|
| REAV CRUD | `/api/reav/expedients` | ✅ Existe — enriquecer |
| — | `POST /api/reav/expedients/[id]/calculate` | Nuevo — run calculation |
| — | `POST /api/reav/validate-config` | Nuevo — validate config |
| — | `POST /api/reav/calculate-simple` | Nuevo — quick calc without DB |

## Paginas admin a portar

| Nayade | OpenClaw | Estado |
|--------|----------|--------|
| `ReavManager.tsx` | `src/app/(dashboard)/reav/` | ✅ Existe — enriquecer |

## PR Checklist

- [ ] Prisma migration: enrich ReavExpedient, ReavCost, ReavDocument
- [ ] Service: `src/lib/fiscal/reav-calculator.ts` — pure calculation engine (port from `server/reav.ts`)
- [ ] API: `POST /api/reav/expedients/[id]/calculate` — recalculate expedient
- [ ] API: `POST /api/reav/validate-config` — validate fiscal setup
- [ ] API: `POST /api/reav/calculate-simple` — stateless calculation
- [ ] Enrich REAV CRUD with new fields
- [ ] UI: enrich expedient form with all new fields
- [ ] UI: "Recalcular" button that runs calculation engine
- [ ] UI: status badges (fiscal + operative)
- [ ] Wire: auto-create REAV expedient on TPV sale (PORT-19) and paid reservation
- [ ] Wire: use DocumentNumbering (PORT-01) for expedientNumber
