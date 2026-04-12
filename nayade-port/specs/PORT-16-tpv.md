# PORT-16: TPV Enhancement

## Decision: 🔧 Adaptar | Complejidad: L

## Estado actual OpenClaw

TPV module con: CashRegister, CashSession, CashMovement, TpvSale, TpvSaleItem. API CRUD en `/api/tpv`. Basico pero funcional.

## Que aporta Nayade

1. **Split payments**: multiples metodos de pago por venta (cash + card + bizum). Tabla `tpv_sale_payments`
2. **Sale auto-integration**: al crear venta, automaticamente crea reserva, transaccion, expediente REAV, factura, envia emails
3. **Ticket email**: enviar recibo por email al cliente
4. **Backoffice reports**: historial de sesiones paginado, ventas por producto, resumen por sesion
5. **Fiscal enrichment**: taxBase, taxAmount, taxRate, reavMargin, reavCost, reavTax, fiscalSummary, saleChannel, sellerUserId/Name, operativeCenter
6. **Sale item enrichment**: eventDate, eventTime, participants, fiscalRegime, tax breakdown, REAV costs
7. **Discount integration**: aplicar codigos de descuento en TPV

## Archivos fuente Nayade

| Archivo | Proposito |
|---------|-----------|
| `server/routers/tpv.ts` | 13 endpoints: getRegisters, getActiveSession, openSession, closeSession, getSessionSummary, addCashMovement, getCatalog, createSale, getSale, getSessionSales, getBackoffice, getBackofficeSalesByProduct, sendTicketEmail |
| `drizzle/schema.ts` → `tpv_sales`, `tpv_sale_items`, `tpv_sale_payments`, `cash_*` | Schema |
| `client/src/pages/admin/tpv/TpvScreen.tsx` | POS terminal UI |
| `client/src/pages/admin/tpv/TpvBackoffice.tsx` | Session history |
| `client/src/pages/admin/tpv/TpvSplitPayment.tsx` | Split payment modal |
| `client/src/pages/admin/tpv/TpvTicket.tsx` | Receipt view |

## Tablas Drizzle → Prisma (+ tenantId)

### Modelo nuevo

```prisma
model TpvSalePayment {
  id              String   @id @default(cuid())
  tenantId        String
  saleId          String
  payerName       String?
  method          String   // "cash" | "card" | "bizum" | "other"
  amount          Float
  amountTendered  Float?   // For cash: how much was given
  changeGiven     Float?   // For cash: change returned
  status          String   @default("completed") // "pending" | "completed" | "failed" | "refunded"
  reference       String?  // Card auth code, bizum ref
  createdAt       DateTime @default(now())

  tenant Tenant  @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  sale   TpvSale @relation(fields: [saleId], references: [id], onDelete: Cascade)

  @@index([tenantId, saleId])
}
```

### Campos a añadir

```prisma
// TpvSale — add:
taxBase             Float?
taxAmount           Float?
taxRate             Float?
reavMargin          Float?
reavCost            Float?
reavTax             Float?
fiscalSummary       Json?     // {general: {base, tax}, reav: {base, margin, tax}}
saleChannel         String?   // "presencial" | "telefono"
sellerUserId        String?
sellerName          String?
operativeCenter     String?
customerEmail       String?
customerPhone       String?
notes               String?
serviceDate         DateTime?
reservationId       String?
invoiceId           String?

// TpvSaleItem — add:
eventDate           DateTime?
eventTime           String?
participants        Int?
fiscalRegime        String    @default("general") // "general" | "reav"
taxBase             Float?
taxAmount           Float?
reavCost            Float?
reavMargin          Float?
reavTax             Float?
notes               String?

// CashSession — add:
totalMixed          Float?    @default(0) // Mixed payments total
totalManualOut      Float?    @default(0)
totalManualIn       Float?    @default(0)
cashDifference      Float?    // countedCash - expected
countedCash         Float?
notes               String?
```

## Endpoints tRPC → Next.js API Routes

| Nayade tRPC | OpenClaw API | Estado |
|-------------|-------------|--------|
| `tpv.getRegisters` | `GET /api/tpv/registers` | ✅ Existe |
| `tpv.getActiveSession` | `GET /api/tpv/sessions?registerId=X&status=open` | ✅ Existe |
| `tpv.openSession` | `POST /api/tpv/sessions` | ✅ Existe |
| `tpv.closeSession` | `PATCH /api/tpv/sessions/[id]` | ✅ Existe |
| `tpv.getSessionSummary` | `GET /api/tpv/sessions/[id]/summary` | Nuevo |
| `tpv.addCashMovement` | `POST /api/tpv/sessions/[id]/movements` | ✅ Existe |
| `tpv.getCatalog` | `GET /api/tpv/catalog` | Nuevo |
| `tpv.createSale` | `POST /api/tpv/sales` | ✅ Existe — enriquecer (auto-integration) |
| `tpv.getSale` | `GET /api/tpv/sales/[id]` | ✅ Existe |
| `tpv.getSessionSales` | `GET /api/tpv/sales?sessionId=X` | ✅ Existe |
| `tpv.getBackoffice` | `GET /api/tpv/backoffice` | Nuevo |
| `tpv.getBackofficeSalesByProduct` | `GET /api/tpv/backoffice/by-product` | Nuevo |
| `tpv.sendTicketEmail` | `POST /api/tpv/sales/[id]/send-ticket` | Nuevo |

## Paginas admin a portar

| Nayade | OpenClaw | Estado |
|--------|----------|--------|
| `TpvScreen.tsx` | `src/app/(dashboard)/tpv/` | ✅ Existe — enriquecer |
| `TpvBackoffice.tsx` | `src/app/(dashboard)/tpv/_components/` | Adaptar |
| `TpvSplitPayment.tsx` | `src/app/(dashboard)/tpv/_components/SplitPaymentModal.tsx` | Nuevo |
| `TpvTicket.tsx` | `src/app/(dashboard)/tpv/_components/TicketView.tsx` | Nuevo |

## PR Checklist

- [ ] Prisma migration: add `TpvSalePayment`, enrich TpvSale, TpvSaleItem, CashSession
- [ ] API: `GET /api/tpv/sessions/[id]/summary` — session summary with totals
- [ ] API: `GET /api/tpv/catalog` — presential products for TPV screen
- [ ] API: `GET /api/tpv/backoffice` — paginated session history
- [ ] API: `GET /api/tpv/backoffice/by-product` — sales by product report
- [ ] API: `POST /api/tpv/sales/[id]/send-ticket` — email receipt
- [ ] Enrich `POST /api/tpv/sales`: accept split payments, auto-create reservation + transaction + REAV + invoice
- [ ] Service: TPV sale orchestrator (transaction within same DB call)
- [ ] Service: ticket HTML builder (depends on PORT-02)
- [ ] UI: split payment modal (add multiple payment methods)
- [ ] UI: ticket/receipt view with print option
- [ ] UI: backoffice dashboard with session history
- [ ] UI: sales by product report with filters
- [ ] Wire: discount code validation in TPV (PORT-07)
- [ ] Wire: DocumentNumbering for ticketNumber (PORT-01)
- [ ] Wire: REAV expedient auto-creation (PORT-14)
