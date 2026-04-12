# NAYADE EXPERIENCES PLATFORM — FULL AUDIT

> Audited: 2026-04-12
> Source: https://github.com/jorgemgrande-stack/nayade_experiences_platform
> Stack: Express + tRPC + Vite + React + Drizzle ORM + MySQL + S3/MinIO
> Purpose: Inventory only. No code ported.

---

## 1. COMPLETE FILE TREE

```
.
├── .dockerignore
├── .gitignore
├── .gitkeep
├── .prettierignore
├─�� .prettierrc
├── ARCHITECTURE.md
├── AUDITORIA_TECNICA.md
├── CLAUDE.md
├── Dockerfile
├── ENV_EXAMPLE.md
├── LOCAL_SETUP.md
├── PROGRESS.md
├── README-LOCAL.md
├── REDSYS_PRODUCCION.md
├── SESSION.md
├── analyze-insert.mjs
├── arquitectura_nayade.md
├── check-cols.mjs
├── components.json
├── docker-compose.yml
├── drizzle.config.ts
├── env.example.txt
├── package.json
├── playwright.config.ts
├���─ pnpm-lock.yaml
├── seed-hotel.mjs
├── seed-spa.mjs
├── send-test-emails.mjs
├── send_previews.ts
├── send_remaining_templates.mjs
├── send_templates_test.mjs
├── todo.md
├── tsconfig.json
├── vite.config.ts
├��─ vitest.config.ts
│
├── client/
│   ├── index.html
│   ├── public/
│   │   └── __manus__/
│   │       ├── debug-collector.js
│   │       └── version.json
│   └── src/
│       ├── App.tsx
│       ├── const.ts
│       ├── index.css
│       ├── main.tsx
│       ├── _core/
│       │   └── hooks/
│       │       └── useAuth.ts
│       ├── components/
│       │   ├── AIChatBox.tsx
│       │   ├── AddToCartModal.tsx
│       │   ├── AdminLayout.tsx
│       │   ├── BookingModal.tsx
│       │   ├── CartDrawer.tsx
│       │   ├── CartIcon.tsx
│       │   ├── CookieBanner.tsx
│       │   ├── DashboardLayout.tsx
│       │   ├── DashboardLayoutSkeleton.tsx
│       │   ├── DiscountRibbon.tsx
│       │   ├── ErrorBoundary.tsx
│       │   ├── HotelSearchBar.tsx
│       │   ├── ImageUploader.tsx
│       │   ├── ManusDialog.tsx
│       │   ├── Map.tsx
│       │   ├── PublicFooter.tsx
│       │   ├── PublicLayout.tsx
│       │   ├── PublicNav.tsx
│       │   ├── ReviewSection.tsx
│       │   ├── ScrollToTop.tsx
│       ���   ├── SupplierSelect.tsx
│       │   ├── TimeSlotsPanel.tsx
│       │   ├── admin/
│       │   │   └── UsersManager.tsx
│       │   └── ui/
│       │       ├── accordion.tsx
│       │       ├── alert-dialog.tsx
│       │       ├── alert.tsx
│       ��       ├── aspect-ratio.tsx
│       │       ├── avatar.tsx
│       │       ├── badge.tsx
│       │       ├── breadcrumb.tsx
│       │       ├── button-group.tsx
│       │       ├── button.tsx
│       │       ├── calendar.tsx
│       │       ├─��� card.tsx
│       │       ├── carousel.tsx
│       │       ├── chart.tsx
│       │       ├── checkbox.tsx
│       │       ├── collapsible.tsx
│       │       ├── command.tsx
│       ���       ├── context-menu.tsx
│       │       ├── dialog.tsx
│       │       ├── drawer.tsx
│       │       ├── dropdown-menu.tsx
│       │       ├── empty.tsx
│       │       ├── field.tsx
│       │       ├── form.tsx
│       │       ├── hover-card.tsx
│       │       ├── input-group.tsx
│       │       ├── input-otp.tsx
│       │       ├── input.tsx
│       │       ├── item.tsx
│       │       ├── kbd.tsx
│       │       ├── label.tsx
│       │       ├── menubar.tsx
│       │       ├── navigation-menu.tsx
│       │       ├── pagination.tsx
│       │       ├── popover.tsx
│       │       ├─�� progress.tsx
│       ��       ├── radio-group.tsx
│       │       ├── resizable.tsx
│       │       ├── scroll-area.tsx
│       │       ├─�� select.tsx
│       │       ├── separator.tsx
│       │       ├── sheet.tsx
│       │       ├── sidebar.tsx
│       │       ├���─ skeleton.tsx
│       │       ├── slider.tsx
│       │       ├── sonner.tsx
│       │       ├── spinner.tsx
│       │       ├── switch.tsx
│       │       ├── table.tsx
│       │       ├── tabs.tsx
│       │       ├── textarea.tsx
│       │       ├── toggle-group.tsx
│       │       ├── toggle.tsx
│       │       └── tooltip.tsx
│       ├── contexts/
│       │   ├── CartContext.tsx
│       │   └── ThemeContext.tsx
│       ├── hooks/
│       │   ├── useComposition.ts
│       ���   ├── useMobile.tsx
│       │   └── usePersistFn.ts
│       ├── lib/
│       │   ├── trpc.ts
│       ��   └── utils.ts
│       └── pages/
│           ├── BudgetRequest.tsx
��           ├── CanjearCupon.tsx
│           ├── Checkout.tsx
│           ├��─ CondicionesCancelacion.tsx
│           ├── Contact.tsx
│           ├── DiscountCodesManager.tsx
│           ���── DynamicPage.tsx
│           ├── ExperienceDetail.tsx
│           ��── Experiences.tsx
│           ├── ForgotPassword.tsx
��           ├── Gallery.tsx
│           ├─��� Home.tsx
│           ├── Hotel.tsx
│           ├── HotelRoom.tsx
│           ├── LegoPackDetail.tsx
│           ├── LegoPacksHome.tsx
│           ├── LegoPacksList.tsx
│           ├── Locations.tsx
│           ├── Login.tsx
│           ├── NotFound.tsx
│           ├── PoliticaCookies.tsx
│           ├── PoliticaPrivacidad.tsx
│           ├── QuoteAcceptance.tsx
│           ├── ReservaError.tsx
│           ├── ReservaOk.tsx
│           ├── ResetPassword.tsx
│           ���── RestaurantBooking.tsx
│           ├── RestauranteDetail.tsx
│           ├── RestauranteReservaKo.tsx
│           ├── RestauranteReservaOk.tsx
│           ├── Restaurantes.tsx
│           ├── SetPassword.tsx
│           ├── SolicitarAnulacion.tsx
│           ├── Spa.tsx
│           ├── SpaDetail.tsx
│           ├── TerminosCondiciones.tsx
│           ├── VerificarBono.tsx
│           └── admin/
│               ├── AdminDashboard.tsx
│               ├── DocumentNumbersAdmin.tsx
│               ├── EmailTemplatesManager.tsx
│               ├── PdfTemplatesManager.tsx
│               ├── ReviewsManager.tsx
│               ├── accounting/
│               │   ├── AccountingDashboard.tsx
│               │   ├── AccountingReports.tsx
│               │   ├── ExpenseCategoriesManager.tsx
│               │   ├── ExpenseSuppliersManager.tsx
│               │   ├── ExpensesManager.tsx
��               │   ├── ProfitLossReport.tsx
│               │   ├── RecurringExpensesManager.tsx
│               │   └── TransactionsList.tsx
│               ├── cms/
│               │   ├── GalleryManager.tsx
│               │   ├── HomeModulesManager.tsx
│               │   ├── MenusManager.tsx
│               │   ├── MultimediaManager.tsx
│               │   ├── PagesManager.tsx
│               │   └── SlideshowManager.tsx
│               ├── crm/
│               │   ├── CRMDashboard.tsx
│               │   ├── CancellationDetailModal.tsx
│               │   ├── CancellationsManager.tsx
│               │   └── ClientsManager.tsx
│               ├── fiscal/
│               │   └── ReavManager.tsx
│               ├── hotel/
│               │   └── HotelManager.tsx
│               ├── marketing/
│               ��   ├── CuponesManager.tsx
│               │   └── PlatformsManager.tsx
│               ├── operations/
│               │   ├── BookingsList.tsx
│               │   ├── CalendarView.tsx
│               │   ├── DailyActivities.tsx
│               │   ├── DailyOrders.tsx
│               │   ├── MonitorsManager.tsx
│               │   └── ReservationsManager.tsx
│               ├── products/
│               │   ├── CategoriesManager.tsx
│               │   ├── ExperiencesManager.tsx
│               │   ├── LegoPacksManager.tsx
│               │   ├── LocationsManager.tsx
│               ���   └── VariantsManager.tsx
│               ├── restaurants/
│               │   ├── GlobalCalendar.tsx
│               │   └── RestaurantsManager.tsx
│               ├── settings/
│               │   └── Settings.tsx
│               ├── spa/
│               │   └── SpaManager.tsx
│               ├── suppliers/
│               │   ├── SettlementsManager.tsx
│               │   ├── SuppliersDashboard.tsx
│               │   └── SuppliersManager.tsx
│               ├── tpv/
│               │   ├── TpvBackoffice.tsx
│               │   ├── TpvCashMovement.tsx
│               │   ├── TpvCloseSession.tsx
│               │   ├── TpvOpenSession.tsx
│               ���   ├── TpvScreen.tsx
│               │   ├── TpvSplitPayment.tsx
│               │   └── TpvTicket.tsx
│               └── users/
│                   └── UsersManager.tsx
│
├── data/
│   └── seed.json
│
├── drizzle/
│   ├── schema.ts
│   ��── relations.ts  (empty — no Drizzle relations defined)
│   ├── 0000_daily_human_fly.sql ... 0043_reservation_activities_op_json.sql  (44 migrations)
│   ├── meta/
│   │   ├── 0000_snapshot.json ... 0038_snapshot.json, 0041_snapshot.json
│   ���   └── _journal.json
│   └── migrations/
│       └── .gitkeep
│
├── e2e/
│   ├── auth.spec.ts
│   ├── reserva-experiencia.spec.ts
│   └── reserva-hotel.spec.ts
│
├── patches/
│   └── wouter@3.7.1.patch
│
├── scripts/
│   ├── create-admin.mjs
│   ├── export-seed.mjs
│   ├── export-to-seed.mjs
│   ├── import-seed.mjs
│   ├── seed-data.mjs
│   ├── seed-restaurants.mjs
│   └── setup-minio.mjs
│
├── server/
│   ├── routers.ts              (main appRouter — aggregates all sub-routers)
│   ├── routers/
│   │   ├── cancellations.ts
│   ��   ├── crm.ts
│   │   ├── discounts.ts
│   │   ├── emailTemplatesRouter.ts
│   │   ├── expenses.ts
│   │   ├── hotel.ts
│   │   ├── legoPacks.ts
│   │   ├── operations.ts
│   │   ├── pdfTemplatesRouter.ts
│   ��   ├── restaurants.ts
│   │   ├── reviews.ts
│   │   ├── spa.ts
│   │   ├── suppliers.ts
│   │   ├── ticketing.ts
│   ���   ├── timeSlots.ts
│   │   └── tpv.ts
│   ├── _core/
│   │   ├── context.ts
│   │   ├── context.local.ts
│   │   ├── cookies.ts
│   │   ├── dataApi.ts
│   │   ├── env.ts
│   │   ├── imageGeneration.ts
���   │   ├── index.ts            (main entry point)
│   │   ├── llm.ts
│   │   ├── map.ts
│   │   ├── notification.ts
│   │   ├── oauth.ts
│   │   ├── sdk.ts
│   │   ├── systemRouter.ts
│   │   ├── trpc.ts
│   │   ├── types/
│   │   │   ├── cookie.d.ts
��   │   │   └── manusTypes.ts
│   │   ├── vite.ts
│   │   └── voiceTranscription.ts
│   ├── adapters/
│   │   ├── imageGeneration.ts
│   ��   ├── index.ts
│   ��   ├── llm.ts
│   │   ├── maps.ts
│   │   ├── notification.ts
│   │   └── storage.ts
│   ├── db/
│   │   └── reviewsDb.ts
│   ├── db.ts                   (main DB service — ~2000 lines)
│   ��── authGuard.ts
│   ├── documentNumbers.ts
│   ├── emailTemplates.ts
│   ├── galleryDb.ts
│   ├── ghl.ts
│   ├── hotelDb.ts
│   ├── inviteEmail.ts
│   ├── localAuth.ts
│   ├── mailer.ts
│   ├── passwordReset.ts
│   ├── pdfGenerator.ts
│   ├���─ quoteReminderJob.ts
│   ├── reav.ts
│   ├── redsys.ts
│   ���── redsysRoutes.ts
│   ├── reservationEmails.ts
│   ├── restaurantsDb.ts
│   ├── settlementExportRoutes.ts
│   ├── spaDb.ts
│   ├── storage.ts
│   ├── uploadRoutes.ts
│   └── *.test.ts               (26 test files — not listed individually)
│
├── shared/
│   ├���─ _core/
│   │   └── errors.ts
│   ├── const.ts
│   └── types.ts
│
└── test-results/
    └── .last-run.json
```

**Directories that DO NOT exist in Nayade:**
- `server/services/` — NO services directory. Services are flat files at `server/*.ts`
- `shared/schema/` — NO separate schema directory. Schema is in `drizzle/schema.ts`
- `server/middleware/` — NO middleware directory. Auth guard is at `server/authGuard.ts`
- `prisma/` — Uses Drizzle ORM, not Prisma

---

## 2. ROUTERS (server/routers/*.ts)

### 2.1 routers.ts — Main appRouter

Aggregates all sub-routers and defines inline routers.

**Router keys:** `system`, `financial`, `cancellations`, `emailTemplates`, `operations`, `pdfTemplates`, `auth`, `public`, `cms`, `products`, `bookings`, `hotel`, `spa`, `reviews`, `restaurants`, `crm`, `suppliers`, `settlements`, `timeSlots`, `tpv`, `discounts`, `legoPacks`, `ticketing`

**Inline `auth` router:**

| Endpoint | Type | Input | Description |
|----------|------|-------|-------------|
| `me` | query | — | Returns current user from session |
| `logout` | mutation | — | Clears session cookie |

**Inline `public` router:**

| Endpoint | Type | Input | Description |
|----------|------|-------|-------------|
| `getFeaturedExperiences` | query | — | Featured experiences list |
| `getExperiences` | query | `{categorySlug?, locationSlug?, limit, offset}` | Paginated public experiences |
| `getExperienceBySlug` | query | `{slug}` | Single experience by slug |
| `getVariantsByExperience` | query | `{experienceId}` | Variants for an experience |
| `setPassword` | mutation | `{token, password (min 6)}` | Set password via invite token |
| `getCategories` | query | — | Public categories |
| `getLocations` | query | — | Public locations |
| `getSlideshowItems` | query | — | Public slideshow |
| `getMenuItems` | query | `{zone: "header"/"footer"}` | Navigation menu items |
| `submitLead` | mutation | `{name, email, phone?, company?, message?, experienceId?, locationId?, preferredDate?, numberOfPersons?, budget?, selectedCategory?, selectedProduct?, source?}` | Submit lead from website |
| `submitBudget` | mutation | `{name, email, phone, arrivalDate, adults, children, selectedCategory, selectedProduct, activitiesJson?, comments?, honeypot?}` | Submit budget request |
| `getPublicPage` | query | `{slug}` | CMS page by slug |
| `getPublicPageBlocks` | query | `{slug}` | Page blocks for CMS page |

**Inline `cms` router (admin):**

| Endpoint | Type | Input | Description |
|----------|------|-------|-------------|
| `getSlideshowItems` | query | — | All slideshow items (admin) |
| `createSlideshowItem` | mutation | `{imageUrl, badge?, title?, subtitle?, description?, ctaText?, ctaUrl?, reserveUrl?, sortOrder, isActive}` | Create slideshow item |
| `updateSlideshowItem` | mutation | `{id, ...partial}` | Update slideshow item |
| `deleteSlideshowItem` | mutation | `{id}` | Delete slideshow item |
| `reorderSlideshowItems` | mutation | `{items: [{id, sortOrder}]}` | Reorder slides |
| `getMediaFiles` | query | — | All media files |
| `deleteMediaFile` | mutation | `{id}` | Delete media file |
| `getMenuItems` | query | `{zone}` | Admin menu items |
| `createMenuItem` | mutation | `{label, url?, parentId?, target, sortOrder, isActive, menuZone}` | Create menu item |
| `updateMenuItem` | mutation | `{id, ...partial}` | Update menu item |
| `deleteMenuItem` | mutation | `{id}` | Delete menu item |
| `reorderMenuItems` | mutation | `{items: [{id, sortOrder}]}` | Reorder menu |
| `getPages` | query | — | List CMS pages |
| `getPageBlocks` | query | `{pageSlug}` | Get page blocks |
| `savePageBlocks` | mutation | `{pageSlug, blocks: [{id?, blockType, sortOrder, data, isVisible}]}` | Save page blocks |
| `upsertPage` | mutation | `{slug, title, isPublished, metaTitle?, metaDescription?}` | Create/update page |
| `getSiteSettings` | query | — | Site settings key-value |
| `updateSiteSettings` | mutation | `{settings: Record<string, string|null>}` | Update settings |

**Inline `products` router (admin):**

| Endpoint | Type | Input | Description |
|----------|------|-------|-------------|
| `getAll` | query | — | All experiences |
| `create` | mutation | Full experience schema | Create experience |
| `update` | mutation | `{id, ...partial}` | Update experience |
| `delete` | mutation | `{id}` | Soft delete |
| `hardDelete` | mutation | `{id}` | Hard delete |
| `toggleActive` | mutation | `{id, isActive}` | Toggle active |
| `clone` | mutation | `{id, newName?}` | Clone experience |
| `reorder` | mutation | `{items: [{id, sortOrder}]}` | Reorder |
| `getCategories` | query | — | All categories |
| `createCategory` | mutation | `{slug, name, description?, image1?, iconName?, sortOrder}` | Create category |
| `updateCategory` | mutation | `{id, ...partial}` | Update category |
| `deleteCategory` | mutation | `{id}` | Soft delete category |
| `hardDeleteCategory` | mutation | `{id}` | Hard delete |
| `toggleCategoryActive` | mutation | `{id, isActive}` | Toggle active |
| `cloneCategory` | mutation | `{id}` | Clone |
| `reorderCategories` | mutation | `{items}` | Reorder |
| `getLocations` | query | — | All locations |
| `createLocation` | mutation | `{slug, name, description?, imageUrl?, address?}` | Create location |
| `updateLocation` | mutation | `{id, ...partial}` | Update location |
| `deleteLocation` | mutation | `{id}` | Soft delete |
| `hardDeleteLocation` | mutation | `{id}` | Hard delete |
| `toggleLocationActive` | mutation | `{id, isActive}` | Toggle active |
| `cloneLocation` | mutation | `{id}` | Clone |
| `reorderLocations` | mutation | `{items}` | Reorder |
| `getVariants` | query | `{experienceId?}` | Get variants |
| `createVariant` | mutation | `{experienceId, name, description?, priceModifier, priceType, isRequired, sortOrder}` | Create variant |
| `updateVariant` | mutation | `{id, ...partial}` | Update variant |
| `deleteVariant` | mutation | `{id}` | Delete variant |

**Inline `bookings` router:**

| Endpoint | Type | Input | Description |
|----------|------|-------|-------------|
| `getAll` | query | `{status?, from?, to?, limit, offset}` | List reservations |

### 2.2 cancellations.ts — cancellationsRouter

| Endpoint | Type | Access | Input | Description |
|----------|------|--------|-------|-------------|
| `createRequest` | mutation | public | `{fullName, email?, phone?, activityDate, reason: enum, reasonDetail?, termsChecked, locator?, originUrl?, ipAddress?}` | Public cancellation request |
| `listRequests` | query | admin | `{search?, operationalStatus?, resolutionStatus?, financialStatus?, reason?, hasVoucher?, limit, offset}` | List with filters + KPI aggregates |
| `getRequest` | query | admin | `{id}` | Request detail with logs/voucher |
| `updateNotes` | mutation | admin | `{id, adminNotes}` | Update internal notes |
| `assignUser` | mutation | admin | `{id, userId}` | Assign responsible admin |
| `rejectRequest` | mutation | admin | `{id, adminText?, sendEmail?}` | Reject request |
| `acceptRequest` | mutation | admin | `{id, isPartial?, compensationType, refundAmount?, voucherValue?, ...}` | Accept with refund or voucher |
| `requestDocumentation` | mutation | admin | `{id, text (min 10), sendEmail?}` | Request docs from client |
| `markIncidence` | mutation | admin | `{id, note?, economicIncidence?}` | Mark as incidence |
| `updateOperationalStatus` | mutation | admin | `{id, status: enum}` | Change operational status |
| `markRefundExecuted` | mutation | admin | `{id, note?}` | Mark refund executed |
| `markVoucherSent` | mutation | admin | `{id, voucherId}` | Mark voucher sent |
| `closeRequest` | mutation | admin | `{id, note?}` | Close case |
| `updateFinancialStatus` | mutation | admin | `{id, financialStatus: enum}` | Update financial status |
| `deleteRequest` | mutation | admin | `{id}` | Delete request + logs |
| `getCounters` | query | admin | — | Badge counters (pending, incidencias) |
| `uploadVoucherPdf` | mutation | admin | `{voucherId, pdfBase64, filename}` | Upload voucher PDF |
| `getImpact` | query | admin | `{id}` | Preview propagation impact |
| `createManualRequest` | mutation | admin | `{fullName, email?, phone?, activityDate, reason, ...}` | Manual cancellation entry |

### 2.3 crm.ts — crmRouter

Full CRM pipeline: Leads -> Quotes -> Payments -> Reservations -> Invoices.

**crm.leads:**

| Endpoint | Type | Input | Description |
|----------|------|-------|-------------|
| `list` | query | `{opportunityStatus?, search?, assignedTo?, priority?, from?, to?, limit, offset}` | List leads |
| `counters` | query | — | Lead KPI counters |
| `get` | query | `{id}` | Lead detail with activity log |
| `update` | mutation | `{id, ...fields}` | Update lead fields |
| `addNote` | mutation | `{id, text}` | Add internal note |
| `markLost` | mutation | `{id, reason?}` | Mark as lost |
| `convertToQuote` | mutation | `{leadId, title, items: [{description, quantity, unitPrice, total}], subtotal, discount, taxRate, total, ...}` | Manual quote from lead |
| `generateFromLead` | mutation | `{leadId, taxRate?, conditions?}` | Auto-generate quote from lead's activitiesJson |
| `previewFromLead` | query | `{leadId}` | Preview quote lines |

**crm.quotes, crm.reservations, crm.invoices, crm.clients, crm.dashboard** — extensive procedures for the full pipeline (list, CRUD, status changes, email sending, Redsys payment links, transfer confirmation, PDF generation, invoice creation, etc.)

### 2.4 discounts.ts — discountsRouter

| Endpoint | Type | Access | Input | Description |
|----------|------|--------|-------|-------------|
| `validate` | mutation | public | `{code, amount?}` | Validate discount code (checkout/TPV) |
| `verifyVoucher` | query | public | `{code}` | Verify compensation voucher |
| `list` | query | protected | `{search?, status, page, pageSize}` | List discount codes |
| `getById` | query | protected | `{id}` | Get by ID |
| `create` | mutation | protected | `{code, name, description?, discountPercent: 1-100, expiresAt?, maxUses?, observations?}` | Create discount code |
| `update` | mutation | protected | `{id, ...partial}` | Update code |
| `toggleStatus` | mutation | protected | `{id, active}` | Toggle active/inactive |
| `duplicate` | mutation | protected | `{id}` | Duplicate code |
| `delete` | mutation | protected | `{id}` | Delete (soft if has uses) |
| `getUses` | query | protected | `{discountCodeId}` | Usage history |

### 2.5 emailTemplatesRouter.ts

| Endpoint | Type | Input | Description |
|----------|------|-------|-------------|
| `list` | query | — | List all email templates |
| `get` | query | `{id}` | Full template for editing |
| `preview` | query | `{id}` | HTML preview |
| `save` | mutation | `{id, name, subject, headerTitle?, bodyHtml, ...}` | Save template |
| `create` | mutation | `{id, name, subject, bodyHtml, ...}` | Create custom template |
| `delete` | mutation | `{id}` | Delete custom template |
| `restore` | mutation | `{id}` | Restore system template |
| `sendTest` | mutation | `{id, toEmail}` | Send test email |
| `sendAllTests` | mutation | `{toEmail}` | Send all active as test |

### 2.6 expenses.ts — expensesModuleRouter (5 sub-routers)

**financial.costCenters:** `list`, `create`, `update`, `delete`
**financial.categories:** `list`, `create`, `update`, `delete`
**financial.suppliers:** `list`, `create`, `update`, `delete`

**financial.expenses:**

| Endpoint | Type | Input | Description |
|----------|------|-------|-------------|
| `list` | query | `{dateFrom?, dateTo?, categoryId?, costCenterId?, supplierId?, status?, paymentMethod?, limit, offset}` | List with filters |
| `getById` | query | `{id}` | Get expense with files |
| `create` | mutation | `{date, concept, amount, categoryId, costCenterId, supplierId?, paymentMethod, status, notes?}` | Create expense |
| `update` | mutation | `{id, ...same}` | Update |
| `delete` | mutation | `{id}` | Delete + files |
| `uploadFile` | mutation | `{expenseId, fileName, mimeType, base64}` | Upload attachment |
| `deleteFile` | mutation | `{fileId}` | Delete attachment |
| `summary` | query | `{dateFrom, dateTo, groupBy}` | Expense summary for P&L |

**financial.recurring:** `list`, `create`, `update`, `delete`, `trigger`

**financial.profitLoss:**

| Endpoint | Type | Input | Description |
|----------|------|-------|-------------|
| `report` | query | `{dateFrom, dateTo}` | P&L report (revenue + expenses + monthly breakdown) |

### 2.7 hotel.ts — hotelRouter

| Endpoint | Type | Access | Input | Description |
|----------|------|--------|-------|-------------|
| `getRoomTypes` | query | public | — | Active room types with avg ratings |
| `getRoomTypeBySlug` | query | public | `{slug}` | Room detail by slug |
| `searchAvailability` | query | public | `{checkIn, checkOut, adults, children}` | Search availability |
| `getRoomCalendar` | query | public | `{roomTypeId, year, month}` | Monthly price/availability calendar |
| `adminGetRoomTypes` | query | admin | — | All room types |
| `adminCreateRoomType` | mutation | admin | Full schema | Create room type |
| `adminUpdateRoomType` | mutation | admin | `{id, ...partial}` | Update |
| `adminDeleteRoomType` | mutation | admin | `{id}` | Delete |
| `adminToggleRoomTypeActive` | mutation | admin | `{id, isActive}` | Toggle active |
| `adminGetRateSeasons` | query | admin | — | Rate seasons |
| `adminCreateRateSeason` | mutation | admin | `{name, startDate, endDate, isActive, sortOrder}` | Create season |
| `adminUpdateRateSeason` | mutation | admin | `{id, ...partial}` | Update |
| `adminDeleteRateSeason` | mutation | admin | `{id}` | Delete |
| `adminGetRates` | query | admin | `{roomTypeId}` | Rates by room type |
| `adminCreateRate` | mutation | admin | `{roomTypeId, seasonId?, dayOfWeek?, specificDate?, pricePerNight, ...}` | Create rate |
| `adminUpdateRate` | mutation | admin | `{id, ...partial}` | Update |
| `adminDeleteRate` | mutation | admin | `{id}` | Delete |
| `adminGetBlocks` | query | admin | `{roomTypeId?, startDate, endDate}` | Room blocks |
| `adminUpsertBlock` | mutation | admin | `{roomTypeId, date, availableUnits, reason?}` | Upsert block |
| `adminDeleteBlock` | mutation | admin | `{id}` | Delete block |
| `adminGetCalendar` | query | admin | `{roomTypeId, year, month}` | Admin calendar |
| `createHotelBooking` | mutation | public | `{roomTypeId, checkIn, checkOut, adults, children, customerName, customerEmail, ...}` | Create booking + Redsys form |

### 2.8 legoPacks.ts — legoPacksRouter

| Endpoint | Type | Access | Input | Description |
|----------|------|--------|-------|-------------|
| `list` | query | admin | `{isPublished?, isActive?}?` | List packs with line counts |
| `listPublic` | query | public | — | Public active+published packs |
| `listPublicByCategory` | query | public | `{category}` | Packs by category |
| `get` | query | admin | `{id}` | Pack with all lines |
| `getBySlug` | query | public | `{slug}` | Published pack by slug |
| `create` | mutation | admin | Full schema | Create pack |
| `update` | mutation | admin | `{id, ...}` | Update |
| `delete` | mutation | admin | `{id}` | Delete + lines |
| `togglePublished` | mutation | admin | `{id, isPublished}` | Toggle published |
| `reorder` | mutation | admin | `[{id, sortOrder}]` | Reorder |
| `addLine` | mutation | admin | `{legoPackId, sourceType, sourceId, ...}` | Add line |
| `updateLine` | mutation | admin | `{id, ...}` | Update line |
| `deleteLine` | mutation | admin | `{id}` | Delete line |
| `reorderLines` | mutation | admin | `[{id, sortOrder}]` | Reorder lines |
| `calculatePrice` | query | public | `{legoPackId, activeLineIds?}` | Price breakdown |
| `saveSnapshot` | mutation | protected | `{legoPackId, operationType, operationId, activeLineIds?}` | Save pricing snapshot |
| `getSnapshot` | query | protected | `{operationType, operationId}` | Get snapshot |
| `stats` | query | admin | — | Sales stats |

### 2.9 operations.ts — operationsRouter

**operations.monitors:** `list`, `get`, `create`, `update`, `delete`, `addDocument`, `deleteDocument`, `addPayroll`, `updatePayroll`, `deletePayroll`

**operations.calendar:**

| Endpoint | Type | Input | Description |
|----------|------|-------|-------------|
| `getEvents` | query | `{from, to}` | All events (activities + restaurant bookings) |

**operations.dailyOrders:**

| Endpoint | Type | Input | Description |
|----------|------|-------|-------------|
| `getForDate` | query | `{date}` | Daily orders for date |
| `updateOperational` | mutation | `{reservationId, reservationType, clientConfirmed?, arrivalTime?, opNotes?, monitorId?, opStatus?}` | Update operational data |
| `getDashboardStats` | query | `{date}` | Dashboard stats for date |

**operations.activities:**

| Endpoint | Type | Input | Description |
|----------|------|-------|-------------|
| `getForDate` | query | `{date}` | Activities for date |
| `assignMonitor` | mutation | `{reservationId, monitorId}` | Assign monitor |
| `confirmArrival` | mutation | `{reservationId}` | Confirm arrival |
| `cancelActivity` | mutation | `{reservationId}` | Cancel activity |
| `updateDetails` | mutation | `{reservationId, arrivalTime?, opNotes?, monitorId?}` | Update details |
| `updateActivityOp` | mutation | `{reservationId, activityIndex, monitorId?, arrivalTime?, opNotes?}` | Update sub-activity |

### 2.10 pdfTemplatesRouter.ts

| Endpoint | Type | Input | Description |
|----------|------|-------|-------------|
| `list` | query | — | List PDF templates |
| `get` | query | `{id}` | Full template |
| `save` | mutation | `{id, name, bodyHtml, colors, company fields, ...}` | Save template |
| `create` | mutation | `{id, name, bodyHtml, ...}` | Create custom |
| `delete` | mutation | `{id}` | Delete custom |
| `restore` | mutation | `{id}` | Restore system template |

### 2.11 restaurants.ts — restaurantsRouter

| Endpoint | Type | Access | Input | Description |
|----------|------|--------|-------|-------------|
| `getAll` | query | public | — | Active restaurants |
| `getBySlug` | query | public | `{slug}` | Restaurant by slug |
| `getAvailability` | query | public | `{restaurantId, date}` | Shift availability |
| `getShifts` | query | public | `{restaurantId}` | Active shifts |
| `createBooking` | mutation | public | `{restaurantId, shiftId, date, time, guests, guestName, guestEmail, ...}` | Public booking |
| `getBookingByLocator` | query | public | `{locator}` | Lookup by locator |
| `getDashboard` | query | adminrest | `{restaurantId}` | Dashboard stats |
| `myRestaurants` | query | adminrest | — | User's restaurants |
| `adminGetBookings` | query | adminrest | `{restaurantId, date?, status?, search?, page?, limit?}` | Admin booking list |
| `adminGetBookingsByDate` | query | adminrest | `{restaurantId, date}` | Bookings for date |
| `adminGetBooking` | query | adminrest | `{id}` | Detail with logs |
| `adminUpdateBookingStatus` | mutation | adminrest | `{id, status, cancellationReason?}` | Update status |
| `adminCreateBooking` | mutation | adminrest | Full schema | Admin booking |
| `adminEditBooking` | mutation | adminrest | `{id, ...partial}` | Edit booking |
| `adminGetShifts` | query | adminrest | `{restaurantId}` | All shifts |
| `adminCreateShift` | mutation | adminrest | `{restaurantId, name, startTime, endTime, maxCapacity, ...}` | Create shift |
| `adminUpdateShift` | mutation | adminrest | `{id, ...partial}` | Update shift |
| `adminDeleteShift` | mutation | adminrest | `{id}` | Delete shift |
| `adminGetClosures` | query | adminrest | `{restaurantId, fromDate?, toDate?}` | Closures |
| `adminCreateClosure` | mutation | adminrest | `{restaurantId, date, shiftId?, reason?}` | Create closure |
| `adminDeleteClosure` | mutation | adminrest | `{id}` | Delete closure |
| `adminGetAll` | query | admin-only | — | All restaurants (global) |
| `adminCreate` | mutation | admin-only | Full schema | Create restaurant |
| `adminUpdate` | mutation | admin-only | `{id, ...}` | Update restaurant |
| `adminAssignStaff` | mutation | admin-only | `{userId, restaurantId}` | Assign staff |
| `adminRemoveStaff` | mutation | admin-only | `{userId, restaurantId}` | Remove staff |
| `adminGetStaff` | query | admin-only | `{restaurantId}` | List staff |
| `adminGetCalendar` | query | adminrest | `{restaurantId, date}` | Calendar for date |
| `adminAddNote` | mutation | adminrest | `{bookingId, note}` | Add internal note |
| `adminUpdateConfig` | mutation | adminrest | `{restaurantId, ...config}` | Update config |
| `adminDeleteBooking` | mutation | adminrest | `{bookingId}` | Soft delete |
| `adminGetGlobalCalendar` | query | adminrest | `{yearMonth, restaurantId?}` | Global calendar |

### 2.12 reviews.ts — reviewsRouter

| Endpoint | Type | Access | Input | Description |
|----------|------|--------|-------|-------------|
| `getPublicReviews` | query | public | `{entityType: "hotel"/"spa", entityId, limit, offset}` | Approved reviews + stats |
| `submitReview` | mutation | public | `{entityType, entityId, authorName, authorEmail?, rating: 1-5, title?, body, stayDate?}` | Submit (pending moderation) |
| `adminGetReviews` | query | admin | `{entityType?, status?, limit, offset}` | Admin review list |
| `adminGetStats` | query | admin | — | Global stats |
| `adminApprove` | mutation | admin | `{id}` | Approve |
| `adminReject` | mutation | admin | `{id}` | Reject |
| `adminDelete` | mutation | admin | `{id}` | Delete |
| `adminReply` | mutation | admin | `{id, reply}` | Reply |

### 2.13 spa.ts — spaRouter

| Endpoint | Type | Access | Input | Description |
|----------|------|--------|-------|-------------|
| `getCategories` | query | public | — | Active spa categories |
| `getTreatments` | query | public | `{categoryId?}` | Active treatments with ratings |
| `getTreatmentBySlug` | query | public | `{slug}` | Treatment by slug |
| `getSlotsByMonth` | query | public | `{treatmentId, startDate, endDate}` | Monthly slot availability |
| `getAvailableSlots` | query | public | `{treatmentId, date}` | Slots for a date |
| `adminGetCategories` | query | admin | — | All categories |
| `adminCreateCategory` | mutation | admin | `{slug, name, description?, iconName?, sortOrder}` | Create |
| `adminUpdateCategory` | mutation | admin | `{id, ...partial}` | Update |
| `adminDeleteCategory` | mutation | admin | `{id}` | Delete |
| `adminGetTreatments` | query | admin | — | All treatments |
| `adminCreateTreatment` | mutation | admin | Full schema | Create |
| `adminUpdateTreatment` | mutation | admin | `{id, ...partial}` | Update |
| `adminDeleteTreatment` | mutation | admin | `{id}` | Delete |
| `adminToggleTreatmentActive` | mutation | admin | `{id, isActive}` | Toggle |
| `adminGetResources` | query | admin | — | Resources |
| `adminCreateResource` | mutation | admin | `{type, name, description?, isActive, sortOrder}` | Create |
| `adminUpdateResource` | mutation | admin | `{id, ...partial}` | Update |
| `adminDeleteResource` | mutation | admin | `{id}` | Delete |
| `adminGetSlots` | query | admin | `{startDate, endDate, treatmentId?}` | Slots for range |
| `adminCreateSlot` | mutation | admin | `{treatmentId, resourceId?, date, startTime, endTime, capacity, status}` | Create slot |
| `adminUpdateSlot` | mutation | admin | `{id, ...partial}` | Update |
| `adminDeleteSlot` | mutation | admin | `{id}` | Delete |
| `adminGetTemplates` | query | admin | `{treatmentId?}` | Schedule templates |
| `adminCreateTemplate` | mutation | admin | `{treatmentId, resourceId?, dayOfWeek, startTime, endTime, capacity, isActive}` | Create |
| `adminUpdateTemplate` | mutation | admin | `{id, ...partial}` | Update |
| `adminDeleteTemplate` | mutation | admin | `{id}` | Delete |
| `adminGenerateSlots` | mutation | admin | `{treatmentId, startDate, endDate}` | Generate from templates |
| `createSpaBooking` | mutation | public | `{treatmentId, slotId, date, time, persons, customerName, customerEmail, ...}` | Booking + Redsys |

### 2.14 suppliers.ts — suppliersRouter + settlementsRouter

**suppliersRouter:** `list`, `get`, `create`, `update`, `delete`, `getNextPeriods`, `generatePending`, `getProducts`

**settlementsRouter:** `list`, `get`, `preview`, `create`, `updateStatus`, `updateNotes`, `recalculate`

### 2.15 ticketing.ts — ticketingRouter

| Endpoint | Type | Access | Input | Description |
|----------|------|--------|-------|-------------|
| `listProducts` | query | admin | — | Ticketing products |
| `createProduct` | mutation | admin | `{name, provider?, linkedProductId?, ...}` | Create product |
| `updateProduct` | mutation | admin | `{id, ...partial}` | Update product |
| `deleteProduct` | mutation | admin | `{id}` | Delete |
| `listActiveProducts` | query | public | `{provider}` | Active products for public form |
| `uploadCouponAttachment` | mutation | public | `{filename, mimeType, base64Data}` | Upload coupon image |
| `createSubmission` | mutation | public | `{provider, customerName, email, coupons: [{couponCode, securityCode?, ...}], ...}` | Multi-coupon submission |
| `createManualRedemption` | mutation | admin | `{provider, customerName, email, couponCode, ...}` | Manual entry |
| `listCoupons` | query | admin | `{page, pageSize, provider?, statusOperational?, statusFinancial?, search?, ...}` | Coupon pipeline list |
| `getRedemption` | query | admin | `{id}` | Coupon detail |
| `updateCouponStatus` | mutation | admin | `{id, statusOperational?, statusFinancial?, notes?}` | Update status |
| `postponeCoupon` | mutation | admin | `{id, notes?}` | Postpone + email |
| `markIncidence` | mutation | admin | `{id, notes?}` | Mark incidence |
| `convertToReservation` | mutation | admin | `{id, platformProductId?, productRealId?, reservationDate, participants, ...}` | Convert to reservation |
| `rerunOcr` | mutation | admin | `{id}` | Re-run OCR |
| `getDashboardStats` | query | admin | — | Dashboard KPIs |
| `markAsRedeemed` | mutation | admin | `{id, ...}` | Mark redeemed |
| `deleteRedemption` | mutation | admin | `{id}` | Hard delete |
| `listPlatforms` | query | admin | — | All platforms |
| `createPlatform` | mutation | admin | `{name, slug, ...}` | Create platform |
| `updatePlatform` | mutation | admin | `{id, ...}` | Update |
| `togglePlatform` | mutation | admin | `{id, active}` | Toggle |
| `deletePlatform` | mutation | admin | `{id}` | Delete + products |
| `listPlatformProducts` | query | admin | `{platformId}` | Platform products |
| `createPlatformProduct` | mutation | admin | `{platformId, experienceId?, pvpPrice?, netPrice?, ...}` | Create |
| `updatePlatformProduct` | mutation | admin | `{id, ...}` | Update |
| `deletePlatformProduct` | mutation | admin | `{id}` | Delete |
| `getProductStats` | query | admin | `{platformId}` | Stats by product |

### 2.16 timeSlots.ts — timeSlotsRouter

| Endpoint | Type | Access | Input | Description |
|----------|------|--------|-------|-------------|
| `getByProduct` | query | public | `{productId}` | Active time slots |
| `getByProductAdmin` | query | protected | `{productId}` | All time slots |
| `create` | mutation | protected | `{productId, type, label, startTime?, endTime?, daysOfWeek?, capacity?, priceOverride?, sortOrder, active}` | Create |
| `update` | mutation | protected | `{id, ...partial}` | Update |
| `delete` | mutation | protected | `{id}` | Delete |
| `reorder` | mutation | protected | `{items: [{id, sortOrder}]}` | Reorder |
| `toggleProductTimeSlots` | mutation | protected | `{productId, enabled}` | Enable/disable |

### 2.17 tpv.ts — tpvRouter

| Endpoint | Type | Input | Description |
|----------|------|-------|-------------|
| `getRegisters` | query | — | Active cash registers |
| `getActiveSession` | query | `{registerId}` | Active open session |
| `openSession` | mutation | `{registerId, openingAmount, notes?}` | Open session |
| `closeSession` | mutation | `{sessionId, countedCash, notes?}` | Close with cash count |
| `getSessionSummary` | query | `{sessionId}` | Summary with sales/movements |
| `addCashMovement` | mutation | `{sessionId, type, amount, reason}` | Manual cash movement |
| `getCatalog` | query | — | TPV catalog (all presential products) |
| `createSale` | mutation | `{sessionId, customerName?, items: [{productType, productId, quantity, unitPrice, ...}], payments: [{method, amount, ...}]}` | Create sale (auto-creates reservation, transaction, REAV, sends emails) |
| `getSale` | query | `{saleId}` | Sale with items + payments |
| `getSessionSales` | query | `{sessionId}` | Sales for session |
| `getBackoffice` | query | `{page, limit}` | Paginated session history |
| `getBackofficeSalesByProduct` | query | `{sessionId?}` | Sales by product report |
| `sendTicketEmail` | mutation | `{ticketNumber, email}` | Send receipt email |

---

## 3. SERVER SERVICES (server/**/*.ts)

### 3.1 server/db.ts (Main DB service — ~2000 lines)
Central database service layer. CRUD for all major entities: users, experiences, categories, locations, leads, bookings, quotes, reservations, transactions, CMS, media files, packs, REAV expedients, clients. Dashboard metrics and accounting aggregation.

**72 exported functions** including: `getDb()`, `generateReservationNumber()`, `logActivity()`, `upsertUser`, `getUserByOpenId`, `getAllUsers`, `createInvitedUser`, `getFeaturedExperiences`, `getPublicExperiences`, `getExperienceBySlug`, `createLead`, `createBooking`, `createBookingFromReservation`, `getAllTransactions`, `getAccountingReports`, `getDashboardMetrics`, `getAllSlideshowItems`, `getAllExperiences`, `createExperience`, `updateExperience`, `deleteExperience`, `createReservation`, `getReservationByMerchantOrder`, `updateReservationPayment`, `getAllReservations`, `getAllPages`, `upsertPage`, `getPageBlocks`, `createReavExpedient`, `upsertClientFromReservation`, `postConfirmOperation`

### 3.2 server/db/reviewsDb.ts
Reviews database service for hotel and spa. Public reviews, rating stats, verified-booking checks, admin moderation, global stats.

**Exports:** `getPublicReviews`, `getReviewStats`, `getRatingsByEntityType`, `createReview`, `adminGetReviews`, `approveReview`, `rejectReview`, `deleteReview`, `replyToReview`, `adminGetReviewStats`

### 3.3 server/authGuard.ts
Express middleware protecting tRPC routes. Checks if procedure is in public route whitelist, returns 401 if no session.

**Export:** `createAuthGuardMiddleware(useLocalAuth)`

### 3.4 server/documentNumbers.ts
Sequential document numbering (quotes, invoices, reservations, TPV, coupons, settlements, cancellations, credit notes). Atomic UPDATE+SELECT, yearly reset, audit logging.

**Exports:** `generateDocumentNumber`, `getAllCounters`, `updateCounterPrefix`, `resetCounter`, `getDocumentNumberLogs`

### 3.5 server/emailTemplates.ts
Premium HTML email builder (19 functions). Resort/adventure aesthetic, Outlook-compatible, all Spanish.

**Exports:** `buildReservationConfirmHtml`, `buildReservationFailedHtml`, `buildRestaurantConfirmHtml`, `buildRestaurantPaymentLinkHtml`, `buildInviteHtml`, `buildPasswordResetHtml`, `buildBudgetRequestUserHtml`, `buildBudgetRequestAdminHtml`, `buildQuoteHtml`, `buildConfirmationHtml`, `buildQuotePdfHtml`, `buildTransferConfirmationHtml`, `buildCancellationReceivedHtml`, `buildCancellationRejectedHtml`, `buildCancellationAcceptedRefundHtml`, `buildCancellationAcceptedVoucherHtml`, `buildCancellationDocumentationHtml`, `buildTpvTicketHtml`, `buildCouponRedemptionReceivedHtml`, `buildPendingPaymentHtml`, `buildPendingPaymentReminderHtml`

### 3.6 server/galleryDb.ts
Public gallery CRUD. Sort ordering, active/inactive filtering, category extraction.

**Exports:** `getActiveGalleryItems`, `getGalleryCategories`, `getAllGalleryItems`, `createGalleryItem`, `updateGalleryItem`, `deleteGalleryItem`, `reorderGalleryItems`

### 3.7 server/ghl.ts
GoHighLevel CRM integration. Creates/updates contacts via REST API. Non-blocking.

**Exports:** `createGHLContact`, `getGHLTagsFromSource`

### 3.8 server/hotelDb.ts
Hotel module DB service. Room types, rate seasons, room rates (date/day/season priority), room blocks, availability search, calendar.

**Exports:** `getAllRoomTypes`, `getActiveRoomTypes`, `getRoomTypeBySlug`, `getRoomTypeById`, `createRoomType`, `updateRoomType`, `deleteRoomType`, `toggleRoomTypeActive`, `getAllRateSeasons`, `createRateSeason`, `updateRateSeason`, `deleteRateSeason`, `getRatesByRoomType`, `createRoomRate`, `updateRoomRate`, `deleteRoomRate`, `getRoomBlocksForRange`, `upsertRoomBlock`, `deleteRoomBlock`, `searchAvailability`, `getRoomCalendar`

### 3.9 server/inviteEmail.ts
Team member invitation emails.

**Export:** `sendInviteEmail`

### 3.10 server/localAuth.ts
Local email+password auth. JWT cookies (HS256, 30-day), Express router with login/logout/me.

**Exports:** `signSessionToken`, `verifySessionToken`, `getUserFromRequest`, `createLocalAuthRouter`, `COOKIE_NAME`

### 3.11 server/mailer.ts
Dual-strategy email: Brevo HTTP API primary, Nodemailer SMTP fallback.

**Exports:** `createTransporter`, `sendEmail`

### 3.12 server/passwordReset.ts
Password recovery. Secure tokens (48-byte hex, 1h expiry), bcrypt (12 rounds).

**Export:** `createPasswordResetRouter()` — 3 Express endpoints

### 3.13 server/pdfGenerator.ts
HTML-to-PDF via puppeteer-core with system Chromium. Singleton browser with auto-reconnect.

**Exports:** `htmlToPdf`, `closePdfBrowser`

### 3.14 server/quoteReminderJob.ts
Hourly cron: resends quote emails after 48h if not opened. Max 2 reminders.

**Export:** `startQuoteReminderJob`

### 3.15 server/reav.ts
REAV (Regimen Especial Agencias de Viaje) fiscal engine. Pure computation.

**Exports:** `validarConfiguracionREAV`, `calcularLineaREAV`, `calcularREAV`, `calcularREAVSimple`

### 3.16 server/redsys.ts
Redsys payment gateway. 3DES + HMAC-SHA256. Form data builder and IPN validator.

**Exports:** `getRedsysUrl`, `getMerchantCode`, `getMerchantKey`, `buildRedsysForm`, `validateRedsysNotification`, `generateMerchantOrder`

### 3.17 server/redsysRoutes.ts
Express router for Redsys IPN callbacks. Two endpoints: experience payments and restaurant deposits. On success: updates reservation, creates invoice, REAV expedient, sends emails.

**Export:** Express Router with POST `/api/redsys/notification` and POST `/api/redsys/restaurant-notification`

### 3.18 server/reservationEmails.ts
Multi-channel reservation notifications (Manus + Brevo/SMTP).

**Exports:** `sendReservationPaidNotifications`, `sendReservationFailedNotifications`

### 3.19 server/restaurantsDb.ts
Restaurant DB service. Full CRUD for restaurants, shifts, closures, bookings, logs, availability, dashboard, staff.

**Exports:** `getAllRestaurants`, `getRestaurantBySlug`, `createRestaurant`, `updateRestaurant`, `getShiftsByRestaurant`, `createShift`, `updateShift`, `deleteShift`, `getAvailability`, `createBooking`, `getBookingByLocator`, `getBookings`, `getBookingsByDate`, `getDashboardStats`, `assignStaff`, `removeStaff`, `getStaffByRestaurant`

### 3.20 server/settlementExportRoutes.ts
XLSX export for settlements. Two sheets: header + lines.

**Export:** Express Router with GET `/api/settlements/:id/export-excel`

### 3.21 server/spaDb.ts
Spa DB service. CRUD for categories, treatments, resources, slots, schedule templates. Slot auto-generation.

**Exports:** `getAllSpaCategories`, `getActiveSpaCategories`, `createSpaCategory`, `getAllSpaTreatments`, `getActiveSpaTreatments`, `getSpaTreatmentBySlug`, `createSpaTreatment`, `updateSpaTreatment`, `deleteSpaTreatment`, `getAllSpaResources`, `createSpaResource`, `getSpaSlotsByDate`, `createSpaSlot`, `getSpaScheduleTemplates`, `createSpaScheduleTemplate`, `generateSlotsFromTemplates`

### 3.22 server/storage.ts
File storage abstraction: Manus Forge proxy -> S3/MinIO -> local filesystem fallback.

**Exports:** `storagePut`, `storageGet`

### 3.23 server/uploadRoutes.ts
Express router for file uploads (multer). 5 endpoints: admin image, legacy media, public coupon, monitor photo, monitor doc.

### 3.24 server/_core/index.ts
Main entry point. Express setup: body parsers, rate limiters, auth mode, tRPC middleware, routes, Vite/static, DB migration runner, cron job boot.

### 3.25 server/_core/trpc.ts
tRPC init + 4 procedure levels: `publicProcedure`, `protectedProcedure`, `adminProcedure`, `adminrestProcedure`.

### 3.26 server/_core/env.ts
Environment variables: `appId`, `cookieSecret`, `databaseUrl`, `oAuthServerUrl`, `isProduction`, S3 config.

### 3.27 server/_core/llm.ts, map.ts, notification.ts, imageGeneration.ts, voiceTranscription.ts
Manus Forge clients for LLM (gemini-2.5-flash), Google Maps, notifications, image generation, and Whisper transcription.

### 3.28 server/adapters/*.ts
Standalone adapters (no Manus dependency): LLM (OpenAI API), Maps (Google direct), Storage (S3 direct), Notification (email), Image Generation (DALL-E).

### 3.29 shared/_core/errors.ts
HTTP error classes: `HttpError`, `BadRequestError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`

### 3.30 shared/const.ts
Constants: `COOKIE_NAME`, `ONE_YEAR_MS`, `AXIOS_TIMEOUT_MS`, auth error messages.

### 3.31 shared/types.ts
Re-exports all Drizzle schema types + error types.

---

## 4. DATABASE SCHEMA (drizzle/schema.ts) — 87 TABLES

### Table 1: `users`
| Column | Type | Constraints |
|--------|------|-------------|
| id | int | PK, autoincrement |
| openId | varchar(64) | NOT NULL, UNIQUE |
| name | text | nullable |
| email | varchar(320) | nullable |
| loginMethod | varchar(64) | nullable |
| role | enum("user","admin","monitor","agente","adminrest") | NOT NULL, default "user" |
| phone | varchar(32) | nullable |
| avatarUrl | text | nullable |
| isActive | boolean | NOT NULL, default true |
| passwordHash | text | nullable |
| inviteToken | varchar(128) | nullable |
| inviteTokenExpiry | timestamp | nullable |
| inviteAccepted | boolean | NOT NULL, default false |
| createdAt | timestamp | NOT NULL, default now() |
| updatedAt | timestamp | NOT NULL, default now(), onUpdateNow |
| lastSignedIn | timestamp | NOT NULL, default now() |

### Table 2: `site_settings`
| Column | Type | Constraints |
|--------|------|-------------|
| id | int | PK, autoincrement |
| key | varchar(128) | NOT NULL, UNIQUE |
| value | text | nullable |
| type | enum("text","json","image","boolean") | NOT NULL, default "text" |
| updatedAt | timestamp | NOT NULL, default now(), onUpdateNow |

### Table 3: `slideshow_items`
| Column | Type | Constraints |
|--------|------|-------------|
| id | int | PK, autoincrement |
| imageUrl | text | NOT NULL |
| badge | varchar(128) | nullable |
| title | varchar(256) | nullable |
| subtitle | text | nullable |
| description | text | nullable |
| ctaText | varchar(128) | nullable |
| ctaUrl | varchar(512) | nullable |
| reserveUrl | varchar(512) | nullable |
| sortOrder | int | NOT NULL, default 0 |
| isActive | boolean | NOT NULL, default true |
| createdAt | timestamp | NOT NULL, default now() |
| updatedAt | timestamp | NOT NULL, default now(), onUpdateNow |

### Table 4: `menu_items`
| Column | Type | Constraints |
|--------|------|-------------|
| id | int | PK, autoincrement |
| parentId | int | nullable |
| label | varchar(128) | NOT NULL |
| url | varchar(512) | nullable |
| target | enum("_self","_blank") | NOT NULL, default "_self" |
| sortOrder | int | NOT NULL, default 0 |
| isActive | boolean | NOT NULL, default true |
| menuZone | enum("header","footer") | NOT NULL, default "header" |
| createdAt/updatedAt | timestamp | standard |

### Table 5: `media_files`
id, filename, originalName, url, fileKey, mimeType, size, type (image/video/document), altText, uploadedBy, createdAt

### Table 6: `static_pages`
id, slug (UNIQUE), title, content, metaTitle, metaDescription, isPublished, createdAt, updatedAt

### Table 7: `locations`
id, slug (UNIQUE), name, description, imageUrl, address, latitude (decimal 10,8), longitude (decimal 11,8), isActive, sortOrder, createdAt, updatedAt

### Table 8: `categories`
id, slug (UNIQUE), name, description, imageUrl, image1, iconName, sortOrder, isActive, createdAt, updatedAt

### Table 9: `experiences`
id, slug (UNIQUE), title, shortDescription, description, categoryId (int), locationId (int), coverImageUrl, image1-4, gallery (json string[]), basePrice (decimal 10,2), currency, duration, minPersons, maxPersons, difficulty (enum), includes/excludes (json string[]), requirements, discountPercent, discountExpiresAt, fiscalRegime (enum reav/general_21/mixed), productType (enum 8 values), providerPercent, agencyMarginPercent, supplierId, supplierCommissionPercent, supplierCostType (enum), settlementFrequency (enum), isSettlable, isFeatured, isActive, isPublished, isPresentialSale, hasTimeSlots, sortOrder, metaTitle, metaDescription, createdAt, updatedAt

### Table 10: `experience_variants`
id, experienceId, name, description, priceModifier (decimal 10,2), priceType (enum fixed/percentage/per_person), options (json), isRequired, sortOrder, createdAt

### Table 11: `leads`
id, name, email, phone, company, message, experienceId, locationId, preferredDate, numberOfPersons, budget, status (enum), opportunityStatus (enum), priority (enum), lastContactAt, lostReason, seenAt, internalNotes (json array), assignedTo, ghlContactId, source, selectedCategory, selectedProduct, activitiesJson (json), numberOfAdults, numberOfChildren, createdAt, updatedAt

### Table 12: `quotes`
id, quoteNumber (UNIQUE), leadId, agentId, title, description, items (json array), subtotal, discount, tax, total, currency, validUntil, status (enum 11 values: borrador->facturado), sentAt, viewedAt, acceptedAt, conditions, redsysOrderId, invoiceNumber, invoicePdfUrl, transferProofUrl/Key, transferConfirmedAt/By, paymentMethod (enum), paymentLinkToken (UNIQUE), paymentLinkUrl, paidAt, notes, isAutoGenerated, reminderCount, lastReminderAt, ghlOpportunityId, createdAt, updatedAt

### Table 13: `crm_activity_log`
id, entityType (enum lead/quote/reservation/invoice), entityId, action, actorId, actorName, details (json), createdAt

### Table 14: `invoices`
id, invoiceNumber (UNIQUE), quoteId, reservationId, clientName/Email/Phone/Nif/Address, itemsJson (json), subtotal, taxRate, taxAmount, total, currency, pdfUrl/Key, status (enum 5 values), invoiceType (factura/abono), paymentMethod, paymentValidatedBy/At, transferProofUrl/Key, isAutomatic, creditNoteForId, creditNoteReason, sentAt, lastSentAt, sentCount, issuedAt, createdAt, updatedAt

### Table 15: `bookings`
id, bookingNumber (UNIQUE), experienceId, quoteId, clientName/Email/Phone, scheduledDate, endDate, numberOfPersons, totalAmount, status (enum 5), notes, internalNotes, reservationId, sourceChannel, createdAt, updatedAt

### Table 16: `booking_monitors`
id, bookingId, monitorId, role, notifiedAt, confirmedAt, createdAt

### Table 17: `daily_orders`
id, date, bookingId, title, description, meetingPoint, equipment (json), specialInstructions, status (enum), createdBy, createdAt, updatedAt

### Table 18: `transactions`
id, transactionNumber (UNIQUE), bookingId, quoteId, type (enum ingreso/reembolso/comision/gasto), amount, currency, paymentMethod, status, description, externalRef, processedAt, clientName/Email/Phone, productName, operativeCenter, sellerUserId/Name, saleChannel (enum), taxBase, taxAmount, reavMargin, fiscalRegime, tpvSaleId, reservationId, invoiceNumber, reservationRef, operationStatus, createdAt, updatedAt

### Table 19: `ghl_webhook_logs`
id, event, payload (json), status (enum), errorMessage, createdAt

### Table 20: `home_module_items`
id, moduleKey, experienceId, sortOrder, createdAt (bigint)

### Table 21: `reservations`
id, productId, productName, bookingDate, people, extrasJson, amountTotal (int), amountPaid (int), status (enum draft/pending_payment/paid/failed/cancelled), customerName/Email/Phone, merchantOrder (UNIQUE), redsysResponse, redsysDsResponse, notes, quoteId, quoteSource, invoiceId, invoiceNumber, paymentMethod, paymentValidatedBy/At, transferProofUrl, channel (enum 13 values), channelDetail, originSource, platformName, redemptionId, statusReservation (enum 6), statusPayment (enum 4), dateChangedReason, dateModified, changesLog (json), createdAt (bigint), updatedAt (bigint), paidAt (bigint), selectedTimeSlotId, selectedTime, reavExpedientId, reservationNumber (UNIQUE), cancellationRequestId

### Table 22: `product_time_slots`
id, productId, type (enum fixed/flexible/range), label, startTime, endTime, daysOfWeek, capacity, priceOverride, sortOrder, active, createdAt, updatedAt

### Table 23: `packs`
id, slug (UNIQUE), category (enum dia/escolar/empresa), title, subtitle, shortDescription, description, includes/excludes (json), schedule, note, image1-4, basePrice, priceLabel, duration, minPersons, maxPersons, targetAudience, badge, hasStay, isOnlinePurchase, discountPercent, fiscalRegime, productType, providerPercent, agencyMarginPercent, supplierId, supplierCommissionPercent, supplierCostType, settlementFrequency, isSettlable, isFeatured, isActive, isPresentialSale, sortOrder, metaTitle, metaDescription, createdAt, updatedAt

### Table 24: `pack_cross_sells`
id, packId, relatedPackId, sortOrder

### Table 25: `page_blocks`
id, pageSlug, blockType, sortOrder, data (json), isVisible, createdAt, updatedAt

### Table 26: `room_types`
id, slug (UNIQUE), name, shortDescription, description, coverImageUrl, image1-4, gallery (json), maxAdults, maxChildren, maxOccupancy, surfaceM2, amenities (json), basePrice, currency, totalUnits, internalTags (json), discountPercent, discountLabel, discountExpiresAt, fiscalRegime, productType, providerPercent, agencyMarginPercent, supplierId, supplierCommissionPercent, supplierCostType, settlementFrequency, isSettlable, isFeatured, isActive, isPresentialSale, sortOrder, metaTitle, metaDescription, createdAt, updatedAt

### Table 27: `room_rate_seasons`
id, name, startDate, endDate, isActive, sortOrder, createdAt

### Table 28: `room_rates`
id, roomTypeId, seasonId, dayOfWeek, specificDate, pricePerNight, currency, supplement, supplementLabel, isActive, createdAt, updatedAt

### Table 29: `room_blocks`
id, roomTypeId, date, availableUnits, reason, createdBy, createdAt, updatedAt

### Table 30: `spa_categories`
id, slug (UNIQUE), name, description, iconName, sortOrder, isActive, createdAt

### Table 31: `spa_treatments`
id, slug (UNIQUE), name, categoryId, shortDescription, description, benefits (json), coverImageUrl, image1, image2, gallery (json), durationMinutes, price, currency, maxPersons, cabinRequired, discountPercent, discountLabel, discountExpiresAt, fiscalRegime, productType, providerPercent, agencyMarginPercent, supplierId, supplierCommissionPercent, supplierCostType, settlementFrequency, isSettlable, isFeatured, isActive, isPresentialSale, sortOrder, metaTitle, metaDescription, createdAt, updatedAt

### Table 32: `spa_resources`
id, type (enum cabina/terapeuta), name, description, isActive, sortOrder, createdAt

### Table 33: `spa_slots`
id, treatmentId, resourceId, date, startTime, endTime, capacity, bookedCount, status (enum disponible/reservado/bloqueado), notes, createdAt, updatedAt

### Table 34: `spa_schedule_templates`
id, treatmentId, resourceId, dayOfWeek, startTime, endTime, capacity, isActive, createdAt

### Table 35: `reviews`
id, entityType (enum hotel/spa), entityId, authorName, authorEmail, rating, title, body, status (enum pending/approved/rejected), adminReply, adminRepliedAt, stayDate, verifiedBooking, createdAt, updatedAt

### Table 36: `password_reset_tokens`
id, userId, token (UNIQUE), expiresAt, usedAt, createdAt

### Table 37: `restaurants`
id, slug (UNIQUE), name, shortDesc, longDesc, cuisine, heroImage, galleryImages (json), menuUrl, phone, email, location, badge, depositPerGuest, maxGroupSize, minAdvanceHours, maxAdvanceDays, cancellationHours, cancellationPolicy, legalText, operativeEmail, acceptsOnlineBooking, isActive, sortOrder, createdAt, updatedAt

### Table 38: `restaurant_shifts`
id, restaurantId, name, startTime, endTime, maxCapacity, daysOfWeek (json), slotMinutes, isActive, sortOrder

### Table 39: `restaurant_closures`
id, restaurantId, date, shiftId, reason, createdAt

### Table 40: `restaurant_bookings`
id, locator (UNIQUE), restaurantId, shiftId, date, time, guests, depositAmount, guestName, guestLastName, guestEmail, guestPhone, highchair, allergies, birthday, specialRequests, accessibility, isVip, status (enum 7 values), cancellationReason, adminNotes, channel (enum web/manual/admin), createdByUserId, paymentStatus (enum), paymentTransactionId, paymentMethod, merchantOrder, paidAt, createdAt, updatedAt

### Table 41: `restaurant_booking_logs`
id, bookingId, action, details, userId, createdAt

### Table 42: `restaurant_staff`
id, userId, restaurantId, createdAt

### Table 43: `gallery_items`
id, imageUrl, fileKey, title, category, sortOrder, isActive, createdAt, updatedAt

### Table 44: `clients`
id, leadId, source, name, email (UNIQUE), phone, company, nif, address, city, postalCode, country, birthDate, notes, tags (json), isConverted, totalBookings, totalSpent, lastBookingAt, createdAt, updatedAt

### Table 45: `reav_expedients`
id, expedientNumber (UNIQUE), invoiceId, reservationId, clientId, agentId, serviceDescription, serviceDate, serviceEndDate, destination, numberOfPax, saleAmountTotal, providerCostEstimated/Real, agencyMarginEstimated/Real, reavTaxBase, reavTaxAmount, fiscalStatus (enum 5), operativeStatus (enum 4), clientName/Email/Phone/Dni/Address, channel (enum), sourceRef, tpvSaleId, quoteId, internalNotes, closedAt, createdAt, updatedAt

### Table 46: `reav_documents`
id, expedientId, side (client/provider), docType (enum 6), title, fileUrl, fileKey, mimeType, fileSize, notes, uploadedBy, createdAt

### Table 47: `reav_costs`
id, expedientId, description, providerName, providerNif, invoiceRef, invoiceDate, amount, currency, category (enum 7), isPaid, paidAt, includesVat, notes, createdBy, createdAt, updatedAt

### Table 48: `suppliers`
id, fiscalName, commercialName, nif, fiscalAddress, adminEmail, phone, contactPerson, iban, paymentMethod (enum 4), standardCommissionPercent, settlementFrequency (enum 6), settlementDayOfMonth, autoGenerateSettlements, internalNotes, status (enum activo/inactivo/bloqueado), createdAt, updatedAt

### Table 49: `supplier_settlements`
id, settlementNumber (UNIQUE), supplierId, periodFrom, periodTo, grossAmount, commissionAmount, netAmountProvider, currency, status (enum 6), pdfUrl, pdfKey, sentAt, paidAt, internalNotes, createdBy, createdAt, updatedAt

### Table 50: `settlement_lines`
id, settlementId, reservationId, invoiceId, productId, productName, serviceDate, paxCount, saleAmount, commissionPercent, commissionAmount, netAmountProvider, costType (enum 4), notes, createdAt

### Table 51: `settlement_documents`
id, settlementId, docType (enum 6), title, fileUrl, fileKey, notes, uploadedBy, createdAt

### Table 52: `settlement_status_log`
id, settlementId, fromStatus, toStatus, changedBy, changedByName, notes, createdAt

### Table 53: `cash_registers`
id, name, location, isActive, createdAt (bigint)

### Table 54: `cash_sessions`
id, registerId, cashierUserId, cashierName, openingAmount, closingAmount, countedCash, cashDifference, totalCash/Card/Bizum/Mixed/ManualOut/ManualIn, status (open/closed), notes, openedAt (bigint), closedAt (bigint)

### Table 55: `cash_movements`
id, sessionId, type (out/in), amount, reason, cashierName, createdAt (bigint)

### Table 56: `tpv_sales`
id, ticketNumber (UNIQUE), sessionId, reservationId, invoiceId, customerName/Email/Phone, subtotal, discountAmount, discountReason, total, status (enum 4), notes, serviceDate, createdAt (bigint), paidAt, taxBase, taxAmount, taxRate, reavMargin, reavCost, reavTax, fiscalSummary, saleChannel, sellerUserId/Name, operativeCenter

### Table 57: `tpv_sale_items`
id, saleId, productType (enum 6), productId, productName, quantity, unitPrice, discountPercent, subtotal, eventDate, eventTime, participants, notes, fiscalRegime, taxBase, taxAmount, taxRate, reavCost, reavMargin, reavTax

### Table 58: `tpv_sale_payments`
id, saleId, payerName, method (enum cash/card/bizum/other), amount, amountTendered, changeGiven, status (enum 4), reference, createdAt (bigint)

### Table 59: `discount_codes`
id, code (UNIQUE), name, description, discountType (percent/fixed), discountPercent, discountAmount, expiresAt, status (enum 3), maxUses, currentUses, observations, origin (manual/voucher), compensationVoucherId, clientEmail, clientName, createdAt, updatedAt

### Table 60: `discount_code_uses`
id, discountCodeId, code, discountPercent, discountAmount, originalAmount, finalAmount, channel (enum 4), reservationId, tpvSaleId, appliedByUserId, appliedAt

### Table 61: `lego_packs`
id, slug (UNIQUE), title, subtitle, shortDescription, description, coverImageUrl, image1-4, gallery (json), badge, priceLabel, categoryId, category (enum dia/escolar/empresa/estancia), targetAudience, availabilityMode (strict/flexible), discountPercent, discountExpiresAt, isActive, isPublished, isFeatured, isPresentialSale, isOnlineSale, sortOrder, metaTitle, metaDescription, createdAt, updatedAt

### Table 62: `lego_pack_lines`
id, legoPackId, sourceType (experience/pack), sourceId, internalName, groupLabel, sortOrder, isActive, isRequired, isOptional, isClientEditable, isClientVisible, defaultQuantity, isQuantityEditable, discountType (percent/fixed), discountValue, overridePrice, overridePriceLabel, frontendNote, createdAt, updatedAt

### Table 63: `lego_pack_snapshots`
id, legoPackId, legoPackTitle, operationType (enum 4), operationId, linesSnapshot (json), totalOriginal, totalDiscount, totalFinal, createdAt

### Table 64: `cost_centers`
id, name, description, active, createdAt

### Table 65: `expense_categories`
id, name, description, active, createdAt

### Table 66: `expense_suppliers`
id, name, fiscalName, vatNumber, address, email, phone, iban, active, createdAt, updatedAt

### Table 67: `expenses`
id, date, concept, amount, categoryId, supplierId, costCenterId, paymentMethod (enum 5), status (enum 3), reservationId, productId, notes, createdBy, createdAt, updatedAt

### Table 68: `expense_files`
id, expenseId, filePath, fileName, mimeType, uploadedAt

### Table 69: `recurring_expenses`
id, concept, amount, categoryId, costCenterId, supplierId, recurrenceType (monthly/weekly/yearly), nextExecutionDate, active, createdAt, updatedAt

### Table 70: `ticketing_products`
id, name, provider, linkedProductId, stationsAllowed (json), rules, commission, expectedPrice, active, createdAt, updatedAt

### Table 71: `coupon_redemptions`
id, provider, productTicketingId, productRealId, customerName, email, phone, couponCode, securityCode, attachmentUrl (mediumtext), requestedDate, station, participants, children, comments, statusOperational (enum 3), statusFinancial (enum 3), ocrConfidenceScore, ocrStatus, ocrRawData (json), duplicateFlag, duplicateNotes, realAmount, settlementJustificantUrl, settledAt, reservationId, platformProductId, settlementId, submissionId, originSource (enum 2), channelEntry (enum 6), createdByAdminId, adminUserId, notes, createdAt, updatedAt

### Table 72: `coupon_email_config`
id, autoSendCouponReceived, autoSendCouponValidated, autoSendInternalAlert, emailMode (per_submission/per_coupon), internalAlertEmail, updatedAt

### Table 73: `platforms`
id, name, slug (UNIQUE), logoUrl, active, settlementFrequency (enum 3), commissionPct, externalUrl, notes, createdAt, updatedAt

### Table 74: `platform_products`
id, platformId, experienceId, externalLink, externalProductName, pvpPrice, netPrice, expiresAt, active, createdAt, updatedAt

### Table 75: `platform_settlements`
id, platformId, periodLabel, periodFrom, periodTo, totalCoupons, totalAmount, status (enum 3), justificantUrl, invoiceRef, couponIds (json), netTotal, notes, emittedAt, paidAt, createdAt, updatedAt

### Table 76: `cancellation_requests`
id, fullName, email, phone, activityDate, reason (enum 5), reasonDetail, termsChecked, source, locator, originUrl, ipAddress, formLanguage, linkedReservationId, linkedQuoteId, linkedInvoiceId, originalAmount, refundableAmount, resolvedAmount, activityType, saleChannel, invoiceRef, operationalStatus (enum 7), resolutionStatus (enum 4), financialStatus (enum 7), compensationType (enum 4), voucherId, cancellationNumber, adminNotes, assignedUserId, closedAt, createdAt, updatedAt

### Table 77: `cancellation_logs`
id, requestId, actionType, oldStatus, newStatus, payload (json), adminUserId, adminUserName, createdAt

### Table 78: `compensation_vouchers`
id, requestId, code (UNIQUE), type (enum 3), activityId, activityName, value, currency, issuedAt, expiresAt, status (enum 5), pdfUrl, conditions, notes, sentAt, redeemedAt, createdAt, updatedAt

### Table 79: `email_templates`
id (varchar PK), name, description, category, recipient, subject, headerImageUrl, headerTitle, headerSubtitle, bodyHtml, footerText, ctaLabel, ctaUrl, variables, isCustom, isActive, createdAt, updatedAt

### Table 80: `pdf_templates`
id (varchar PK), name, description, category, logoUrl, headerColor, accentColor, companyName/Address/Phone/Email/Nif, footerText, legalText, showLogo, showWatermark, bodyHtml, variables, isCustom, isActive, createdAt, updatedAt

### Table 81: `monitors`
id, fullName, dni, phone, email, address, birthDate, photoUrl, photoKey, emergencyName/Relation/Phone, iban, ibanHolder, contractType (enum 5), contractStart/End, contractConditions, isActive, notes, userId, createdAt, updatedAt

### Table 82: `monitor_documents`
id, monitorId, type (enum 4), name, fileUrl, fileKey, uploadedBy, createdAt

### Table 83: `monitor_payroll`
id, monitorId, year, month, baseSalary, extras (json), totalAmount, status (pendiente/pagado), paidAt, notes, createdBy, createdAt, updatedAt

### Table 84: `reservation_operational`
id, reservationId (UNIQUE), reservationType (enum 5), clientConfirmed, clientConfirmedAt/By, arrivalTime, opNotes, monitorId, opStatus (enum 5), activitiesOpJson (json), updatedBy, updatedAt, createdAt

### Table 85: `document_counters`
id, documentType, year, currentNumber, prefix, updatedAt

### Table 86: `document_number_logs`
id, documentType, documentNumber, year, sequence, generatedAt, generatedBy, context

### Table 87: `pending_payments`
id, quoteId, reservationId, clientName, clientEmail, clientPhone, productName, amountCents, dueDate, reason, status (enum 4), paymentMethod, paymentNote, transferProofUrl, paidAt (bigint), reminderSentAt (bigint), createdBy, createdAt (bigint), updatedAt (bigint)

---

## 5. ADMIN PAGES (client/src/pages/admin/**)

| Route | Page | What it does | tRPC routers consumed |
|-------|------|--------------|----------------------|
| `/admin` | AdminDashboard | Main dashboard: KPIs (revenue, bookings, leads), alerts, today's status, sales channels, activities, funnel | `accounting`, `operations`, `cancellations`, `ticketing`, `settlements`, `tpv` |
| `/admin/numeracion` | DocumentNumbersAdmin | Document numbering series management (edit prefixes, reset counters, view logs) | `documentNumbers` |
| `/admin/plantillas-email` | EmailTemplatesManager | Email template CRUD with HTML editor, preview, test send | `emailTemplates` |
| `/admin/configuracion` | Settings | Site settings (company info, SEO, analytics, colors, feature toggles) | `cms` |
| `/admin/operaciones/resenas` | ReviewsManager | Hotel/spa review moderation (approve, reject, reply, delete) | `reviews` |
| `/admin/contabilidad` | AccountingDashboard | Revenue KPIs, charts (6-month, by category), recent transactions | `accounting` |
| `/admin/contabilidad/informes` | AccountingReports | BI reports with date range (daily sales, by channel, payment methods, fiscal) | `accounting` |
| `/admin/contabilidad/gastos` | ExpensesManager | Full expense CRUD with file attachments | `financial.expenses`, `financial.categories`, `financial.costCenters`, `financial.suppliers` |
| `/admin/contabilidad/gastos/categorias` | ExpenseCategoriesManager | Expense category CRUD | `financial.categories` |
| `/admin/contabilidad/gastos/proveedores` | ExpenseSuppliersManager | Expense supplier CRUD | `financial.suppliers` |
| `/admin/contabilidad/gastos/recurrentes` | RecurringExpensesManager | Recurring expenses CRUD with manual trigger | `financial.recurring`, `financial.categories`, `financial.costCenters`, `financial.suppliers` |
| `/admin/contabilidad/cuenta-resultados` | ProfitLossReport | P&L report with CSV export | `financial.profitLoss`, `financial.categories`, `financial.costCenters` |
| `/admin/contabilidad/transacciones` | TransactionsList | Paginated transaction ledger with advanced filters | `accounting` |
| `/admin/cms/galeria` | GalleryManager | Photo gallery CRUD with drag & drop | `gallery` |
| `/admin/cms/modulos-home` | HomeModulesManager | Homepage section product selector | `products`, `homeModules` |
| `/admin/cms/menus` | MenusManager | Navigation menu CRUD (header/footer) | `cms` |
| `/admin/cms/multimedia` | MultimediaManager | Media file browser | `cms` |
| `/admin/cms/paginas` | PagesManager | CMS pages with block editor (hero, text, image, CTA, FAQ, video, gallery) | `cms` |
| `/admin/cms`, `/admin/cms/slideshow` | SlideshowManager | Homepage slideshow CRUD | `cms` |
| `/admin/crm` | CRMDashboard | Full CRM hub: tabs for Leads, Quotes, Reservations, Invoices, Anulaciones, Bonos, Pagos Pendientes | `crm.*`, `cancellations`, `discounts` |
| `/admin/crm/clientes` | ClientsManager | Client database with expandable detail rows | `crm.clients` |
| `/admin/fiscal`, `/admin/fiscal/reav` | ReavManager | REAV expedient management (costs, documents, recalculate, export) | `reav` |
| `/admin/hotel` | HotelManager | Room types, calendar, rate seasons, availability blocks | `hotel` |
| `/admin/marketing`, `/admin/marketing/cupones` | CuponesManager | Coupon pipeline (dashboard, coupons list, convert, settlements) | `ticketing` |
| `/admin/marketing/plataformas` | PlatformsManager | External platforms CRUD, platform products, settlements | `ticketing` |
| `/admin/marketing/descuentos` | DiscountCodesManager | Discount code CRUD with usage history | `discounts` |
| `/admin/operaciones`, `/admin/operaciones/calendario` | CalendarView | Calendar of operational events | `operations.calendar` |
| `/admin/operaciones/reservas` | BookingsList | Activity bookings list with status update | `bookings` |
| `/admin/operaciones/actividades` | DailyActivities | Day view of activities (assign monitors, confirm arrivals) | `operations.activities`, `operations.monitors` |
| `/admin/operaciones/monitores` | MonitorsManager | Staff CRUD (documents, payroll, detail panel) | `operations.monitors` |
| `/admin/productos`, `/admin/productos/experiencias` | ExperiencesManager | Experience CRUD (images, pricing, category/location) | `products` |
| `/admin/productos/categorias` | CategoriesManager | Category CRUD | `products` |
| `/admin/productos/ubicaciones` | LocationsManager | Location CRUD | `products` |
| `/admin/productos/variantes` | VariantsManager | Variant CRUD by experience | `products` |
| `/admin/productos/lego-packs` | LegoPacksManager | Lego pack builder (lines, pricing) | `legoPacks`, `products` |
| `/admin/restaurantes` | RestaurantsManager | Restaurant bookings, config, shifts | `restaurants` |
| `/admin/restaurantes/calendario` | GlobalCalendar | Global calendar across restaurants | `restaurants` |
| `/admin/spa` | SpaManager | Treatments, categories, schedule templates, slots | `spa` |
| `/admin/suppliers` | SuppliersManager | Supplier CRUD, products, settlement generator | `suppliers` |
| `/admin/settlements` | SettlementsManager | Settlement management (create, status, documents, PDF, email) | `settlements`, `suppliers` |
| `/admin/tpv` | TpvScreen | Full POS terminal (catalog, cart, payments, sale creation) | `tpv`, `discounts`, `timeSlots` |
| `/admin/tpv/cajas`, `/admin/tpv/backoffice` | TpvBackoffice | Session history, details, today's reservations | `tpv`, `accounting` |
| `/admin/usuarios` | UsersManager | User CRUD, roles, invites, restaurant staff assignments | `admin`, `restaurants` |

---

## 6. PUBLIC PAGES (client/src/pages/*)

| Route | Page | Purpose | tRPC routers consumed |
|-------|------|---------|----------------------|
| `/` | Home | Homepage: slideshow, featured experiences, packs, restaurants, budget form | `public`, `homeModules`, `restaurants`, `legoPacks` |
| `/experiencias` | Experiences | Product catalog listing with category filter | `public` |
| `/experiencias/:slug` | ExperienceDetail | Product detail (images, pricing, variants, time slots, lead form) | `public`, `timeSlots` |
| `/hotel` | Hotel | Room type listing with availability search | `hotel` |
| `/hotel/:slug` | HotelRoom | Room detail with calendar and booking form | `hotel` |
| `/spa` | Spa | Treatment categories and listing | `spa` |
| `/spa/:slug` | SpaDetail | Treatment detail with slot picker and booking form | `spa` |
| `/restaurantes` | Restaurantes | Restaurant listing | `restaurants` |
| `/restaurantes/:slug` | RestauranteDetail | Restaurant detail with hours | `restaurants` |
| `/restaurantes/:slug/reservar` | RestaurantBooking | Restaurant booking form (date/time/guests) | `restaurants` |
| `/restaurantes/reserva-ok` | RestauranteReservaOk | Restaurant booking confirmation | `restaurants` |
| `/restaurantes/reserva-ko` | RestauranteReservaKo | Restaurant booking failure | `restaurants` |
| `/lego-packs` | LegoPacksHome | Packs landing with category nav | — |
| `/lego-packs/:category` | LegoPacksList | Packs by category | `legoPacks` |
| `/lego-packs/detalle/:slug` | LegoPackDetail | Individual pack detail | `legoPacks` |
| `/presupuesto` | BudgetRequest | Multi-step budget request form | `public`, `legoPacks` |
| `/presupuesto/:token` | QuoteAcceptance | Client quote acceptance/rejection via unique link | `crm.quotes` |
| `/checkout` | Checkout | Cart checkout with promo codes + Redsys | `discounts`, `reservations` |
| `/reserva/ok` | ReservaOk | Payment success confirmation | `reservations` |
| `/reserva/error` | ReservaError | Payment failure page | `reservations` |
| `/canjear-cupon` | CanjearCupon | Public coupon redemption form (with OCR) | `ticketing` |
| `/verificar-bono` | VerificarBono | Voucher code verification | `discounts` |
| `/solicitar-anulacion` | SolicitarAnulacion | Public cancellation request form | `cancellations` |
| `/contacto` | Contact | Contact form (submits as lead) | `public` |
| `/galeria` | Gallery | Public photo gallery | `gallery` |
| `/ubicaciones` | Locations | Locations/stations page | — |
| `/pagina/:slug` | DynamicPage | CMS-built pages with blocks | `public` |
| `/login` | Login | Admin login | `auth` |
| `/recuperar-contrasena` | ForgotPassword | Password recovery | — (direct fetch) |
| `/nueva-contrasena` | ResetPassword | Password reset form | — (direct fetch) |
| `/establecer-contrasena` | SetPassword | Invited user password setup | `public` |
| `/condiciones-cancelacion` | CondicionesCancelacion | Static cancellation policy | — |
| `/terminos` | TerminosCondiciones | Static terms & conditions | — |
| `/privacidad` | PoliticaPrivacidad | Static privacy policy | — |
| `/cookies` | PoliticaCookies | Static cookie policy | — |
| `/404` | NotFound | 404 page | — |

---

## 7. FUNCTIONAL MODULES DETECTED

Based on actual code (routers + services + schema + pages grouped together):

### 7.1 CRM (Leads → Quotes → Reservations → Invoices)
- **Router:** `crm.ts` (leads, quotes, reservations, invoices, clients, dashboard, pendingPayments, timeline)
- **Schema:** `leads`, `quotes`, `invoices`, `clients`, `crm_activity_log`, `pending_payments`
- **Services:** `db.ts` (lead/booking/reservation/quote/invoice CRUD), `reservationEmails.ts`, `quoteReminderJob.ts`, `ghl.ts`
- **Pages:** CRMDashboard, ClientsManager, QuoteAcceptance

### 7.2 Catalog (Experiences + Categories + Locations + Variants + Packs)
- **Router:** inline `products` in routers.ts, `timeSlots.ts`
- **Schema:** `experiences`, `experience_variants`, `categories`, `locations`, `packs`, `pack_cross_sells`, `product_time_slots`
- **Services:** `db.ts` (experience/category/location/variant/pack CRUD)
- **Pages:** ExperiencesManager, CategoriesManager, LocationsManager, VariantsManager, Experiences, ExperienceDetail

### 7.3 Lego Packs (Composable packs)
- **Router:** `legoPacks.ts`
- **Schema:** `lego_packs`, `lego_pack_lines`, `lego_pack_snapshots`
- **Pages:** LegoPacksManager, LegoPacksHome, LegoPacksList, LegoPackDetail

### 7.4 Hotel
- **Router:** `hotel.ts`
- **Schema:** `room_types`, `room_rate_seasons`, `room_rates`, `room_blocks`
- **Services:** `hotelDb.ts`
- **Pages:** HotelManager, Hotel, HotelRoom

### 7.5 Spa
- **Router:** `spa.ts`
- **Schema:** `spa_categories`, `spa_treatments`, `spa_resources`, `spa_slots`, `spa_schedule_templates`
- **Services:** `spaDb.ts`
- **Pages:** SpaManager, Spa, SpaDetail

### 7.6 Restaurant
- **Router:** `restaurants.ts`
- **Schema:** `restaurants`, `restaurant_shifts`, `restaurant_closures`, `restaurant_bookings`, `restaurant_booking_logs`, `restaurant_staff`
- **Services:** `restaurantsDb.ts`
- **Pages:** RestaurantsManager, GlobalCalendar, Restaurantes, RestauranteDetail, RestaurantBooking, RestauranteReservaOk/Ko

### 7.7 Finance / Accounting
- **Router:** `expenses.ts` (financial.costCenters, categories, suppliers, expenses, recurring, profitLoss) + inline accounting routes
- **Schema:** `cost_centers`, `expense_categories`, `expense_suppliers`, `expenses`, `expense_files`, `recurring_expenses`, `transactions`
- **Services:** `db.ts` (transactions, dashboard metrics, accounting reports)
- **Pages:** AccountingDashboard, AccountingReports, ExpensesManager, ExpenseCategoriesManager, ExpenseSuppliersManager, RecurringExpensesManager, ProfitLossReport, TransactionsList

### 7.8 Suppliers + Settlements
- **Router:** `suppliers.ts` (suppliersRouter + settlementsRouter)
- **Schema:** `suppliers`, `supplier_settlements`, `settlement_lines`, `settlement_documents`, `settlement_status_log`
- **Services:** `settlementExportRoutes.ts`
- **Pages:** SuppliersManager, SuppliersDashboard, SettlementsManager

### 7.9 TPV (Point of Sale)
- **Router:** `tpv.ts`
- **Schema:** `cash_registers`, `cash_sessions`, `cash_movements`, `tpv_sales`, `tpv_sale_items`, `tpv_sale_payments`
- **Pages:** TpvScreen, TpvBackoffice, TpvOpenSession, TpvCloseSession, TpvCashMovement, TpvSplitPayment, TpvTicket

### 7.10 Ticketing / Coupons (Groupon, etc.)
- **Router:** `ticketing.ts`
- **Schema:** `ticketing_products`, `coupon_redemptions`, `coupon_email_config`, `platforms`, `platform_products`, `platform_settlements`
- **Pages:** CuponesManager, PlatformsManager, CanjearCupon

### 7.11 Cancellations
- **Router:** `cancellations.ts`
- **Schema:** `cancellation_requests`, `cancellation_logs`, `compensation_vouchers`
- **Pages:** CancellationsManager, CancellationDetailModal, SolicitarAnulacion

### 7.12 Discounts
- **Router:** `discounts.ts`
- **Schema:** `discount_codes`, `discount_code_uses`
- **Pages:** DiscountCodesManager, Checkout, VerificarBono

### 7.13 Reviews
- **Router:** `reviews.ts`
- **Schema:** `reviews`
- **Services:** `db/reviewsDb.ts`
- **Pages:** ReviewsManager

### 7.14 REAV (Fiscal / Tax Regime)
- **Schema:** `reav_expedients`, `reav_documents`, `reav_costs`
- **Services:** `reav.ts` (calculation engine)
- **Pages:** ReavManager

### 7.15 Operations (Calendar + Monitors + Daily Orders)
- **Router:** `operations.ts`
- **Schema:** `bookings`, `booking_monitors`, `daily_orders`, `monitors`, `monitor_documents`, `monitor_payroll`, `reservation_operational`
- **Pages:** CalendarView, DailyActivities, DailyOrders, MonitorsManager, BookingsList

### 7.16 CMS (Slideshow + Menus + Pages + Gallery + Media + Settings)
- **Router:** inline `cms` in routers.ts + gallery routes
- **Schema:** `site_settings`, `slideshow_items`, `menu_items`, `static_pages`, `page_blocks`, `media_files`, `gallery_items`, `home_module_items`
- **Services:** `galleryDb.ts`
- **Pages:** SlideshowManager, MenusManager, PagesManager, MultimediaManager, GalleryManager, HomeModulesManager, Settings

### 7.17 Auth + Users
- **Router:** inline `auth` in routers.ts + admin user routes
- **Schema:** `users`, `password_reset_tokens`
- **Services:** `localAuth.ts`, `authGuard.ts`, `passwordReset.ts`, `inviteEmail.ts`
- **Pages:** Login, ForgotPassword, ResetPassword, SetPassword, UsersManager

### 7.18 Payments (Redsys)
- **Services:** `redsys.ts`, `redsysRoutes.ts`
- Cross-cuts: Hotel, Restaurant, CRM, TPV

### 7.19 Email + PDF Templates
- **Router:** `emailTemplatesRouter.ts`, `pdfTemplatesRouter.ts`
- **Schema:** `email_templates`, `pdf_templates`
- **Services:** `emailTemplates.ts` (19 builder functions), `pdfGenerator.ts`
- **Pages:** EmailTemplatesManager, PdfTemplatesManager

### 7.20 Document Numbering
- **Schema:** `document_counters`, `document_number_logs`
- **Services:** `documentNumbers.ts`
- **Pages:** DocumentNumbersAdmin

---

## 8. MODULE DEPENDENCIES

```
Auth → (all modules require auth)

Catalog ← CRM (quotes reference products)
Catalog ← Lego Packs (lines reference experiences/packs)
Catalog ← Operations (bookings reference experiences)
Catalog ← TPV (sales reference products)
Catalog ← Ticketing (redemptions link to products)
Catalog ← Suppliers (products linked to suppliers)

CRM ← Redsys (payment confirmation creates reservations)
CRM → Invoices → Finance (transactions created from invoices)
CRM → Bookings → Operations (operational booking from reservation)
CRM → REAV (expedients created from reservations)
CRM → GHL (contacts synced on lead creation)
CRM → Clients (upserted from reservations)

Hotel ← Redsys (hotel booking payment)
Hotel ← Reviews (room type reviews)

Spa ← Redsys (spa booking payment)
Spa ← Reviews (treatment reviews)

Restaurant ← Redsys (deposit payment)
Restaurant ← Operations (calendar integration)

Suppliers ← Catalog (products linked to suppliers)
Suppliers → Settlements → Finance (settlement amounts)

TPV → Reservations (sale creates reservation)
TPV → Transactions (sale creates transaction)
TPV → REAV (sale creates expedient if fiscal regime)
TPV → Invoices (sale creates invoice)

Ticketing → Reservations (coupon conversion creates reservation)
Ticketing → Platforms → Settlements

Cancellations → Reservations (links to reservation)
Cancellations → Compensation Vouchers → Discount Codes

Discounts ← TPV (validation at sale)
Discounts ← Checkout (online validation)
Discounts ← CRM (validation in quotes)

Document Numbering ← CRM, Finance, TPV, Ticketing, Cancellations (all generate document numbers)

Email/PDF Templates ← CRM, Cancellations, TPV, Restaurant (all send emails/generate PDFs)
```

---

## 9. CONFIGURATION FILES

### 9.1 drizzle.config.ts
- **Dialect:** MySQL
- **Schema:** `./drizzle/schema.ts`
- **Output:** `./drizzle`
- **Connection:** `DATABASE_URL` from env

### 9.2 docker-compose.yml
Three services:
- **db** — MySQL 8.0, port 3306, database `nayade_db`
- **minio** — MinIO (S3-compatible), ports 9000 + 9001
- **app** — Builds from Dockerfile, port 3000, depends on db healthy

### 9.3 env.example.txt

| Group | Variables |
|-------|-----------|
| Database | `DATABASE_URL` (MySQL) |
| Auth | `LOCAL_AUTH`, `JWT_SECRET` |
| Server | `PORT`, `NODE_ENV` |
| Redsys | `REDSYS_ENVIRONMENT`, `REDSYS_MERCHANT_CODE`, `REDSYS_MERCHANT_KEY`, `REDSYS_MERCHANT_TERMINAL` |
| Email | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `NOTIFY_EMAIL`, `ADMIN_EMAIL` |
| S3 | `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_PUBLIC_URL`, `LOCAL_STORAGE_PATH` |
| LLM | `LLM_API_URL`, `LLM_API_KEY`, `LLM_MODEL` |
| Image Gen | `IMAGE_API_URL`, `IMAGE_API_KEY`, `IMAGE_MODEL` |
| Google Maps | `GOOGLE_MAPS_API_KEY`, `VITE_GOOGLE_MAPS_API_KEY` |
| Frontend | `VITE_APP_TITLE` |
| Manus | `VITE_APP_ID`, `OAUTH_SERVER_URL`, various forge/owner vars |

### 9.4 package.json

- **Name:** `nayade_experiences_platform`
- **Version:** 1.0.0
- **Type:** ESM
- **Package Manager:** pnpm 10.4.1

**Key scripts:**

| Script | Command |
|--------|---------|
| `dev` | `cross-env NODE_ENV=development tsx watch server/_core/index.ts` |
| `build` | `vite build && esbuild server/_core/index.ts ...` |
| `start` | `cross-env NODE_ENV=production node dist/index.js` |
| `check` | `tsc --noEmit` |
| `test` | `vitest run` |
| `test:e2e` | `playwright test` |
| `db:push` | `drizzle-kit generate && drizzle-kit migrate` |
| `seed` | `node scripts/import-seed.mjs` |

**Key dependencies (66 total):**
`@aws-sdk/client-s3`, `@tanstack/react-query`, `@trpc/client`, `@trpc/react-query`, `@trpc/server`, `axios`, `bcryptjs`, `date-fns`, `drizzle-orm`, `express`, `express-rate-limit`, `jose`, `lucide-react`, `multer`, `mysql2`, `node-cron`, `nodemailer`, `puppeteer-core`, `react`, `react-dom`, `react-hook-form`, `recharts`, `superjson`, `wouter`, `xlsx`, `zod`

**Key devDependencies:**
`@playwright/test`, `drizzle-kit`, `esbuild`, `typescript` (5.9.3), `vite`, `vitest`

### 9.5 tsconfig.json
- **Strict mode:** true
- **Module:** ESNext, **moduleResolution:** bundler
- **Path aliases:** `@/*` → `./client/src/*`, `@shared/*` → `./shared/*`

### 9.6 vite.config.ts
- **Plugins:** react, tailwindcss, manusRuntime
- **Client root:** `./client`
- **Build output:** `dist/public`
- **Aliases:** `@` → `client/src`, `@shared` → `shared`

### 9.7 components.json (shadcn)
- **Style:** new-york
- **RSC:** false
- **Tailwind CSS:** `client/src/index.css`
- **Base color:** neutral

---

## SUMMARY

| Metric | Count |
|--------|-------|
| Database tables | 87 |
| tRPC procedures | ~250+ |
| Router files | 17 (16 in routers/ + 1 routers.ts aggregator) |
| Server service files | 25 (excl. tests) |
| Admin pages | 53 |
| Public pages | 37 |
| Functional modules | 20 |
| Dependencies | 66 + 18 dev |
| Migrations | 44 |
| Seed data | 707 KB (30+ tables seeded) |
