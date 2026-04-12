# PORT-10: Suppliers + Settlements Enhancement

## Decision: 🔧 Adaptar | Complejidad: M

## Estado actual OpenClaw

Suppliers module con: Supplier (fiscalName, nif, iban, commission, paymentMethod, settlementFrequency, status), SupplierSettlement, SettlementLine, SettlementDocument, SettlementStatusLog. API CRUD completo.

## Que aporta Nayade

1. **Supplier enriquecido**: fiscalAddress, contactPerson, adminEmail, settlementDayOfMonth, autoGenerateSettlements, phone
2. **Settlement auto-generation**: `generatePending` — auto-crea liquidaciones basadas en reservas del periodo
3. **Settlement XLSX export**: descarga Excel con header + lineas
4. **Next periods preview**: `getNextPeriods` — muestra proximos periodos de liquidacion
5. **Settlement recalculate**: recalcula montos de una liquidacion existente
6. **Supplier products**: lista productos vinculados a un proveedor
7. **Settlement number** secuencial (LIQ-2026-XXXX)

## Archivos fuente Nayade

| Archivo | Proposito |
|---------|-----------|
| `server/routers/suppliers.ts` | suppliersRouter (list, get, create, update, delete, getNextPeriods, generatePending, getProducts) + settlementsRouter (list, get, preview, create, updateStatus, updateNotes, recalculate) |
| `server/settlementExportRoutes.ts` | XLSX export |
| `drizzle/schema.ts` → supplier tables | Schema |
| `client/src/pages/admin/suppliers/SuppliersManager.tsx` | Supplier CRUD |
| `client/src/pages/admin/suppliers/SuppliersDashboard.tsx` | Dashboard |
| `client/src/pages/admin/suppliers/SettlementsManager.tsx` | Settlement management |

## Tablas Drizzle → Prisma

No tablas nuevas. Enriquecer Supplier y SupplierSettlement:

```prisma
// Supplier — add:
fiscalAddress           String?
contactPerson           String?
adminEmail              String?
settlementDayOfMonth    Int?     @default(1)
autoGenerateSettlements Boolean  @default(false)

// SupplierSettlement — add:
settlementNumber        String?  // "LIQ-2026-0001" (from DocumentNumbering)
pdfKey                  String?  // S3 key for PDF
sentAt                  DateTime?
internalNotes           String?
```

## Endpoints tRPC → Next.js API Routes

| Nayade tRPC | OpenClaw API | Estado |
|-------------|-------------|--------|
| `suppliers.list/get/create/update/delete` | `/api/suppliers` | ✅ Existe |
| `suppliers.getNextPeriods` | `GET /api/suppliers/[id]/next-periods` | Nuevo |
| `suppliers.generatePending` | `POST /api/suppliers/[id]/generate-settlements` | Nuevo |
| `suppliers.getProducts` | `GET /api/suppliers/[id]/products` | Nuevo |
| `settlements.list/get/create/updateStatus/updateNotes` | `/api/suppliers/settlements` | ✅ Existe |
| `settlements.preview` | `GET /api/suppliers/settlements/preview?supplierId=X&from=Y&to=Z` | Nuevo |
| `settlements.recalculate` | `POST /api/suppliers/settlements/[id]/recalculate` | Nuevo |
| — (Express route) | `GET /api/suppliers/settlements/[id]/export-xlsx` | Nuevo |

## Paginas admin a portar

| Nayade | OpenClaw | Estado |
|--------|----------|--------|
| `SuppliersManager.tsx` | `src/app/(dashboard)/suppliers/` | ✅ Existe — enriquecer |
| `SuppliersDashboard.tsx` | `src/app/(dashboard)/suppliers/_components/` | Nuevo tab |
| `SettlementsManager.tsx` | `src/app/(dashboard)/suppliers/_components/` | ✅ Existe — enriquecer |

## PR Checklist

- [ ] Prisma migration: enrich Supplier and SupplierSettlement
- [ ] API: `GET /api/suppliers/[id]/next-periods` — preview upcoming periods
- [ ] API: `POST /api/suppliers/[id]/generate-settlements` — auto-generate
- [ ] API: `GET /api/suppliers/[id]/products` — linked products
- [ ] API: `GET /api/suppliers/settlements/preview` — preview before creating
- [ ] API: `POST /api/suppliers/settlements/[id]/recalculate`
- [ ] API: `GET /api/suppliers/settlements/[id]/export-xlsx` — XLSX download
- [ ] Dependency: `xlsx` package for export
- [ ] Service: settlement auto-generator (query reservations in period, calculate commissions)
- [ ] UI: enrich supplier form with new fields
- [ ] UI: supplier dashboard tab with stats
- [ ] UI: "Generate settlements" button with period selector
- [ ] UI: XLSX download button on settlement detail
- [ ] Wire: use DocumentNumbering (PORT-01) for settlementNumber
