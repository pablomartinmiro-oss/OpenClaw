# Dashboard UI Conventions

## Design System

Warm/premium aesthetic inspired by kinso.ai:
- **Font:** DM Sans (via globals.css)
- **Background:** #FAF9F7 (warm off-white)
- **Primary accent:** #E87B5A (warm coral)
- **Success:** #5B8C6D (sage green)
- **Warning:** #D4A853 (warm gold)
- **Danger:** #C75D4A (muted red)
- **Text:** #2D2A26 primary, #8A8580 secondary
- **Border:** #E8E4DE
- **Radius:** 16px cards, 10px inputs/buttons, 6px pills

## Components

- shadcn/ui components in `src/components/ui/`
- shadcn/ui v4 uses base-ui (not Radix) — `render` prop instead of `asChild`
- Toasts: `sonner` (not deprecated toast)
- Tailwind v4 with `tw-animate-css`

## Layout

- Route groups: `(dashboard)` (sidebar + topbar), `(auth)` (standalone)
- Layout wraps with `SessionProvider` + `QueryClientProvider`
- Sidebar: 240px, Topbar, MobileNav in `src/components/layout/`

## Shared Components

- `RoleGate` — client-side UI gating by permission
- `usePermissions()` hook — returns `can()`, `canAny()`, `canAll()`
- ErrorBoundary, EmptyState, LoadingSkeleton

## UX Rules

- Every data component has a Skeleton loader — never blank screens
- Every mutation is optimistic — update UI immediately, rollback on error
- All UI text in SPANISH
- All currency in EUR (es-ES format via `Intl.NumberFormat`)

## Status Badges (muted colors)

- Pendiente/Nuevo: gold at 15% bg
- Confirmada/Enviado: sage at 15% bg
- Sin disponibilidad: muted red at 15% bg
- Cancelada: warm gray at 15% bg

## Modules

- **Reservas:** Two-panel (list 35% + form 65%), Groupon voucher integration, auto-pricing
- **Presupuestos:** Quotes with auto-package, season-aware pricing
- **Catálogo:** Product table with season toggle, station filter, matrix prices
- **Settings:** Data mode toggle, GHL connection, team, season calendar, price import, Groupon mappings
- **Comms/Contacts/Pipeline:** GHL-synced data with cache reads
