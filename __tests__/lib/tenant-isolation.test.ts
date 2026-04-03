import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

/**
 * Tenant isolation tests for the Products API.
 *
 * These verify the core security invariant:
 * Tenant A must NEVER see, modify, or delete Tenant B's products.
 *
 * Test strategy: mock Prisma calls and verify the `where` clause
 * always includes tenantId scoping.
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

  it("GET /api/products scopes query to tenant's products + global catalog", async () => {
    // Dynamic import to ensure mocks are in place
    const { GET } = await import("@/app/api/products/route");

    const req = new NextRequest("http://localhost/api/products");
    await GET(req);

    expect(mockFindMany).toHaveBeenCalledTimes(1);
    const whereClause = mockFindMany.mock.calls[0][0].where;

    // Must include OR clause with tenantId
    expect(whereClause).toHaveProperty("OR");
    expect(whereClause.OR).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ tenantId: TENANT_A }),
        expect.objectContaining({ tenantId: null }),
      ])
    );
  });

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

  it("PATCH /api/products/[id] rejects product from another tenant", async () => {
    // Product belongs to Tenant B — should not be found
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

    // Verify the findFirst was scoped to Tenant A
    const whereClause = mockFindFirst.mock.calls[0][0].where;
    expect(whereClause.id).toBe("prod-b");
    expect(whereClause.OR).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ tenantId: TENANT_A }),
      ])
    );
  });
});
