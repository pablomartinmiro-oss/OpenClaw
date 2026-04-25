# Skiinet ← Náyade Gap Analysis & Port Plan

**Date:** 24 April 2026
**Purpose:** Identify everything in Náyade that's missing or incomplete in Skiinet, prioritized by business value.

---

## The Big Picture

| Dimension | Náyade | Skiinet | Gap |
|-----------|--------|---------|-----|
| Backend LOC (routers) | 17,680 (tRPC) | ~15,000 (API routes) | Comparable |
| Frontend pages LOC | 61,284 | ~30,000 | **~50% gap** |
| tRPC procedures | 576 | ~230 API routes | **~60% gap** |
| DB tables | 97 (Drizzle) | 99 (Prisma) | Models exist, logic doesn't |
| Public pages | 6,914 LOC (13 pages) | 2,277 LOC (storefront) | **67% gap** |
| Hotel module | 10,935 + 1,703 backend | 967 + 609 backend | **92% gap** |
| CRM/Clients | 10,854 LOC | 340 LOC | **97% gap** |
| TPV | 3,138 + 863 backend | 820 LOC | **80% gap** |
| Accounting | 2,899 + 524 backend | 1,643 LOC | **50% gap** |
| Ticketing | 4,056 LOC | 820 LOC | **80% gap** |
| Suppliers | 3,526 LOC | 846 LOC | **76% gap** |

**Key insight:** Skiinet has the Prisma models and basic API CRUD for most modules, but the **rich UI, business logic, and workflows** from Náyade haven't been ported. The models are skeletons — Náyade's muscle is in the frontend pages and router procedures.

---

## Module-by-Module Gap Analysis

### 🔴 HOTEL — 92% missing (biggest gap)

**Náyade has (12,638 LOC):**
- `ReservasPage` (1,360 LOC) — full stay management with guest SES form (15 fields), check-in/check-out, status workflow
- `CalendarioPage` (1,009 LOC) — visual calendar with drag-resize, occupancy heat map
- `FolioPage` (1,699 LOC) — per-stay folio with charges, payments, running balance
- `CajaRecepcionPage` (911 LOC) — front desk cash register with shift open/close
- `CanalesPage` (829 LOC) — iCal channel manager, external booking imports
- `GruposPage` + `GrupoDetailPage` (1,981 LOC) — group reservations with room blocks, services, payments
- `FacturasHotelPage` (664 LOC) — hotel-specific invoices
- `AgenciasPage` (457 LOC) — agency management with commission rates
- `DescuentosPage` (345 LOC) — hotel discount rules
- `LimpiezaPage` (485 LOC) — housekeeping status board
- `SesReportPage` (529 LOC) — SES police report generation
- Backend: 12 router files (stays, cash, discounts, groups, iCal, invoices, messages, folio, housekeeping, SES, calendario)

**Skiinet has (1,576 LOC):**
- 1 page with tabs: Room Types, Rates, Seasons, Blocks, Availability
- 5 basic CRUD API routes
- **Missing everything above** — no stays, no folios, no calendar, no front desk, no channels, no groups, no SES, no housekeeping

**Port priority:** HIGH for ski resort complexes with lodging. Can defer if Skiinet initially targets day-trip ski schools only.

---

### 🔴 CRM/CLIENTS — 97% missing

**Náyade has (10,854 LOC):**
- `CRMDashboard` (8,186 LOC) — full CRM with client profiles, activity log, contact history, quotes tied to clients, reservation history, cancellation tracking, email/phone/WhatsApp outreach, pipeline view, client segments, notes, tags
- `CancellationDetailModal` (997 LOC) — detailed cancellation workflow with resolution options, voucher issuance
- `CancellationsManager` (583 LOC) — cancellation queue with filters
- `ClientsManager` (1,088 LOC) — client CRUD with search, duplicate detection

**Skiinet has (340 LOC):**
- Basic client list + modal
- Contacts page exists (GHL-synced) but separate from client management

**Port priority:** HIGH — clients are the core revenue relationship.

---

### 🔴 TPV (Point of Sale) — 80% missing

**Náyade has (4,001 LOC):**
- `TpvScreen` (970 LOC) — full POS interface with product grid, barcode scan, cart, payment methods
- `TpvSplitPayment` (287 LOC) — split bills across payment methods
- `TpvTicket` (277 LOC) — receipt printing/PDF
- `TpvBackoffice` (352 LOC) — sales reports, register management
- `TpvOpenSession`/`TpvCloseSession` (258 LOC) — shift workflow with cash count
- `TpvCashMovement` (131 LOC) — mid-shift cash in/out
- Backend: 863 LOC with full POS logic

**Skiinet has (820 LOC):**
- 3 tabs: Registers, Sales, Sessions — basic CRUD
- **Missing:** POS screen, split payments, receipt printing, cash shift workflow

**Port priority:** HIGH — ski resorts sell equipment, lessons, food at the counter.

---

### 🟡 TICKETING/MARKETING — 80% missing

**Náyade has (4,056 LOC):**
- `CuponesManager` (1,349 LOC) — Groupon/external platform coupon management, batch redemption, email config
- `PlatformsManager` (1,081 LOC) — multi-platform product mapping (Groupon, Fever, Civitatis...)
- Backend: 1,626 LOC with platform sync, redemption workflow, settlement tracking

**Skiinet has (820 LOC):**
- 1 page with tabs — basic structure exists
- Models exist (ExternalPlatform, PlatformProduct, CouponRedemption, CouponEmailConfig)
- **Missing:** Rich UI, batch redemption flow, platform settlement tracking

**Port priority:** HIGH — ski schools sell heavily through Groupon/Fever.

---

### 🟡 SUPPLIERS — 76% missing

**Náyade has (3,526 LOC):**
- `SuppliersManager` (766 LOC) — supplier CRUD with commission types, contact info
- `SettlementsManager` (821 LOC) — settlement workflow (draft → sent → accepted → paid), document upload, line items
- `SuppliersDashboard` (249 LOC) — supplier analytics
- Backend: 1,690 LOC with settlement PDF generation, status log, document management

**Skiinet has (846 LOC):**
- SuppliersTab + SettlementsTab — basic CRUD
- **Missing:** Settlement workflow, PDF generation, document management, dashboard

**Port priority:** MEDIUM — needed when ski school works with external instructors/equipment suppliers.

---

### 🟡 ACCOUNTING — 50% missing

**Náyade has (3,423 LOC):**
- `AccountingDashboard` (254 LOC) — financial overview
- `TransactionsList` (369 LOC) — all transactions with filters
- `ExpensesManager` (562 LOC) — expense CRUD with receipt upload
- `ExpenseCategoriesManager` + `ExpenseSuppliersManager` (249 LOC)
- `RecurringExpensesManager` (211 LOC) — auto-recurring expenses
- `ProfitLossReport` (354 LOC) — P&L with date ranges
- `AccountingReports` (376 LOC) — additional reports
- Backend: 524 LOC

**Skiinet has (1,643 LOC):**
- DashboardTab, InvoicesTab, ExpensesTab, ReportsTab, ConfigTab
- **Partially done** — structure exists, but less depth than Náyade

**Port priority:** MEDIUM — financial reporting needed for business viability.

---

### 🟡 LEGO PACKS — 70% missing

**Náyade has (2,681 LOC):**
- `LegoPacksManager` (980 LOC) — admin pack builder with line items, pricing
- `LegoPacksHome` (267 LOC) — public listing
- `LegoPacksList` (425 LOC) — public browse
- `LegoPackDetail` (482 LOC) — public detail + booking
- Backend: 527 LOC

**Skiinet has:**
- Packs page exists with basic CRUD
- API routes exist (`/api/packs/*`)
- Storefront packs route exists
- **Missing:** Rich admin builder, public pack pages, snapshot pricing

**Port priority:** MEDIUM — packs are a key upsell mechanism.

---

### 🟢 PUBLIC STOREFRONT — 67% missing

**Náyade has (6,914 LOC, 13 pages):**
- Full public website: Home, Experiences, Hotel, Spa, Restaurant, Gallery
- Booking flows: Checkout, BudgetRequest, RestaurantBooking
- Coupon: CanjearCupon, VerificarBono
- Self-service: SolicitarAnulacion, QuoteAcceptance
- Legal: Cookies, Privacy, Terms

**Skiinet has (2,277 LOC):**
- Multi-tenant storefront under `/s/[slug]/`
- Pages: home, experiencias, hotel, spa, restaurante, carrito, checkout
- **Missing:** Coupon redemption flow, budget request, self-service cancellation, quote acceptance, legal pages, gallery

**Port priority:** MEDIUM-HIGH — public storefront is the revenue funnel.

---

### 🟢 ESCUELA/PROFESORES — Skiinet-specific (5,449 LOC)

This is **Skiinet-only** — Náyade doesn't have it:
- Instructor management (CRUD, availability, matching)
- Planning engine (groups, units, auto-assign, check-in)
- Time tracking (clock in/out, entries, corrections, locking)
- Payroll (records, extras, summary)
- Diplomas, disciplinary records, free days, incidents
- Instructor portal (mi-portal, mi-perfil, mis-diplomas)
- KPIs dashboard

**Status:** Most complete Skiinet-specific module. ✅

---

## Recommended Port Order

### Wave 1 — Revenue Critical (Weeks 1-3)
1. **CRM/Clients enrichment** — port CRMDashboard patterns, client profiles, activity log
2. **TPV Screen** — port POS interface for counter sales (equipment rental, lessons, food)
3. **Ticketing enrichment** — port CuponesManager, batch redemption (Groupon sales are huge)

### Wave 2 — Operations (Weeks 4-6)
4. **Hotel enrichment** — port Calendario, ReservasPage, FolioPage (for resort complexes)
5. **Suppliers enrichment** — settlement workflow, PDF generation
6. **Public storefront** — coupon redemption, budget request, self-service cancellation

### Wave 3 — Polish (Weeks 7-8)
7. **Accounting enrichment** — P&L report, expense categories depth
8. **Lego Packs** — rich pack builder, public pages
9. **CMS** — already partially done (PORT-05), finish gallery + media

### Cross-cutting (parallel)
- Merge 3 security PRs (**today**)
- S3/R2 setup for file uploads
- Price Float→Int migration
- CI/CD pipeline

---

## Port Strategy

Each module port follows this pattern:
1. **Read Náyade source** — understand the tRPC procedures and page components
2. **Map to Skiinet** — identify which Prisma models already exist, which API routes exist
3. **Adapt for ski industry** — rename hotel concepts to resort concepts, add ski-specific fields
4. **Build via Claude Code** — one prompt per module, referencing Náyade source as spec
5. **Verify** — tsc, tests, manual QA on Railway

**Key adaptation points (hotel → ski resort):**
- Hotel stays → Lodge stays / cabin bookings
- Restaurant → Mountain restaurant / cafeteria
- SPA → Post-ski wellness
- Experiences → Ski lessons, equipment rental, guided tours
- Groupon coupons → Groupon + Fever + Civitatis ski packages
- TPV → Rental shop counter, lesson desk, restaurant POS
- SES report → Not needed (hotel-specific Spanish police registration)
- iCal channels → Booking.com / Airbnb for lodging units
