# PORT-10: Hotel Enhancement

## Decision: 🔧 Adaptar | Complejidad: L

## Estado actual OpenClaw

Hotel module con: RoomType (title, slug, capacity, basePrice, images), RoomRateSeason, RoomRate, RoomBlock. API CRUD + availability query. Admin UI basica.

## Que aporta Nayade

1. **RoomType enriquecido**: shortDescription, maxAdults, maxChildren, maxOccupancy, surfaceM2, amenities (JSON), gallery (4 images + array), discountPercent/Label/ExpiresAt, fiscal fields, meta SEO, internalTags
2. **Public booking flow**: search availability → select room → dates → guest info → Redsys payment
3. **Room calendar public**: monthly view with prices and availability per day
4. **Rate priority**: specificDate > dayOfWeek > season (Nayade searches in this order)
5. **Rate supplements**: supplementLabel + amount on room rates
6. **Hotel booking** (crea reserva + form Redsys)

## Archivos fuente Nayade

| Archivo | Proposito |
|---------|-----------|
| `server/hotelDb.ts` | 21 exported functions: CRUD + `searchAvailability`, `getRoomCalendar` |
| `server/routers/hotel.ts` | 20 endpoints: public (search, calendar, booking) + admin CRUD |
| `drizzle/schema.ts` → `room_types`, `room_rate_seasons`, `room_rates`, `room_blocks` | Schema |
| `client/src/pages/Hotel.tsx` | Public listing |
| `client/src/pages/HotelRoom.tsx` | Public room detail + booking |
| `client/src/pages/admin/hotel/HotelManager.tsx` | Admin UI |

## Tablas Drizzle → Prisma

No tablas nuevas. Enriquecer RoomType y RoomRate:

```prisma
// RoomType — add:
shortDescription    String?
maxAdults           Int?
maxChildren         Int?
maxOccupancy        Int?
surfaceM2           Int?
amenities           Json     @default("[]") // ["wifi", "tv", "minibar"]
gallery             Json     @default("[]") // [url1, url2, ...]
discountPercent     Float?
discountLabel       String?
discountExpiresAt   DateTime?
fiscalRegime        String   @default("general")
internalTags        Json     @default("[]")
metaTitle           String?
metaDescription     String?

// RoomRate — add:
specificDate        DateTime?  // Override for specific date (takes priority)
supplementLabel     String?
currency            String     @default("EUR")
```

## Endpoints tRPC → Next.js API Routes

| Nayade tRPC | OpenClaw API | Estado |
|-------------|-------------|--------|
| `hotel.getRoomTypes` | `GET /api/storefront/[slug]/hotel` | ✅ Existe |
| `hotel.getRoomTypeBySlug` | `GET /api/storefront/[slug]/hotel/[roomSlug]` | Nuevo |
| `hotel.searchAvailability` | `GET /api/hotel/availability` | ✅ Existe — enriquecer |
| `hotel.getRoomCalendar` | `GET /api/hotel/calendar` | Nuevo |
| `hotel.createHotelBooking` | `POST /api/storefront/[slug]/hotel/book` | ✅ Existe — add Redsys |
| `hotel.adminGetCalendar` | `GET /api/hotel/admin-calendar` | Nuevo |
| `hotel.admin*` (CRUD) | `/api/hotel/*` | ✅ Existe |

## Paginas a portar

| Nayade | OpenClaw | Estado |
|--------|----------|--------|
| `Hotel.tsx` | Public storefront hotel listing | Adaptar storefront |
| `HotelRoom.tsx` | Public room detail + calendar + booking | Nuevo |
| `HotelManager.tsx` | `src/app/(dashboard)/hotel/` | ✅ Existe — enriquecer form |

## PR Checklist

- [ ] Prisma migration: enrich RoomType and RoomRate with new fields
- [ ] API: `GET /api/hotel/calendar?roomTypeId=X&year=Y&month=M` — monthly price/availability
- [ ] API: `GET /api/hotel/admin-calendar` — admin monthly view
- [ ] Enrich availability search with rate priority logic (specificDate > dayOfWeek > season)
- [ ] Integrate Redsys (PORT-03) into hotel booking flow
- [ ] UI: enrich room type form with new fields (amenities, gallery, fiscal, discount)
- [ ] UI: admin calendar view for room availability
- [ ] Public: room detail page with calendar picker in storefront
