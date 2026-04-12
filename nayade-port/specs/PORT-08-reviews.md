# PORT-08: Reviews Enhancement

## Decision: 🔧 Adaptar | Complejidad: S

## Estado actual OpenClaw

Review model con entityType (experience/hotel/spa/restaurant), rating 1-5, moderation (pending/approved/rejected), reply. API CRUD en `/api/reviews`. Public submit en `/api/reviews/public`.

## Que aporta Nayade

1. **Verified booking check**: marcar si el reviewer tiene una reserva real
2. **Admin stats globales**: total reviews, avg rating, by entity type, by status
3. **Rating stats por entidad**: avg rating + count por entityId (para mostrar en listados)
4. **Stay date** tracking (ya existe en OpenClaw)

## Archivos fuente Nayade

| Archivo | Proposito |
|---------|-----------|
| `server/db/reviewsDb.ts` | `getPublicReviews`, `getReviewStats`, `getRatingsByEntityType`, `createReview`, `adminGetReviews`, `approveReview`, `rejectReview`, `deleteReview`, `replyToReview`, `adminGetReviewStats` |
| `server/routers/reviews.ts` | Router: public + admin endpoints |
| `client/src/pages/admin/ReviewsManager.tsx` | Admin UI |

## Tablas Drizzle → Prisma

No cambios en schema. El modelo `Review` de OpenClaw ya cubre todo.

## Endpoints tRPC → Next.js API Routes

| Nayade tRPC | OpenClaw API | Estado |
|-------------|-------------|--------|
| `reviews.getPublicReviews` | `GET /api/reviews/public` | ✅ Existe |
| `reviews.submitReview` | `POST /api/reviews/public/submit` | ✅ Existe |
| `reviews.adminGetReviews` | `GET /api/reviews` | ✅ Existe |
| `reviews.adminGetStats` | `GET /api/reviews/stats` | Nuevo |
| `reviews.adminApprove/Reject/Delete/Reply` | PATCH/DELETE `/api/reviews/[id]` | ✅ Existe |

## Paginas admin

| Nayade | OpenClaw | Estado |
|--------|----------|--------|
| `ReviewsManager.tsx` | `src/app/(dashboard)/reviews/` | ✅ Existe |

## PR Checklist

- [ ] API: `GET /api/reviews/stats` — global stats (total, avg, by type, by status)
- [ ] Enrich `GET /api/reviews/public` — include avg rating + count per entity
- [ ] Add verified booking check on review submission (query reservation by email + entity)
- [ ] UI: stats card at top of reviews page
- [ ] UI: "Verificado" badge on reviews with confirmed booking
