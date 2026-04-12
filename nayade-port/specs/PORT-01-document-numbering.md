# PORT-01: Document Numbering

## Decision: ✅ Portar | Complejidad: M

## Estado actual OpenClaw

No existe. OpenClaw usa `cuid()` para todos los IDs. No hay numeracion secuencial para facturas, presupuestos, reservas, tickets, cupones, liquidaciones ni cancelaciones. Esto es un **requisito legal** para facturacion en Espana.

## Que aporta Nayade

Sistema completo de numeracion secuencial con:
- Contadores por tipo de documento y ano (reset anual)
- Prefijo configurable por tipo (`FAC-`, `PRE-`, `RES-`, `TKT-`, `CPN-`, `LIQ-`, `ANU-`, `ABN-`)
- Generacion atomica (UPDATE+SELECT para evitar duplicados)
- Audit log de cada numero generado
- Admin UI para ver/editar prefijos y resetear contadores

## Archivos fuente Nayade

| Archivo | Proposito |
|---------|-----------|
| `server/documentNumbers.ts` | Servicio principal: `generateDocumentNumber`, `getAllCounters`, `updateCounterPrefix`, `resetCounter`, `getDocumentNumberLogs` |
| `drizzle/schema.ts` → tablas `document_counters`, `document_number_logs` | Schema |
| `client/src/pages/admin/DocumentNumbersAdmin.tsx` | Admin UI |

## Tablas Drizzle → Prisma (+ tenantId)

| Nayade (MySQL) | OpenClaw (Prisma) | Cambios |
|----------------|-------------------|---------|
| `document_counters` | `DocumentCounter` | + `tenantId`, IDs cuid, @@unique([tenantId, documentType, year]) |
| `document_number_logs` | `DocumentNumberLog` | + `tenantId`, IDs cuid |

### Prisma models

```prisma
model DocumentCounter {
  id            String   @id @default(cuid())
  tenantId      String
  documentType  String   // "invoice" | "quote" | "reservation" | "tpv" | "coupon" | "settlement" | "cancellation" | "credit_note"
  year          Int
  currentNumber Int      @default(0)
  prefix        String   // "FAC-" | "PRE-" | etc.
  updatedAt     DateTime @updatedAt

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId, documentType, year])
  @@index([tenantId])
}

model DocumentNumberLog {
  id             String   @id @default(cuid())
  tenantId       String
  documentType   String
  documentNumber String   // "FAC-2026-0001"
  year           Int
  sequence       Int
  generatedAt    DateTime @default(now())
  generatedBy    String?  // userId
  context        String?  // "auto" | "manual"

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId, documentType])
  @@index([tenantId, generatedAt])
}
```

## Endpoints tRPC → Next.js API Routes

| Nayade tRPC | OpenClaw API | Metodo | Desc |
|-------------|-------------|--------|------|
| — (inline in routers.ts) | `GET /api/settings/doc-numbers` | GET | Lista contadores del tenant |
| — | `PATCH /api/settings/doc-numbers/[id]` | PATCH | Actualizar prefijo |
| — | `POST /api/settings/doc-numbers/[id]/reset` | POST | Resetear contador |
| — | `GET /api/settings/doc-numbers/logs` | GET | Ver audit log |

## Servicio interno

```typescript
// src/lib/documents/numbering.ts
export async function generateDocumentNumber(
  tenantId: string,
  type: DocumentType,
  tx?: PrismaTransactionClient
): Promise<string>
// Atomico: upsert counter + create log + return formatted number
// Format: "{prefix}{year}-{sequence:04d}" → "FAC-2026-0001"
```

## Paginas admin a portar

| Nayade | OpenClaw |
|--------|----------|
| `DocumentNumbersAdmin.tsx` | `src/app/(dashboard)/settings/_components/DocumentNumbersCard.tsx` |

## PR Checklist

- [ ] Prisma migration: add `DocumentCounter`, `DocumentNumberLog` + relations on Tenant
- [ ] Service: `src/lib/documents/numbering.ts` — generateDocumentNumber (atomic)
- [ ] API routes: `/api/settings/doc-numbers` (GET, PATCH, POST reset, GET logs)
- [ ] Validation schema: `src/lib/validation/core.ts` — add doc number schemas
- [ ] UI: DocumentNumbersCard component in Settings page
- [ ] Seed: default counters for demo tenant (FAC, PRE, RES, TKT, CPN, LIQ, ANU)
- [ ] Tests: verify atomic generation under concurrent calls
- [ ] Wire up: update Invoice, Quote, Reservation, TpvSale creation to use generateDocumentNumber
