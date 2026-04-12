# PORT-12: Restaurant Enhancement

## Decision: 🔧 Adaptar | Complejidad: L

## Estado actual OpenClaw

Restaurant module con: Restaurant (title, slug, capacity, depositPerGuest, operatingDays), RestaurantShift, RestaurantClosure, RestaurantBooking, RestaurantStaff. API CRUD completo.

## Que aporta Nayade

1. **Restaurant enriquecido**: cuisine, heroImage, galleryImages, menuUrl, phone, email, badge, minAdvanceHours, maxAdvanceDays, cancellationHours, cancellationPolicy, legalText, operativeEmail, acceptsOnlineBooking
2. **RestaurantBooking enriquecido**: locator (UNIQUE), guestLastName, highchair, allergies, birthday, specialRequests, accessibility, isVip, cancellationReason, channel, paymentStatus, merchantOrder, paidAt, adminNotes
3. **Public booking flow**: select restaurant → date/time/guests → form → deposit Redsys
4. **Booking logs**: audit trail per booking (action, details, userId)
5. **Global calendar**: monthly view across all restaurants
6. **Availability engine**: checks shift capacity, closures, min advance, max advance
7. **Staff management**: assign users to restaurants, restaurant-scoped admin access
8. **Email notifications**: confirmation, payment link, cancellation
9. **Locator-based lookup**: public search by booking locator code

## Archivos fuente Nayade

| Archivo | Proposito |
|---------|-----------|
| `server/restaurantsDb.ts` | 17 exported functions: full CRUD + availability + dashboard |
| `server/routers/restaurants.ts` | 30+ endpoints: public (listing, availability, booking) + admin (CRUD, shifts, closures, staff, calendar) |
| `drizzle/schema.ts` → restaurant tables + `restaurant_booking_logs` | Schema |
| `client/src/pages/Restaurantes.tsx` | Public listing |
| `client/src/pages/RestauranteDetail.tsx` | Public detail |
| `client/src/pages/RestaurantBooking.tsx` | Public booking form |
| `client/src/pages/admin/restaurants/RestaurantsManager.tsx` | Admin UI |
| `client/src/pages/admin/restaurants/GlobalCalendar.tsx` | Global calendar UI |

## Tablas Drizzle → Prisma (+ tenantId)

### Modelo nuevo

```prisma
model RestaurantBookingLog {
  id        String   @id @default(cuid())
  tenantId  String
  bookingId String
  action    String   // "created" | "confirmed" | "cancelled" | "updated" | "no_show"
  details   String?
  userId    String?
  createdAt DateTime @default(now())

  tenant  Tenant            @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  booking RestaurantBooking @relation(fields: [bookingId], references: [id], onDelete: Cascade)

  @@index([tenantId, bookingId])
}
```

### Campos a añadir a modelos existentes

```prisma
// Restaurant — add:
cuisine             String?
heroImage           String?
galleryImages       Json      @default("[]")
menuUrl             String?
phone               String?
email               String?
badge               String?
minAdvanceHours     Int       @default(0)
maxAdvanceDays      Int       @default(90)
cancellationHours   Int       @default(24)
cancellationPolicy  String?
legalText           String?
operativeEmail      String?
acceptsOnlineBooking Boolean  @default(true)

// RestaurantBooking — add:
locator             String?   @unique
guestName           String?
guestLastName       String?
guestEmail          String?
guestPhone          String?
highchair           Boolean   @default(false)
allergies           String?
birthday            Boolean   @default(false)
accessibility       Boolean   @default(false)
isVip               Boolean   @default(false)
cancellationReason  String?
channel             String    @default("admin") // "web" | "manual" | "admin"
paymentStatus       String    @default("pending") // "pending" | "paid" | "refunded"
merchantOrder       String?
paidAt              DateTime?
adminNotes          String?

// RestaurantShift — add:
daysOfWeek          Json      @default("[]") // [1,2,3,4,5] = Mon-Fri
slotMinutes         Int       @default(30)
```

## Endpoints tRPC → Next.js API Routes

### Public (NEW)

| Nayade tRPC | OpenClaw API | Metodo |
|-------------|-------------|--------|
| `restaurants.getAll` | `GET /api/storefront/[slug]/restaurant` | ✅ Existe |
| `restaurants.getBySlug` | `GET /api/storefront/[slug]/restaurant/[restaurantSlug]` | Nuevo |
| `restaurants.getAvailability` | `GET /api/restaurant/availability` | Nuevo |
| `restaurants.getShifts` | `GET /api/restaurant/shifts?restaurantId=X` | ✅ Existe |
| `restaurants.createBooking` | `POST /api/storefront/[slug]/restaurant/book` | ✅ Existe — add Redsys |
| `restaurants.getBookingByLocator` | `GET /api/restaurant/bookings/locator/[code]` | Nuevo |

### Admin (enriquecer)

| Nayade tRPC | OpenClaw API | Estado |
|-------------|-------------|--------|
| `restaurants.adminGetGlobalCalendar` | `GET /api/restaurant/global-calendar` | Nuevo |
| `restaurants.adminAddNote` | `POST /api/restaurant/bookings/[id]/notes` | Nuevo |
| `restaurants.adminUpdateConfig` | `PATCH /api/restaurant/venues/[id]` | ✅ Existe — enriquecer |
| `restaurants.getDashboard` | `GET /api/restaurant/dashboard` | Nuevo |

## Paginas a portar

| Nayade | OpenClaw | Estado |
|--------|----------|--------|
| `Restaurantes.tsx` | Public storefront listing | Adaptar |
| `RestauranteDetail.tsx` | Public detail | Nuevo |
| `RestaurantBooking.tsx` | Public booking form | Nuevo |
| `RestaurantsManager.tsx` | `src/app/(dashboard)/restaurant/` | ✅ Existe — enriquecer |
| `GlobalCalendar.tsx` | `src/app/(dashboard)/restaurant/_components/GlobalCalendar.tsx` | Nuevo |

## PR Checklist

- [ ] Prisma migration: add `RestaurantBookingLog`, enrich Restaurant, RestaurantBooking, RestaurantShift
- [ ] API: `GET /api/restaurant/availability?restaurantId=X&date=Y` — checks capacity
- [ ] API: `GET /api/restaurant/global-calendar?yearMonth=YYYY-MM`
- [ ] API: `GET /api/restaurant/bookings/locator/[code]` — public lookup
- [ ] API: `POST /api/restaurant/bookings/[id]/notes`
- [ ] API: `GET /api/restaurant/dashboard?restaurantId=X` — stats
- [ ] Integrate Redsys (PORT-03) into restaurant booking for deposits
- [ ] Service: locator generator (6 char alphanumeric unique code)
- [ ] Service: booking log helper (auto-log on status changes)
- [ ] UI: enrich restaurant form with new fields
- [ ] UI: enrich booking form with guest details (allergies, highchair, etc.)
- [ ] UI: global calendar view (month grid with booking counts per restaurant)
- [ ] UI: booking detail with log timeline
- [ ] Public: restaurant detail + booking form in storefront
- [ ] Email: confirmation + cancellation emails (depends on PORT-02)
