import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

/**
 * Multi-tenant isolation suite.
 *
 * Proves that tenant A and tenant B cannot see or mutate each other's data.
 * Uses Prisma mocks (matching the existing __tests__/lib/tenant-isolation.test.ts
 * pattern) to assert WHERE clauses are scoped correctly. Vitest config picks
 * tests up from __tests__/**, not src/__tests__/, hence the location here.
 *
 * Covered surfaces:
 *   1. Products GET — tenant A query never includes tenant B id
 *   2. Reservations GET/POST — tenantId-scoped reads, stamped writes
 *   3. Quotes GET/POST — tenantId-scoped reads, stamped writes
 *   4. Reservations [id] cross-tenant — 404, no update
 *   5. Storefront /s/[slug]/products — slug → tenant.id, scoped read
 *   6. Storefront cross-tenant slug — tenant B's slug never returns tenant A products
 *   7. Module configs — independent per tenant
 */

const TENANT_A = "tenant-skicenter-aaa";
const TENANT_B = "tenant-sierra-ski-bbb";
const SLUG_A = "skicenter";
const SLUG_B = "sierra-ski";

// ─── Prisma mocks ────────────────────────────────────────────────────────
const mockProduct = {
  findMany: vi.fn(),
  findFirst: vi.fn(),
  create: vi.fn(),
};
const mockReservation = {
  findMany: vi.fn(),
  findFirst: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
};
const mockQuote = {
  findMany: vi.fn(),
  findFirst: vi.fn(),
  create: vi.fn(),
};
const mockTenant = {
  findUnique: vi.fn(),
};
const mockModuleConfig = {
  findMany: vi.fn(),
};
const mockStationCapacity = {
  findFirst: vi.fn(),
  upsert: vi.fn(),
};

vi.mock("@/lib/db", () => ({
  prisma: {
    product: mockProduct,
    reservation: mockReservation,
    quote: mockQuote,
    tenant: mockTenant,
    moduleConfig: mockModuleConfig,
    stationCapacity: mockStationCapacity,
    notification: { create: vi.fn() },
    user: { findMany: vi.fn().mockResolvedValue([]) },
  },
}));

vi.mock("@/lib/notifications", () => ({
  createNotification: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    child: () => ({ info: vi.fn(), error: vi.fn(), warn: vi.fn() }),
  },
}));

// Auth defaults to TENANT_A; individual tests can override per-test
const mockAuth = vi.fn();
vi.mock("@/lib/auth/config", () => ({
  auth: () => mockAuth(),
}));

function asTenantA() {
  mockAuth.mockResolvedValue({
    user: {
      id: "user-a",
      email: "owner@skicenter.test",
      tenantId: TENANT_A,
      roleName: "Owner / Manager",
      isDemo: false,
    },
  });
}

function asTenantB() {
  mockAuth.mockResolvedValue({
    user: {
      id: "user-b",
      email: "sierra@test.com",
      tenantId: TENANT_B,
      roleName: "Owner / Manager",
      isDemo: false,
    },
  });
}

describe("Multi-tenant isolation — Skicenter (A) vs Sierra Ski (B)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ───────────────────────────────────────────────────────────────────────
  // 1. Products: tenant A list never includes tenant B id
  // ───────────────────────────────────────────────────────────────────────
  it("Products GET — tenant A only sees own + global products", async () => {
    asTenantA();
    mockProduct.findMany.mockResolvedValue([]);

    const { GET } = await import("@/app/api/products/route");
    await GET(new NextRequest("http://localhost/api/products"));

    const where = mockProduct.findMany.mock.calls[0][0].where;
    const orTenants = (where.OR as Array<Record<string, unknown>>).map((c) => c.tenantId);
    expect(orTenants).toContain(TENANT_A);
    expect(orTenants).toContain(null);
    expect(orTenants).not.toContain(TENANT_B);
  });

  it("Products GET — tenant B only sees own + global products", async () => {
    asTenantB();
    mockProduct.findMany.mockResolvedValue([]);

    const { GET } = await import("@/app/api/products/route");
    await GET(new NextRequest("http://localhost/api/products"));

    const where = mockProduct.findMany.mock.calls[0][0].where;
    const orTenants = (where.OR as Array<Record<string, unknown>>).map((c) => c.tenantId);
    expect(orTenants).toContain(TENANT_B);
    expect(orTenants).toContain(null);
    expect(orTenants).not.toContain(TENANT_A);
  });

  // ───────────────────────────────────────────────────────────────────────
  // 2. Reservations: read scoped by tenantId only (no global fallback)
  // ───────────────────────────────────────────────────────────────────────
  it("Reservations GET — strict tenantId scope (no OR / no null)", async () => {
    asTenantB();
    mockReservation.findMany.mockResolvedValue([]);

    const { GET } = await import("@/app/api/reservations/route");
    await GET(new NextRequest("http://localhost/api/reservations"));

    const where = mockReservation.findMany.mock.calls[0][0].where;
    expect(where.tenantId).toBe(TENANT_B);
    expect(where.tenantId).not.toBe(TENANT_A);
  });

  it("Reservations POST — stamps session tenantId on create", async () => {
    asTenantB();
    mockStationCapacity.findFirst.mockResolvedValue(null);
    mockReservation.create.mockResolvedValue({ id: "res-1", tenantId: TENANT_B });

    const { POST } = await import("@/app/api/reservations/route");
    await POST(
      new NextRequest("http://localhost/api/reservations", {
        method: "POST",
        body: JSON.stringify({
          clientName: "Cliente Sierra",
          clientPhone: "+34 600 111 222",
          clientEmail: "cliente@sierraski.test",
          source: "web",
          station: "sierra_nevada",
          activityDate: "2026-12-15",
          schedule: "10:00-13:00",
          totalPrice: 100,
          status: "pendiente",
          // attempt to inject tenant A — should be ignored
          tenantId: TENANT_A,
        }),
        headers: { "Content-Type": "application/json" },
      }),
    );

    expect(mockReservation.create).toHaveBeenCalledTimes(1);
    const data = mockReservation.create.mock.calls[0][0].data;
    expect(data.tenantId).toBe(TENANT_B);
    expect(data.tenantId).not.toBe(TENANT_A);
  });

  // ───────────────────────────────────────────────────────────────────────
  // 3. Reservation [id] cross-tenant — 404
  // ───────────────────────────────────────────────────────────────────────
  it("Reservation [id] PATCH — tenant A cannot mutate tenant B reservation", async () => {
    asTenantA();
    // Reservation belongs to tenant B → findFirst({id, tenantId: A}) → null
    mockReservation.findFirst.mockResolvedValue(null);

    const { PATCH } = await import("@/app/api/reservations/[id]/route");
    const res = await PATCH(
      new NextRequest("http://localhost/api/reservations/res-of-b", {
        method: "PATCH",
        body: JSON.stringify({ status: "cancelada" }),
        headers: { "Content-Type": "application/json" },
      }),
      { params: Promise.resolve({ id: "res-of-b" }) },
    );

    expect(res.status).toBe(404);
    expect(mockReservation.update).not.toHaveBeenCalled();
    const where = mockReservation.findFirst.mock.calls[0][0].where;
    expect(where.tenantId).toBe(TENANT_A);
    expect(where.id).toBe("res-of-b");
  });

  // ───────────────────────────────────────────────────────────────────────
  // 4. Quotes: read & write are tenant-scoped
  // ───────────────────────────────────────────────────────────────────────
  it("Quotes GET — strict tenantId scope (no global fallback)", async () => {
    asTenantA();
    mockQuote.findMany.mockResolvedValue([]);

    const { GET } = await import("@/app/api/quotes/route");
    await GET(new NextRequest("http://localhost/api/quotes"));

    const where = mockQuote.findMany.mock.calls[0][0].where;
    expect(where.tenantId).toBe(TENANT_A);
    expect(where).not.toHaveProperty("OR");
  });

  it("Quotes POST — tenant B creates quote stamped with tenant B id", async () => {
    asTenantB();
    mockQuote.create.mockResolvedValue({ id: "q-1", tenantId: TENANT_B });

    const { POST } = await import("@/app/api/quotes/route");
    await POST(
      new NextRequest("http://localhost/api/quotes", {
        method: "POST",
        body: JSON.stringify({
          clientName: "Cliente Sierra",
          clientEmail: "c@sierraski.test",
          destination: "sierra_nevada",
          checkIn: "2026-12-15",
          checkOut: "2026-12-18",
          adults: 2,
          children: 0,
          // injection attempt
          tenantId: TENANT_A,
        }),
        headers: { "Content-Type": "application/json" },
      }),
    );

    expect(mockQuote.create).toHaveBeenCalledTimes(1);
    const data = mockQuote.create.mock.calls[0][0].data;
    expect(data.tenantId).toBe(TENANT_B);
    expect(data.tenantId).not.toBe(TENANT_A);
  });

  // ───────────────────────────────────────────────────────────────────────
  // 5. Storefront — slug → tenant.id, scoped product list
  // ───────────────────────────────────────────────────────────────────────
  it("Storefront GET /s/skicenter/products — only returns tenant A products", async () => {
    mockTenant.findUnique.mockResolvedValue({ id: TENANT_A });
    mockProduct.findMany.mockResolvedValue([]);

    const { GET } = await import(
      "@/app/api/storefront/public/[slug]/products/route"
    );
    await GET(
      new NextRequest("http://localhost/api/storefront/public/skicenter/products"),
      { params: Promise.resolve({ slug: SLUG_A }) },
    );

    expect(mockTenant.findUnique.mock.calls[0][0].where.slug).toBe(SLUG_A);
    const where = mockProduct.findMany.mock.calls[0][0].where;
    expect(where.tenantId).toBe(TENANT_A);
    expect(where.isActive).toBe(true);
  });

  it("Storefront GET /s/sierra-ski/products — only returns tenant B products", async () => {
    mockTenant.findUnique.mockResolvedValue({ id: TENANT_B });
    mockProduct.findMany.mockResolvedValue([]);

    const { GET } = await import(
      "@/app/api/storefront/public/[slug]/products/route"
    );
    await GET(
      new NextRequest("http://localhost/api/storefront/public/sierra-ski/products"),
      { params: Promise.resolve({ slug: SLUG_B }) },
    );

    expect(mockTenant.findUnique.mock.calls[0][0].where.slug).toBe(SLUG_B);
    const where = mockProduct.findMany.mock.calls[0][0].where;
    expect(where.tenantId).toBe(TENANT_B);
    expect(where.tenantId).not.toBe(TENANT_A);
  });

  it("Storefront GET — tenant B slug cannot fetch tenant A's product by slug (404)", async () => {
    mockTenant.findUnique.mockResolvedValue({ id: TENANT_B });
    // Tenant A's product doesn't match tenantId=B → null
    mockProduct.findFirst.mockResolvedValue(null);

    const { GET } = await import(
      "@/app/api/storefront/public/[slug]/products/[productSlug]/route"
    );
    const res = await GET(
      new NextRequest(
        "http://localhost/api/storefront/public/sierra-ski/products/forfait-baqueira",
      ),
      {
        params: Promise.resolve({
          slug: SLUG_B,
          productSlug: "forfait-baqueira",
        }),
      },
    );

    expect(res.status).toBe(404);
    const where = mockProduct.findFirst.mock.calls[0][0].where;
    expect(where.tenantId).toBe(TENANT_B);
    expect(where.tenantId).not.toBe(TENANT_A);
  });

  it("Storefront GET — unknown slug returns 404 (no leak)", async () => {
    mockTenant.findUnique.mockResolvedValue(null);

    const { GET } = await import(
      "@/app/api/storefront/public/[slug]/products/route"
    );
    const res = await GET(
      new NextRequest("http://localhost/api/storefront/public/unknown/products"),
      { params: Promise.resolve({ slug: "unknown-tenant" }) },
    );

    expect(res.status).toBe(404);
    expect(mockProduct.findMany).not.toHaveBeenCalled();
  });

  // ───────────────────────────────────────────────────────────────────────
  // 6. Module configs are independent per tenant
  // ───────────────────────────────────────────────────────────────────────
  it("Module configs GET — query is scoped per tenant id", async () => {
    asTenantA();
    mockModuleConfig.findMany.mockResolvedValue([
      { module: "catalog", isEnabled: true, config: {} },
      { module: "hotel", isEnabled: true, config: {} },
    ]);

    const { GET } = await import("@/app/api/settings/modules/route");
    await GET();

    const where = mockModuleConfig.findMany.mock.calls[0][0].where;
    expect(where.tenantId).toBe(TENANT_A);

    // Now switch to tenant B — different tenantId in query
    vi.clearAllMocks();
    asTenantB();
    mockModuleConfig.findMany.mockResolvedValue([
      { module: "catalog", isEnabled: true, config: {} },
    ]);
    await GET();
    const whereB = mockModuleConfig.findMany.mock.calls[0][0].where;
    expect(whereB.tenantId).toBe(TENANT_B);
    expect(whereB.tenantId).not.toBe(TENANT_A);
  });
});
