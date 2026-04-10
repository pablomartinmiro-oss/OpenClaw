import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

/**
 * Tenant isolation tests for the Products API.
 *
 * Core security invariants verified:
 * 1. Tenant A must NEVER see another tenant's products on reads.
 * 2. Tenant A must NEVER mutate another tenant's products (or global catalog).
 * 3. Product creation always stamps the session tenantId.
 *
 * Test strategy: mock Prisma calls and assert the `where` clause always
 * scopes correctly — OR-filter for reads, strict tenantId-only for writes.
 */

// Mock prisma
const mockFindMany = vi.fn();
const mockCreate = vi.fn();
const mockFindFirst = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();

vi.mock("@/lib/db", () => ({
  prisma: {
    product: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      create: (...args: unknown[]) => mockCreate(...args),
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
      delete: (...args: unknown[]) => mockDelete(...args),
    },
  },
}));

// Mock auth to return a known tenant
const TENANT_A = "tenant-aaa-111";
const TENANT_B = "tenant-bbb-222";

vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn().mockResolvedValue({
    user: {
      id: "user-1",
      email: "test@test.com",
      tenantId: TENANT_A,
      roleName: "owner",
      isDemo: false,
    },
  }),
}));

vi.mock("@/lib/logger", () => ({
  logger: { child: () => ({ info: vi.fn(), error: vi.fn(), warn: vi.fn() }) },
}));

describe("Products API — tenant isolation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindMany.mockResolvedValue([]);
    mockCreate.mockResolvedValue({ id: "prod-new", tenantId: TENANT_A });
    mockFindFirst.mockResolvedValue({ id: "prod-1", tenantId: TENANT_A });
    mockUpdate.mockResolvedValue({ id: "prod-1", tenantId: TENANT_A });
  });

  // ─── Read path ───────────────────────────────────────────────────────────

  it("GET /api/products scopes query to tenant's products + global catalog", async () => {
    const { GET } = await import("@/app/api/products/route");

    const req = new NextRequest("http://localhost/api/products");
    await GET(req);

    expect(mockFindMany).toHaveBeenCalledTimes(1);
    const whereClause = mockFindMany.mock.calls[0][0].where;

    // Read path must include OR to return tenant + global catalog
    expect(whereClause).toHaveProperty("OR");
    expect(whereClause.OR).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ tenantId: TENANT_A }),
        expect.objectContaining({ tenantId: null }),
      ])
    );
  });

  // ─── Create path ─────────────────────────────────────────────────────────

  it("POST /api/products stamps tenantId on new product", async () => {
    const { POST } = await import("@/app/api/products/route");

    const req = new NextRequest("http://localhost/api/products", {
      method: "POST",
      body: JSON.stringify({
        name: "Test Skis",
        category: "alquiler",
        price: 25,
        priceType: "per_day",
      }),
      headers: { "Content-Type": "application/json" },
    });

    await POST(req);

    expect(mockCreate).toHaveBeenCalledTimes(1);
    const createData = mockCreate.mock.calls[0][0].data;
    expect(createData.tenantId).toBe(TENANT_A);
  });

  // ─── PATCH path ──────────────────────────────────────────────────────────

  it("PATCH /api/products/[id] — happy path: own product is updated", async () => {
    // Product belongs to Tenant A — findFirst returns it
    mockFindFirst.mockResolvedValue({ id: "prod-a", tenantId: TENANT_A });

    const { PATCH } = await import("@/app/api/products/[id]/route");

    const req = new NextRequest("http://localhost/api/products/prod-a", {
      method: "PATCH",
      body: JSON.stringify({ name: "Updated Skis" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await PATCH(req, {
      params: Promise.resolve({ id: "prod-a" }),
    });

    expect(res.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledTimes(1);

    // Write lookup must be scoped strictly to the session tenant
    const whereClause = mockFindFirst.mock.calls[0][0].where;
    expect(whereClause.id).toBe("prod-a");
    expect(whereClause.tenantId).toBe(TENANT_A);
    expect(whereClause).not.toHaveProperty("OR");
  });

  it("PATCH /api/products/[id] — cross-tenant denial: product from another tenant returns 404", async () => {
    // Product belongs to Tenant B (or global catalog) — not visible to Tenant A writes
    mockFindFirst.mockResolvedValue(null);

    const { PATCH } = await import("@/app/api/products/[id]/route");

    const req = new NextRequest("http://localhost/api/products/prod-b", {
      method: "PATCH",
      body: JSON.stringify({ name: "Hacked Name" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await PATCH(req, {
      params: Promise.resolve({ id: "prod-b" }),
    });

    expect(res.status).toBe(404);
    // update must never be called when ownership check fails
    expect(mockUpdate).not.toHaveBeenCalled();

    // Verify the findFirst was scoped to Tenant A only (no OR / no null)
    const whereClause = mockFindFirst.mock.calls[0][0].where;
    expect(whereClause.id).toBe("prod-b");
    expect(whereClause.tenantId).toBe(TENANT_A);
    expect(whereClause).not.toHaveProperty("OR");
  });

  // ─── DELETE path ─────────────────────────────────────────────────────────

  it("DELETE /api/products/[id] — cross-tenant denial: product from another tenant returns 404", async () => {
    // Simulate product owned by Tenant B
    mockFindFirst.mockResolvedValue(null);

    const { DELETE } = await import("@/app/api/products/[id]/route");

    const req = new NextRequest("http://localhost/api/products/prod-b", {
      method: "DELETE",
    });

    const res = await DELETE(req, {
      params: Promise.resolve({ id: "prod-b" }),
    });

    expect(res.status).toBe(404);
    // delete must never be called when ownership check fails
    expect(mockDelete).not.toHaveBeenCalled();

    // findFirst must scope strictly to session tenant — no global catalog access
    const whereClause = mockFindFirst.mock.calls[0][0].where;
    expect(whereClause.id).toBe("prod-b");
    expect(whereClause.tenantId).toBe(TENANT_A);
    expect(whereClause).not.toHaveProperty("OR");
  });

  it("DELETE /api/products/[id] — cross-tenant denial: global catalog product returns 404", async () => {
    // Global catalog product (tenantId: null) — must NOT be deletable by tenants
    mockFindFirst.mockResolvedValue(null);

    const { DELETE } = await import("@/app/api/products/[id]/route");

    const req = new NextRequest("http://localhost/api/products/global-prod-1", {
      method: "DELETE",
    });

    const res = await DELETE(req, {
      params: Promise.resolve({ id: "global-prod-1" }),
    });

    expect(res.status).toBe(404);
    expect(mockDelete).not.toHaveBeenCalled();
  });

  // ─── Bulk-import write path ───────────────────────────────────────────────

  it("POST /api/products/bulk-import — does not mutate global catalog entries", async () => {
    // Simulate: global catalog has a product with the same name (tenantId: null).
    // The strict lookup ({name, tenantId}) will NOT find it — mockFindFirst returns null.
    // A new tenant-owned product should be created instead.
    mockFindFirst.mockResolvedValue(null);
    mockCreate.mockResolvedValue({ id: "prod-new", tenantId: TENANT_A });

    const { POST } = await import(
      "@/app/api/products/bulk-import/route"
    );

    const req = new NextRequest(
      "http://localhost/api/products/bulk-import",
      {
        method: "POST",
        body: JSON.stringify({
          products: [{ name: "Ski Boots Adult", price: 20 }],
        }),
        headers: { "Content-Type": "application/json" },
      }
    );

    await POST(req);

    // update must never be called — global catalog entry must not be touched
    expect(mockUpdate).not.toHaveBeenCalled();
    // A new tenant-owned product should be created
    expect(mockCreate).toHaveBeenCalledTimes(1);
    const createData = mockCreate.mock.calls[0][0].data;
    expect(createData.tenantId).toBe(TENANT_A);

    // findFirst must scope strictly to Tenant A (no OR / no null)
    const whereClause = mockFindFirst.mock.calls[0][0].where;
    expect(whereClause.tenantId).toBe(TENANT_A);
    expect(whereClause).not.toHaveProperty("OR");
  });
});
