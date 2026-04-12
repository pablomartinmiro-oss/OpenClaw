# PORT-17: Cancellations Enhancement

## Decision: 🔧 Adaptar | Complejidad: L

## Estado actual OpenClaw

Cancellations module con: CancellationRequest (reservationId, quoteId, reason, status, resolution, operationalStatus, financialStatus, refundAmount, creditNoteNumber). CancellationLog. CompensationVoucher. API CRUD en `/api/cancellations`. Admin UI con resolve endpoint.

## Que aporta Nayade

1. **CancellationRequest enriquecido**: fullName, email, phone, activityDate, reason (5 enum: personal, weather, health, schedule, other), reasonDetail, termsChecked, locator, originUrl, ipAddress, formLanguage, linkedReservationId/QuoteId/InvoiceId, originalAmount, refundableAmount, resolvedAmount, activityType, saleChannel, invoiceRef, compensationType (4: refund/voucher/partial/none), voucherId, cancellationNumber (secuencial), assignedUserId, closedAt
2. **Status workflow rico**: operationalStatus (7: recibida, en_revision, pendiente_documentacion, verificada, en_proceso, completada, rechazada), resolutionStatus (4: pending, accepted, partially, rejected), financialStatus (7: pendiente_calculo, calculado, pendiente_devolucion, devuelto, bono_emitido, sin_devolucion, incidencia)
3. **15 mutation endpoints**: reject, accept (con refund o voucher), request documentation, mark incidence, update statuses, mark refund executed, mark voucher sent, close, upload voucher PDF
4. **Impact preview**: `getImpact` — muestra que reservas/facturas se veran afectadas
5. **Badge counters**: pendientes + incidencias para sidebar
6. **Public form**: formulario publico de solicitud de anulacion
7. **Manual creation**: admin puede crear solicitud manualmente
8. **Voucher auto-generation**: crea CompensationVoucher + DiscountCode automaticamente

## Archivos fuente Nayade

| Archivo | Proposito |
|---------|-----------|
| `server/routers/cancellations.ts` | 18 endpoints: createRequest (public), listRequests, getRequest, updateNotes, assignUser, rejectRequest, acceptRequest, requestDocumentation, markIncidence, updateOperationalStatus, markRefundExecuted, markVoucherSent, closeRequest, updateFinancialStatus, deleteRequest, getCounters, uploadVoucherPdf, getImpact, createManualRequest |
| `drizzle/schema.ts` → `cancellation_requests`, `cancellation_logs`, `compensation_vouchers` | Schema |
| `client/src/pages/admin/crm/CancellationsManager.tsx` | Admin list |
| `client/src/pages/admin/crm/CancellationDetailModal.tsx` | Detail modal |
| `client/src/pages/SolicitarAnulacion.tsx` | Public form |

## Tablas Drizzle → Prisma

No tablas nuevas. Enriquecer CancellationRequest:

```prisma
// CancellationRequest — add:
fullName              String?
email                 String?
phone                 String?
activityDate          DateTime?
reasonDetail          String?
termsChecked          Boolean   @default(false)
locator               String?
originUrl             String?
ipAddress             String?
formLanguage          String    @default("es")
linkedInvoiceId       String?
originalAmount        Float?
refundableAmount      Float?
resolvedAmount        Float?
activityType          String?
saleChannel           String?
invoiceRef            String?
compensationType      String?   // "refund" | "voucher" | "partial" | "none"
voucherId             String?
cancellationNumber    String?   // "ANU-2026-0001" (from DocumentNumbering)
assignedUserId        String?
```

## Endpoints tRPC → Next.js API Routes

| Nayade tRPC | OpenClaw API | Estado |
|-------------|-------------|--------|
| `cancellations.listRequests` | `GET /api/cancellations` | ✅ Existe — enriquecer filtros |
| `cancellations.getRequest` | `GET /api/cancellations/[id]` | ✅ Existe |
| `cancellations.createRequest` (public) | `POST /api/cancellations` | ✅ Existe — enriquecer |
| `cancellations.createManualRequest` | `POST /api/cancellations/manual` | Nuevo |
| `cancellations.rejectRequest` | `POST /api/cancellations/[id]/reject` | Nuevo |
| `cancellations.acceptRequest` | `POST /api/cancellations/[id]/accept` | Nuevo |
| `cancellations.requestDocumentation` | `POST /api/cancellations/[id]/request-docs` | Nuevo |
| `cancellations.markIncidence` | `POST /api/cancellations/[id]/incidence` | Nuevo |
| `cancellations.updateOperationalStatus` | `PATCH /api/cancellations/[id]/operational-status` | Nuevo |
| `cancellations.updateFinancialStatus` | `PATCH /api/cancellations/[id]/financial-status` | Nuevo |
| `cancellations.markRefundExecuted` | `POST /api/cancellations/[id]/refund-executed` | Nuevo |
| `cancellations.markVoucherSent` | `POST /api/cancellations/[id]/voucher-sent` | Nuevo |
| `cancellations.closeRequest` | `POST /api/cancellations/[id]/close` | Nuevo |
| `cancellations.getCounters` | `GET /api/cancellations/counters` | Nuevo |
| `cancellations.getImpact` | `GET /api/cancellations/[id]/impact` | Nuevo |
| `cancellations.uploadVoucherPdf` | `POST /api/cancellations/[id]/voucher-pdf` | Nuevo |
| `cancellations.assignUser` | `PATCH /api/cancellations/[id]` | ✅ Existe |
| `cancellations.updateNotes` | `PATCH /api/cancellations/[id]` | ✅ Existe |
| `cancellations.deleteRequest` | `DELETE /api/cancellations/[id]` | ✅ Existe |

## Paginas a portar

| Nayade | OpenClaw | Estado |
|--------|----------|--------|
| `CancellationsManager.tsx` | `src/app/(dashboard)/cancellations/` | ✅ Existe — enriquecer |
| `CancellationDetailModal.tsx` | `src/app/(dashboard)/cancellations/_components/` | ✅ Existe — enriquecer |
| `SolicitarAnulacion.tsx` | Public page | Nuevo |

## PR Checklist

- [ ] Prisma migration: enrich CancellationRequest with all new fields
- [ ] API: 11 new mutation endpoints for workflow actions
- [ ] API: `GET /api/cancellations/counters` — badge counters
- [ ] API: `GET /api/cancellations/[id]/impact` — preview propagation
- [ ] API: `POST /api/cancellations/manual` — admin manual creation
- [ ] Validation: cancellation workflow schemas
- [ ] Service: auto-generate CompensationVoucher + DiscountCode on acceptance
- [ ] Service: auto-generate cancellationNumber via DocumentNumbering (PORT-01)
- [ ] UI: enrich cancellation list with status filters and KPI badges
- [ ] UI: enrich detail modal with workflow action buttons
- [ ] UI: impact preview before acceptance
- [ ] Public: cancellation request form (standalone page)
- [ ] Email: cancellation received, rejected, accepted (refund/voucher), docs requested (PORT-02)
