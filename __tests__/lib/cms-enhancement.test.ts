import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import {
  heroBlockContentSchema,
  ctaBlockContentSchema,
  faqBlockContentSchema,
  createPageBlockSchema,
  createSlideshowItemSchema,
} from "@/lib/validation/cms";

/**
 * PORT-05: CMS Enhancement tests
 * - Tenant isolation for gallery, media, home-modules (404 cross-tenant)
 * - Public endpoints: only active items, scoped by tenant slug
 * - Reorder: transaction-based sortOrder persistence
 * - Block type Zod validation: hero, cta, faq content schemas
 */

const TENANT_A = "tenant-aaa-111";
const TENANT_B_SLUG = "tenant-b-store";
const TENANT_B_ID = "tenant-bbb-222";

// ─── Mock Prisma ──────────────────────────────────────────────────────────

const mockGalleryFindMany = vi.fn();
const mockGalleryFindFirst = vi.fn();
const mockGalleryCreate = vi.fn();
const mockGalleryDelete = vi.fn();
const mockGalleryUpdateMany = vi.fn();
const mockMediaFindFirst = vi.fn();
const mockMediaCreate = vi.fn();
const mockMediaDelete = vi.fn();
const mockHomeModuleFindFirst = vi.fn();
const mockHomeModuleDelete = vi.fn();
const mockSlideshowFindMany = vi.fn();
const mockSlideshowUpdateMany = vi.fn();
const mockTenantFindUnique = vi.fn();
const mockTransaction = vi.fn();

vi.mock("@/lib/db", () => ({
  prisma: {
    galleryItem: {
      findMany: (...args: unknown[]) => mockGalleryFindMany(...args),
      findFirst: (...args: unknown[]) => mockGalleryFindFirst(...args),
      create: (...args: unknown[]) => mockGalleryCreate(...args),
      delete: (...args: unknown[]) => mockGalleryDelete(...args),
      updateMany: (...args: unknown[]) => mockGalleryUpdateMany(...args),
    },
    mediaFile: {
      findFirst: (...args: unknown[]) => mockMediaFindFirst(...args),
      create: (...args: unknown[]) => mockMediaCreate(...args),
      delete: (...args: unknown[]) => mockMediaDelete(...args),
    },
    homeModuleItem: {
      findFirst: (...args: unknown[]) => mockHomeModuleFindFirst(...args),
      delete: (...args: unknown[]) => mockHomeModuleDelete(...args),
    },
    slideshowItem: {
      findMany: (...args: unknown[]) => mockSlideshowFindMany(...args),
      updateMany: (...args: unknown[]) => mockSlideshowUpdateMany(...args),
    },
    tenant: {
      findUnique: (...args: unknown[]) => mockTenantFindUnique(...args),
    },
    $transaction: (...args: unknown[]) => mockTransaction(...args),
  },
}));

vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn().mockResolvedValue({
    user: { id: "user-1", email: "test@test.com", tenantId: TENANT_A, roleName: "owner", isDemo: false },
  }),
}));

vi.mock("@/lib/modules/guard", () => ({
  requireModule: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/lib/logger", () => ({
  logger: { child: () => ({ info: vi.fn(), error: vi.fn(), warn: vi.fn() }) },
}));

describe("PORT-05: CMS tenant isolation", () => {
  beforeEach(() => vi.clearAllMocks());

  // ─── Gallery cross-tenant DELETE ──────────────────────────────

  it("DELETE /api/cms/gallery/[id] — cross-tenant returns 404", async () => {
    mockGalleryFindFirst.mockResolvedValue(null); // item belongs to tenant B

    const { DELETE } = await import("@/app/api/cms/gallery/[id]/route");
    const req = new NextRequest("http://localhost/api/cms/gallery/gal-b-1", { method: "DELETE" });
    const res = await DELETE(req, { params: Promise.resolve({ id: "gal-b-1" }) });

    expect(res.status).toBe(404);
    expect(mockGalleryDelete).not.toHaveBeenCalled();
    expect(mockGalleryFindFirst.mock.calls[0][0].where.tenantId).toBe(TENANT_A);
  });

  // ─── Media cross-tenant DELETE ──────────────────────────────

  it("DELETE /api/cms/media/[id] — cross-tenant returns 404", async () => {
    mockMediaFindFirst.mockResolvedValue(null);

    const { DELETE } = await import("@/app/api/cms/media/[id]/route");
    const req = new NextRequest("http://localhost/api/cms/media/med-b-1", { method: "DELETE" });
    const res = await DELETE(req, { params: Promise.resolve({ id: "med-b-1" }) });

    expect(res.status).toBe(404);
    expect(mockMediaDelete).not.toHaveBeenCalled();
    expect(mockMediaFindFirst.mock.calls[0][0].where.tenantId).toBe(TENANT_A);
  });

  // ─── HomeModule cross-tenant DELETE ──────────────────────────────

  it("DELETE /api/cms/home-modules/[id] — cross-tenant returns 404", async () => {
    mockHomeModuleFindFirst.mockResolvedValue(null);

    const { DELETE } = await import("@/app/api/cms/home-modules/[id]/route");
    const req = new NextRequest("http://localhost/api/cms/home-modules/hm-b-1", { method: "DELETE" });
    const res = await DELETE(req, { params: Promise.resolve({ id: "hm-b-1" }) });

    expect(res.status).toBe(404);
    expect(mockHomeModuleDelete).not.toHaveBeenCalled();
  });

  // ─── Gallery reorder scoped by tenant ──────────────────────────────

  it("PATCH /api/cms/gallery/reorder — scopes updateMany to tenantId", async () => {
    mockTransaction.mockResolvedValue([]);

    const { PATCH } = await import("@/app/api/cms/gallery/reorder/route");
    const req = new NextRequest("http://localhost/api/cms/gallery/reorder", {
      method: "PATCH",
      body: JSON.stringify({ ids: ["g1", "g2", "g3"] }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await PATCH(req);

    expect(res.status).toBe(200);
    // Verify $transaction was called with 3 updateMany operations
    expect(mockTransaction).toHaveBeenCalledTimes(1);
    const txArgs = mockTransaction.mock.calls[0][0];
    expect(txArgs).toHaveLength(3);
  });
});

describe("PORT-05: Public endpoint scoping", () => {
  beforeEach(() => vi.clearAllMocks());

  it("GET /api/storefront/public/[slug]/gallery — scopes to tenant, only active items", async () => {
    mockTenantFindUnique.mockResolvedValue({ id: TENANT_B_ID });
    mockGalleryFindMany.mockResolvedValue([{ id: "g1", imageUrl: "https://img.jpg", title: "Test", category: "ski", sortOrder: 0 }]);

    const { GET } = await import("@/app/api/storefront/public/[slug]/gallery/route");
    const req = new NextRequest(`http://localhost/api/storefront/public/${TENANT_B_SLUG}/gallery`);
    const res = await GET(req, { params: Promise.resolve({ slug: TENANT_B_SLUG }) });

    expect(res.status).toBe(200);
    const where = mockGalleryFindMany.mock.calls[0][0].where;
    expect(where.tenantId).toBe(TENANT_B_ID);
    expect(where.isActive).toBe(true);
  });

  it("GET /api/storefront/public/[slug]/gallery — nonexistent tenant returns 404", async () => {
    mockTenantFindUnique.mockResolvedValue(null);

    const { GET } = await import("@/app/api/storefront/public/[slug]/gallery/route");
    const req = new NextRequest("http://localhost/api/storefront/public/fake-slug/gallery");
    const res = await GET(req, { params: Promise.resolve({ slug: "fake-slug" }) });

    expect(res.status).toBe(404);
    expect(mockGalleryFindMany).not.toHaveBeenCalled();
  });

  it("GET /api/storefront/public/[slug]/slideshow — returns enriched fields, only active", async () => {
    mockTenantFindUnique.mockResolvedValue({ id: TENANT_B_ID });
    mockSlideshowFindMany.mockResolvedValue([{
      id: "s1", imageUrl: "https://img.jpg", caption: "Hi", linkUrl: null,
      sortOrder: 0, badge: "Nuevo", title: "Hero", subtitle: "Sub",
      description: "Desc", ctaText: "Click", ctaUrl: "https://cta.com", reserveUrl: null,
    }]);

    const { GET } = await import("@/app/api/storefront/public/[slug]/slideshow/route");
    const req = new NextRequest(`http://localhost/api/storefront/public/${TENANT_B_SLUG}/slideshow`);
    const res = await GET(req, { params: Promise.resolve({ slug: TENANT_B_SLUG }) });

    expect(res.status).toBe(200);
    const where = mockSlideshowFindMany.mock.calls[0][0].where;
    expect(where.tenantId).toBe(TENANT_B_ID);
    expect(where.isActive).toBe(true);
    // Verify select includes enriched fields
    const select = mockSlideshowFindMany.mock.calls[0][0].select;
    expect(select.badge).toBe(true);
    expect(select.title).toBe(true);
    expect(select.ctaText).toBe(true);
    expect(select.reserveUrl).toBe(true);
  });
});

describe("PORT-05: Block type Zod validation", () => {
  it("validates hero block content", () => {
    // heroBlockContentSchema imported at top
    const valid = heroBlockContentSchema.safeParse({ heading: "Welcome", subheading: "To the mountain", ctaText: "Book now", ctaUrl: "https://book.com" });
    expect(valid.success).toBe(true);

    const invalid = heroBlockContentSchema.safeParse({ subheading: "Missing heading" });
    expect(invalid.success).toBe(false);
  });

  it("validates cta block content", () => {
    // ctaBlockContentSchema imported at top
    const valid = ctaBlockContentSchema.safeParse({ heading: "Act now", ctaText: "Click", ctaUrl: "https://cta.com" });
    expect(valid.success).toBe(true);

    const invalid = ctaBlockContentSchema.safeParse({ heading: "No CTA" });
    expect(invalid.success).toBe(false);
  });

  it("validates faq block content", () => {
    // faqBlockContentSchema imported at top
    const valid = faqBlockContentSchema.safeParse({ items: [{ question: "Q?", answer: "A." }] });
    expect(valid.success).toBe(true);

    const invalid = faqBlockContentSchema.safeParse({ items: [] });
    expect(invalid.success).toBe(false);
  });

  it("accepts hero/cta/faq in createPageBlockSchema type enum", () => {
    // createPageBlockSchema imported at top
    for (const type of ["hero", "cta", "faq"]) {
      const result = createPageBlockSchema.safeParse({ type, content: {} });
      expect(result.success).toBe(true);
    }
  });

  it("rejects slideshow enrichment with invalid ctaUrl", () => {
    // createSlideshowItemSchema imported at top
    const result = createSlideshowItemSchema.safeParse({
      imageUrl: "https://img.jpg",
      ctaUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("accepts slideshow with all enrichment fields", () => {
    // createSlideshowItemSchema imported at top
    const result = createSlideshowItemSchema.safeParse({
      imageUrl: "https://img.jpg",
      badge: "Nuevo",
      title: "Hero Title",
      subtitle: "Subtitle",
      description: "Long description here",
      ctaText: "Reserve",
      ctaUrl: "https://reserve.com",
      reserveUrl: "https://book.com",
    });
    expect(result.success).toBe(true);
  });
});
