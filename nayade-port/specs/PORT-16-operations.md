# PORT-16: Operations Enhancement

## Decision: 🔧 Adaptar | Complejidad: L

## Estado actual OpenClaw

Operations: ActivityBooking, BookingMonitor, DailyOrder. Tambien tiene Instructor module completo (Instructor, InstructorAvailability, InstructorTimeEntry, InstructorAssignment) y Planning Engine (Participant, OperationalUnit, GroupCell, ClassCheckIn, Incident, FreeDayRequest, Diploma, DisciplinaryRecord). API extenso en `/api/booking`, `/api/instructors`, `/api/planning`.

## Que aporta Nayade

1. **Operations Calendar**: vista unificada de eventos (actividades + restaurante) en rango de fechas
2. **Daily Activities**: vista diaria de actividades con asignacion de monitores, confirmacion llegada, cancelacion
3. **Daily Orders operational**: updateOperational con clientConfirmed, arrivalTime, opNotes, monitorId, opStatus
4. **Monitor management** completo: Nayade `monitors` = ficha personal (DNI, foto, emergencia, IBAN, contrato), documents (4 tipos), payroll por mes
5. **Reservation Operational**: tabla separada para datos operativos de cada reserva (no mezclar con datos de venta)
6. **Dashboard stats** por fecha

**Nota:** OpenClaw ya tiene un sistema de Instructors/Planning MUCHO mas avanzado que los "monitors" de Nayade. Los monitores de Nayade son basicamente la misma entidad que los Instructors de OpenClaw. NO portamos el modelo Monitor — usamos Instructor.

## Archivos fuente Nayade

| Archivo | Proposito |
|---------|-----------|
| `server/routers/operations.ts` | operations.monitors (10 endpoints), operations.calendar (1), operations.dailyOrders (3), operations.activities (6) |
| `drizzle/schema.ts` → `monitors`, `monitor_documents`, `monitor_payroll`, `reservation_operational` | Schema |
| `client/src/pages/admin/operations/CalendarView.tsx` | Calendar UI |
| `client/src/pages/admin/operations/DailyActivities.tsx` | Daily view |
| `client/src/pages/admin/operations/DailyOrders.tsx` | Daily orders |
| `client/src/pages/admin/operations/MonitorsManager.tsx` | Monitor CRUD |
| `client/src/pages/admin/operations/BookingsList.tsx` | Bookings list |

## Tablas Drizzle → Prisma

### Modelo nuevo

```prisma
model ReservationOperational {
  id                String    @id @default(cuid())
  tenantId          String
  reservationId     String    @unique
  reservationType   String?   // "experiencia" | "hotel" | "spa" | "restaurante" | "pack"
  clientConfirmed   Boolean   @default(false)
  clientConfirmedAt DateTime?
  clientConfirmedBy String?
  arrivalTime       String?
  opNotes           String?
  monitorId         String?   // instructorId in OpenClaw
  opStatus          String    @default("pendiente") // pendiente | confirmado | en_curso | completado | cancelado
  activitiesOpJson  Json?     // Per-activity operational data
  updatedBy         String?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId, opStatus])
}
```

**NO portamos** `monitors`, `monitor_documents`, `monitor_payroll` — OpenClaw ya tiene `Instructor`, `InstructorTimeEntry`, `PayrollRecord`, `PayrollExtra` que son superiores.

## Endpoints tRPC → Next.js API Routes

| Nayade tRPC | OpenClaw API | Estado |
|-------------|-------------|--------|
| `operations.calendar.getEvents` | `GET /api/booking/calendar` | ✅ Existe — enriquecer con restaurant events |
| `operations.dailyOrders.getForDate` | `GET /api/booking/daily-orders?date=X` | ✅ Existe |
| `operations.dailyOrders.updateOperational` | `PATCH /api/booking/daily-orders/[id]/operational` | Nuevo |
| `operations.dailyOrders.getDashboardStats` | `GET /api/booking/daily-orders/stats?date=X` | Nuevo |
| `operations.activities.getForDate` | `GET /api/booking/activities?date=X` | ✅ Existe |
| `operations.activities.assignMonitor` | `POST /api/booking/activities/[id]/assign` | Adaptar (ya existe con instructors) |
| `operations.activities.confirmArrival` | `POST /api/booking/activities/[id]/confirm` | Nuevo |
| `operations.activities.cancelActivity` | `POST /api/booking/activities/[id]/cancel` | Adaptar |

## Paginas admin a portar

| Nayade | OpenClaw | Estado |
|--------|----------|--------|
| `CalendarView.tsx` | Enriquecer booking calendar | Adaptar |
| `DailyActivities.tsx` | `src/app/(dashboard)/operations/` | ✅ Existe |
| `DailyOrders.tsx` | Adaptar existing | Adaptar |
| `MonitorsManager.tsx` | `src/app/(dashboard)/profesores/` | ✅ Ya existe (Instructors) — NO portar |
| `BookingsList.tsx` | Adaptar existing | Adaptar |

## PR Checklist

- [ ] Prisma migration: add `ReservationOperational`
- [ ] API: `PATCH /api/booking/daily-orders/[id]/operational` — update ops data
- [ ] API: `GET /api/booking/daily-orders/stats?date=X` — dashboard stats
- [ ] API: `POST /api/booking/activities/[id]/confirm` — confirm client arrival
- [ ] Enrich calendar endpoint to include restaurant bookings
- [ ] Enrich daily orders with operational status tracking
- [ ] UI: operational status badges on activity cards
- [ ] UI: arrival confirmation button
- [ ] UI: operational notes editor
- [ ] Wire: auto-create ReservationOperational when reservation is confirmed
