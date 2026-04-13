import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

/**
 * PORT-04: Tenant isolation tests for new endpoints.
 *
 * CASE 1 — Clone cross-tenant: tenant B cannot clone tenant A's product
 * CASE 2 — Storefront slug cross-tenant: product from tenant A not visible under tenant B's storefront
 * CASE 3 — Storefront unpublished: isPublished=false blocks public access
 */

const TENANT_A_ID = "tenant-aaa-111";
const TENANT_B_ID = "tenant-bbb-222";
const TENANT_B_SLUG = "tenant-b-storefront";

// ─── Mock Prisma ──────────────────────────────────────────────────────────

const mockProductFindFirst = vi.fn();
const mockProductCreate = vi.fn();
const mockTenantFindUnique = vi.fn();

vi.mock("@/lib/db", () => ({
  prisma: {
    product: {
      findFirst: (...args: unknown[]) => mockProductFindFirst(...args),
      create: (...args: unknown[]) => mockProductCreate(...args),
    },
    tenant: {
      findUnique: (...args: unknown[]) => mockTenantFindUnique(...args),
    },
  },
}));

// Mock auth as tenant A for clone tests
vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn().mockResolvedValue({
    user: {
      id: "user-a",
      email: "a@test.com",
      tenantId: TENANT_A_ID,
      roleName: "owner",
      isDemo: false,
    },
  }),
}));

vi.mock("@/lib/logger", () => ({
  logger: { child: () => ({ info: vi.fn(), error: vi.fn(), warn: vi.fn() }) },
}));

describe("PORT-04: Tenant isolation — new endpoints", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ═══════════════════════════════════════════════════════════════════════
  // CASE 1 — Clone cross-tenant
  // Tenant A is authenticated. Product belongs to tenant B.
  // Clone must return 404, not 200 or 403.
  // ═══════════════════════════════════════════════════════════════════════

  it("POST /api/products/[id]/clone — tenant A cannot clone tenant B product (404)", async () => {
    // Product "prod-b-1" belongs to tenant B. When tenant A (our session)
    // tries to find it with OR: [{ tenantId: TENANT_A }, { tenantId: null }],
    // it won't match because tenantId is TENANT_B.
    mockProductFindFirst.mockResolvedValue(null);

    const { POST } = await import("@/app/api/products/[id]/clone/route");

    const req = new NextRequest("http://localhost/api/products/prod-b-1/clone", {
      method: "POST",
    });

    const res = await POST(req, {
      params: Promise.resolve({ id: "prod-b-1" }),
    });

    // Must be 404 — not 403 (which would leak existence) and not 200
    expect(res.status).toBe(404);

    // Create must never be called when source product is not accessible
    expect(mockProductCreate).not.toHaveBeenCalled();

    // Verify the findFirst WHERE scoped to session tenant + global only
    const where = mockProductFindFirst.mock.calls[0][0].where;
    expect(where.id).toBe("prod-b-1");
    expect(where.OR).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ tenantId: TENANT_A_ID }),
        expect.objectContaining({ tenantId: null }),
      ])
    );
    // Must NOT include TENANT_B in the query
    const allTenantIds = where.OR.map((c: Record<string, unknown>) => c.tenantId);
    expect(allTenantIds).not.toContain(TENANT_B_ID);
  });

  it("POST /api/products/[id]/clone — cloned product belongs to session tenant", async () => {
    // Source product is global (tenantId: null) — visible to all tenants
    const globalProduct = {
      id: "prod-global-1",
      tenantId: null,
      name: "Forfait Baqueira",
      slug: "forfait-baqueira",
      category: "forfait",
      station: "baqueira",
      description: null,
      personType: "adulto",
      tier: null,
      includesHelmet: false,
      priceType: "per_day",
      price: 74,
      pricingMatrix: null,
      isActive: true,
      sortOrder: 0,
      supplierId: null,
      fiscalRegime: "general",
      productType: "experiencia",
      providerPercent: null,
      agencyMarginPercent: null,
      supplierCommissionPercent: null,
      supplierCostType: null,
      settlementFrequency: null,
      isSettlable: false,
      isFeatured: false,
      isPublished: true,
      isPresentialSale: false,
      discountPercent: null,
      discountExpiresAt: null,
      coverImageUrl: null,
      images: [],
      includes: null,
      excludes: null,
      metaTitle: null,
      metaDescription: null,
      difficulty: null,
      discipline: null,
      minAge: null,
      maxAge: null,
      maxParticipants: null,
      requiresGrouping: false,
      planningMode: null,
      defaultMeetingPointId: null,
    };
    mockProductFindFirst.mockResolvedValue(globalProduct);
    mockProductCreate.mockResolvedValue({ ...globalProduct, id: "prod-cloned", tenantId: TENANT_A_ID });

    const { POST } = await import("@/app/api/products/[id]/clone/route");

    const req = new NextRequest("http://localhost/api/products/prod-global-1/clone", {
      method: "POST",
    });

    const res = await POST(req, {
      params: Promise.resolve({ id: "prod-global-1" }),
    });

    expect(res.status).toBe(201);

    // Cloned product must belong to the session tenant, NOT global
    const createData = mockProductCreate.mock.calls[0][0].data;
    expect(createData.tenantId).toBe(TENANT_A_ID);
    expect(createData.slug).toBeNull(); // slug cleared to avoid unique conflict
    expect(createData.isActive).toBe(false); // clones start inactive
    expect(createData.name).toContain("(copia)");
  });

  // ═══════════════════════════════════════════════════════════════════════
  // CASE 2 — Storefront slug cross-tenant
  // Product with slug "test-product" belongs to tenant A.
  // Looking up via tenant B's storefront must return 404.
  // ═══════════════════════════════════════════════════════════════════════

  it("GET /storefront/public/[slug]/products/[productSlug] — tenant B storefront cannot see tenant A product (404)", async () => {
    // Tenant B storefront exists
    mockTenantFindUnique.mockResolvedValue({ id: TENANT_B_ID });

    // The product "test-product" exists but under tenant A, not tenant B.
    // findFirst with { tenantId: TENANT_B_ID, slug: "test-product" } returns null.
    mockProductFindFirst.mockResolvedValue(null);

    const { GET } = await import(
      "@/app/api/storefront/public/[slug]/products/[productSlug]/route"
    );

    const req = new NextRequest(
      `http://localhost/api/storefront/public/${TENANT_B_SLUG}/products/test-product`
    );

    const res = await GET(req, {
      params: Promise.resolve({ slug: TENANT_B_SLUG, productSlug: "test-product" }),
    });

    // Must be 404 — product exists in the system but not under this storefront
    expect(res.status).toBe(404);

    // Verify tenant lookup used the storefront slug
    expect(mockTenantFindUnique.mock.calls[0][0].where.slug).toBe(TENANT_B_SLUG);

    // Verify product query scoped to tenant B's ID (not tenant A)
    const productWhere = mockProductFindFirst.mock.calls[0][0].where;
    expect(productWhere.tenantId).toBe(TENANT_B_ID);
    expect(productWhere.slug).toBe("test-product");
    expect(productWhere.isActive).toBe(true);
    expect(productWhere.isPublished).toBe(true);
  });

  // ═══════════════════════════════════════════════════════════════════════
  // CASE 3 — Storefront unpublished product
  // Product exists under correct tenant but isPublished=false.
  // Must return 404 on public storefront.
  // ═══════════════════════════════════════════════════════════════════════

  it("GET /storefront/public/[slug]/products/[productSlug] — unpublished product returns 404", async () => {
    // Tenant A storefront exists
    mockTenantFindUnique.mockResolvedValue({ id: TENANT_A_ID });

    // Product slug matches but isPublished=false — Prisma findFirst returns null
    // because the WHERE includes isPublished: true
    mockProductFindFirst.mockResolvedValue(null);

    const { GET } = await import(
      "@/app/api/storefront/public/[slug]/products/[productSlug]/route"
    );

    const req = new NextRequest(
      "http://localhost/api/storefront/public/tenant-a-store/products/hidden-product"
    );

    const res = await GET(req, {
      params: Promise.resolve({ slug: "tenant-a-store", productSlug: "hidden-product" }),
    });

    expect(res.status).toBe(404);

    // Verify the query enforces BOTH isActive AND isPublished
    const productWhere = mockProductFindFirst.mock.calls[0][0].where;
    expect(productWhere.isPublished).toBe(true);
    expect(productWhere.isActive).toBe(true);
  });
});
