# PORT-06: Finance / Accounting Enhancement

## Decision: 🔧 Adaptar | Complejidad: L

## Estado actual OpenClaw

Finance module con: Invoice, InvoiceLine, Transaction, CostCenter, ExpenseCategory, Expense, ExpenseFile, RecurringExpense. API routes CRUD completos. Dashboard basico en `/api/finance/dashboard`. Reports en `/api/finance/reports`.

## Que aporta Nayade

1. **P&L Report**: reporte de Perdidas y Ganancias con breakdown por categoría, centro de coste, y mensual
2. **Accounting Dashboard**: KPIs de revenue (total, media, por categoria), charts 6 meses, recent transactions
3. **BI Reports**: informes avanzados (ventas diarias, por canal, por metodo pago, resumen fiscal)
4. **Transaction enriquecida**: transactionNumber, tipo (ingreso/reembolso/comision/gasto), saleChannel, datos fiscales (taxBase, taxAmount, reavMargin, fiscalRegime), links a TPV/reserva/factura
5. **Invoice enriquecida**: invoiceNumber secuencial, invoiceType (factura/abono), credit notes, sentAt/sentCount, paymentValidation
6. **Expense suppliers**: tabla separada para proveedores de gastos (vs proveedores de actividades)

## Archivos fuente Nayade

| Archivo | Proposito |
|---------|-----------|
| `server/routers/expenses.ts` | 5 sub-routers: costCenters, categories, suppliers, expenses, recurring + profitLoss |
| `server/db.ts` → `getAllTransactions`, `getAccountingReports`, `getDashboardMetrics` | Queries agregadas |
| `drizzle/schema.ts` → `expense_suppliers` | Expense suppliers table |
| `client/src/pages/admin/accounting/AccountingDashboard.tsx` | Dashboard UI |
| `client/src/pages/admin/accounting/AccountingReports.tsx` | Reports UI |
| `client/src/pages/admin/accounting/ProfitLossReport.tsx` | P&L UI |
| `client/src/pages/admin/accounting/TransactionsList.tsx` | Transaction ledger UI |

## Tablas Drizzle → Prisma

### Tabla nueva

```prisma
model ExpenseSupplier {
  id          String   @id @default(cuid())
  tenantId    String
  name        String
  fiscalName  String?
  vatNumber   String?
  address     String?
  email       String?
  phone       String?
  iban        String?
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId, active])
}
```

### Campos a añadir a modelos existentes

```prisma
// Invoice — add:
invoiceType       String   @default("factura") // "factura" | "abono"
creditNoteForId   String?  // ID of original invoice (for credit notes)
creditNoteReason  String?
sentAt            DateTime?
lastSentAt        DateTime?
sentCount         Int      @default(0)
paymentValidatedBy String?
paymentValidatedAt DateTime?
transferProofUrl  String?

// Transaction — add:
transactionNumber String?   // Sequential "TXN-2026-0001"
type              String    @default("ingreso") // "ingreso" | "reembolso" | "comision" | "gasto"
saleChannel       String?   // "web" | "tpv" | "presupuesto" | "cupon"
taxBase           Float?
taxAmount         Float?
reavMargin        Float?
fiscalRegime      String?   // "general" | "reav"
tpvSaleId         String?
reservationId     String?
reservationRef    String?
operationStatus   String?
clientName        String?
clientEmail       String?
productName       String?
```

## Endpoints tRPC → Next.js API Routes

| Nayade tRPC | OpenClaw API | Estado |
|-------------|-------------|--------|
| `financial.expenses.summary` | `GET /api/finance/reports` | ✅ Existe — enriquecer |
| `financial.profitLoss.report` | `GET /api/finance/reports/pnl` | Nuevo |
| `financial.suppliers.list/create/update/delete` | `/api/finance/expense-suppliers` | Nuevo (CRUD) |
| `accounting.getReports` | `GET /api/finance/reports/bi` | Nuevo |
| `accounting.getDashboard` | `GET /api/finance/dashboard` | ✅ Existe — enriquecer |
| `accounting.getTransactions` (paginated) | `GET /api/finance/transactions` | ✅ Existe — enriquecer filtros |

## Paginas admin a portar

| Nayade | OpenClaw | Estado |
|--------|----------|--------|
| `AccountingDashboard.tsx` | `src/app/(dashboard)/finance/` | ✅ Existe — enriquecer KPIs + charts |
| `AccountingReports.tsx` | `src/app/(dashboard)/finance/_components/ReportsTab.tsx` | Nuevo tab |
| `ProfitLossReport.tsx` | `src/app/(dashboard)/finance/_components/PnlTab.tsx` | Nuevo tab |
| `TransactionsList.tsx` | `src/app/(dashboard)/finance/_components/` | ✅ Existe — enriquecer filtros |
| `ExpenseSuppliersManager.tsx` | `src/app/(dashboard)/finance/_components/ExpenseSuppliersTab.tsx` | Nuevo tab |

## PR Checklist

- [ ] Prisma migration: add `ExpenseSupplier`, enrich `Invoice` and `Transaction`
- [ ] API routes: `/api/finance/expense-suppliers` (CRUD)
- [ ] API routes: `/api/finance/reports/pnl` (P&L report with date range)
- [ ] API routes: `/api/finance/reports/bi` (BI reports: daily, channel, payment method)
- [ ] Enrich `/api/finance/dashboard` with KPI aggregations
- [ ] Enrich `/api/finance/transactions` with advanced filters (type, channel, date range, search)
- [ ] Validation: `src/lib/validation/finance.ts` — expense supplier, P&L query schemas
- [ ] UI: P&L report tab with CSV export
- [ ] UI: BI reports tab with date range picker
- [ ] UI: Expense suppliers CRUD tab
- [ ] UI: Enrich dashboard with revenue charts (recharts)
- [ ] Wire: use DocumentNumbering (PORT-01) for invoiceNumber and transactionNumber
