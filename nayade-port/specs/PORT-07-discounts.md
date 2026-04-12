# PORT-07: Discounts Enhancement

## Decision: 🔧 Adaptar | Complejidad: S

## Estado actual OpenClaw

DiscountCode y DiscountCodeUse existen. API en `/api/storefront/discount-codes` con CRUD + apply. Vouchers de compensacion en CompensationVoucher.

## Que aporta Nayade

1. **Validacion publica** en checkout y TPV (endpoint `validate`)
2. **Verificacion de voucher** publica (endpoint `verifyVoucher`)
3. **Duplicar codigo** (endpoint `duplicate`)
4. **Campos enriquecidos**: `name`, `description`, `discountType` (percent/fixed), `observations`, `origin` (manual/voucher), `compensationVoucherId`, `clientEmail`, `clientName`
5. **Usage history** con filtros

## Archivos fuente Nayade

| Archivo | Proposito |
|---------|-----------|
| `server/routers/discounts.ts` | Router completo: validate, verifyVoucher, list, getById, create, update, toggleStatus, duplicate, delete, getUses |
| `drizzle/schema.ts` → `discount_codes`, `discount_code_uses` | Schema |
| `client/src/pages/DiscountCodesManager.tsx` | Admin UI |
| `client/src/pages/VerificarBono.tsx` | Public voucher verification page |

## Tablas Drizzle → Prisma

No tablas nuevas. Enriquecer DiscountCode:

```prisma
// DiscountCode — add:
name                  String?
description           String?
observations          String?
origin                String   @default("manual") // "manual" | "voucher"
compensationVoucherId String?
clientEmail           String?
clientName            String?
```

## Endpoints tRPC → Next.js API Routes

| Nayade tRPC | OpenClaw API | Estado |
|-------------|-------------|--------|
| `discounts.validate` | `POST /api/storefront/discount-codes/apply` | ✅ Existe |
| `discounts.verifyVoucher` | `GET /api/storefront/vouchers/verify?code=X` | Nuevo |
| `discounts.duplicate` | `POST /api/storefront/discount-codes/[id]/duplicate` | Nuevo |
| `discounts.list` | `GET /api/storefront/discount-codes` | ✅ Existe |
| `discounts.getUses` | `GET /api/storefront/discount-codes/[id]/uses` | Nuevo |
| `discounts.toggleStatus` | `PATCH /api/storefront/discount-codes/[id]` | ✅ Existe |

## Paginas admin a portar

| Nayade | OpenClaw | Estado |
|--------|----------|--------|
| `DiscountCodesManager.tsx` | `src/app/(dashboard)/storefront/` | ✅ Existe — enriquecer |
| `VerificarBono.tsx` | Public page (storefront) | Nuevo |

## PR Checklist

- [ ] Prisma migration: add fields to DiscountCode
- [ ] API: `POST /api/storefront/discount-codes/[id]/duplicate`
- [ ] API: `GET /api/storefront/vouchers/verify?code=X` (public)
- [ ] API: `GET /api/storefront/discount-codes/[id]/uses` (usage history)
- [ ] Validation: extend discount code schemas
- [ ] UI: add name, description, origin fields to discount code form
- [ ] UI: usage history drawer/modal
- [ ] Public: voucher verification page
