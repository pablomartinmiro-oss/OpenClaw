# OpenClaw Implementation Roadmap
**Date:** 2026-04-02 | **Status:** Live on Railway | **Priority order below**

---

## Phase 0: GHL Fix (URGENT — deploy immediately)
**Why:** Webhook signature verification is broken in production. Using HMAC-SHA256 but GHL uses RSA public key signing.

**Files changed:**
- `src/app/api/crm/webhooks/route.ts` — Replaced `createHmac` with `createVerify("SHA256")` using GHL's RSA public key, reading `x-wh-signature` header
- `src/lib/env.ts` — Removed `GHL_WEBHOOK_SECRET` (no longer needed)

**Action:** Commit and push these two files. Railway auto-deploys. Remove `GHL_WEBHOOK_SECRET` from Railway env vars.

**Note:** GHL is deprecating `x-wh-signature` on July 1, 2026 in favor of Ed25519 (`x-ghl-signature`). Schedule a follow-up to add Ed25519 support before that date.

---

## Phase 1: White-Label Foundation (1-2 weeks)
**Why:** Everything is hardcoded to Skicenter (stations, categories as strings). No other ski business can use the platform until this is done.

**What (from our Phase 1 spec):**
- New Prisma models: `Destination`, `Supplier`, `ServiceCategory`, `TenantBranding`
- Migrate hardcoded `station` strings → `Destination` DB records
- Migrate hardcoded `category` strings → `ServiceCategory` DB records
- `ModuleGate` component + `useModule()` hook for toggleable features
- Settings UI for destinations, categories, branding (logo + primary color)
- Sidebar filters nav items by enabled modules
- Seed migration: auto-convert existing Skicenter data

**Files to create:** `src/app/api/destinations/`, `src/app/api/suppliers/`, `src/app/api/service-categories/`, `src/app/api/branding/`, `src/hooks/useDestinations.ts`, `src/hooks/useSuppliers.ts`, `src/hooks/useModules.ts`, `src/components/layout/ModuleGate.tsx`, `src/lib/modules.ts`

**Files to modify:** `prisma/schema.prisma`, `prisma/seed.ts`, `src/components/layout/Sidebar.tsx`, `src/app/(dashboard)/catalogo/`, `src/lib/constants/product-catalog.ts` (deprecate)

---

## Phase 2: Suppliers Module (1 week)
**Why:** Every ski business works with 5-20 suppliers (equipment providers, lift pass wholesalers, transport). Core to operations.

**Port from Nayade:** `suppliers`, `supplierSettlements`, `settlementLines`, `settlementDocuments`, `settlementStatusLog` tables

**Prisma models to add:**
```
Supplier {
  id, tenantId, name, cif, email, phone, address,
  contactPerson, commissionPercent, costType (comision_sobre_venta | coste_fijo | porcentaje_margen),
  settlementFrequency (semanal | quincenal | mensual | manual),
  settlementDayOfMonth, bankIban, isActive, notes
}

SupplierSettlement {
  id, tenantId, supplierId, settlementNumber, periodStart, periodEnd,
  totalSales, totalCommission, totalCost, netAmount, status (borrador | enviado | pagado),
  paidAt, notes
}
```

**UI:** Suppliers CRUD page, Supplier dashboard (totals, pending settlements), Settlement generator + detail view

**Link to products:** Add `supplierId` to `Product` model so each product knows which supplier provides it

---

## Phase 3: Accounting Module (2 weeks)
**Why:** P&L visibility is the #1 thing ski businesses need but don't have. This is where Nayade shines.

**Port from Nayade:** `expenses`, `expenseCategories`, `expenseSuppliers`, `expenseFiles` tables

**Prisma models to add:**
```
ExpenseCategory { id, tenantId, name, parentId?, color, isActive }

Expense {
  id, tenantId, categoryId, supplierId?, description,
  amount, taxRate, taxAmount, totalAmount,
  date, dueDate, paidAt, paymentMethod,
  isRecurring, recurringFrequency?, recurringEndDate?,
  receiptUrl?, status (pendiente | pagado | vencido), notes
}

Transaction {
  id, tenantId, type (ingreso | gasto), amount,
  relatedQuoteId?, relatedExpenseId?, relatedSettlementId?,
  description, date, category
}
```

**UI pages:**
- Accounting dashboard (monthly P&L summary, income vs expenses chart, top expense categories)
- Expenses CRUD with receipt upload, category filter, date range
- Recurring expenses manager
- P&L report (filterable by month/quarter/year, exportable)
- Transactions list (unified view of all money in/out)

**Integration:** Quote payments auto-create `Transaction` records (ingreso). Supplier settlements auto-create expense transactions.

---

## Phase 4: REAV Fiscal + Document Numbering (1 week)
**Why:** Spanish travel agencies must use REAV fiscal regime. Legal requirement.

**Port from Nayade:** `reavExpedients`, `reavDocuments`, `reavCosts` tables, `documentNumbers.ts` logic

**Prisma models:**
```
ReavExpedient {
  id, tenantId, quoteId, expedientNumber, clientName,
  totalSales, totalCosts, margin, reavTaxBase, reavTaxAmount,
  status, fiscalYear, fiscalQuarter
}

DocumentNumber {
  id, tenantId, series (presupuesto | factura | liquidacion),
  prefix, lastNumber, year
}
```

**Logic:** Auto-generate sequential document numbers per tenant per series. REAV margin calculation on quote payment.

---

## Phase 5: Operations Calendar (1 week)
**Why:** Ski businesses need a day-by-day view of what's happening: who's arriving, what equipment to prepare, which instructors are booked.

**Port from Nayade:** Calendar view, daily activities, daily orders concepts

**UI pages:**
- Calendar view (month/week/day) showing reservations, quotes, and capacity
- Daily orders view: for a given date, list all confirmed reservations with equipment/lesson details
- Monitors view: live dashboard for operations staff (today's arrivals, pending pickups)

**No new models needed** — this reads from existing `Reservation`, `Quote`, `StationCapacity` tables.

---

## Phase 6: Marketing — Coupons + Discount Codes (1 week)
**Why:** Ski businesses heavily use Groupon, discount codes, and seasonal promotions. OpenClaw has basic Groupon mapping but no real promo engine.

**Port from Nayade:** `discountCodes`, `discountCodeUses`, `couponRedemptions`, `couponEmailConfig`

**Prisma models:**
```
DiscountCode {
  id, tenantId, code, type (porcentaje | fijo), value,
  minPurchase?, maxUses, usedCount, validFrom, validTo,
  applicableCategories?, isActive
}
```

**UI:** Discount codes CRUD, usage stats, apply-at-checkout flow in quote builder

---

## Phase 7: CMS + Public Storefront (2-3 weeks)
**Why:** Medium priority. Lets tenants have a public-facing page for their services. Currently OpenClaw only has `/contacto`.

**Port from Nayade:** Pages, menus, gallery, slideshow, multimedia concepts (simplified for ski context)

**New pages:**
- `/[tenant-slug]` — Public storefront landing page
- `/[tenant-slug]/servicios` — Service catalog
- `/[tenant-slug]/presupuesto` — Quote request form (public)
- Admin CMS: page editor, menu manager, gallery/media uploads

---

## Phase 8: Email/PDF Template Editor (1 week)
**Why:** Currently email templates are hardcoded in TypeScript. Tenants should customize their own.

**Port from Nayade:** `emailTemplatesRouter`, `pdfTemplatesRouter` concepts

---

## Phase 9: Reviews Manager (3 days)
**Why:** Nice-to-have. Collect and display customer reviews.

---

## NOT porting (Nayade-specific):
- **TPV/POS** — Ski businesses don't need a point-of-sale terminal
- **Hotel module** — Out of scope (ski businesses don't run hotels)
- **SPA module** — Out of scope
- **Restaurant module** — Out of scope
- **Lego packs** — Replaced by OpenClaw's existing bundle/pack system

---

## Summary Timeline

| Phase | What | Effort | Cumulative |
|-------|------|--------|------------|
| 0 | GHL webhook fix | 1 day | 1 day |
| 1 | White-label foundation | 1-2 weeks | ~2 weeks |
| 2 | Suppliers | 1 week | ~3 weeks |
| 3 | Accounting | 2 weeks | ~5 weeks |
| 4 | REAV + doc numbers | 1 week | ~6 weeks |
| 5 | Operations calendar | 1 week | ~7 weeks |
| 6 | Coupons + discounts | 1 week | ~8 weeks |
| 7 | CMS + storefront | 2-3 weeks | ~10 weeks |
| 8 | Template editor | 1 week | ~11 weeks |
| 9 | Reviews | 3 days | ~12 weeks |

**Total: ~3 months to feature parity with Nayade (adapted for ski).**

Phases 0-4 are the critical path. Everything after that is incremental value.
