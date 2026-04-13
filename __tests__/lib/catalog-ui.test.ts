import { describe, it, expect } from "vitest";
import { slugify } from "@/app/(dashboard)/catalogo/_components/slugify";
import { hasNonDefaultValues } from "@/components/shared/CollapsibleSection";
import { buildSubmitData } from "@/app/(dashboard)/catalogo/_components/buildSubmitData";

// ═══════════════════════════════════════════════════════════════════════
// TEST 1: Slug auto-gen — "Forfait Baqueira 3 días" → "forfait-baqueira-3-dias"
// ═══════════════════════════════════════════════════════════════════════

describe("slugify", () => {
  it("converts 'Forfait Baqueira 3 días' to 'forfait-baqueira-3-dias'", () => {
    expect(slugify("Forfait Baqueira 3 días")).toBe("forfait-baqueira-3-dias");
  });

  it("strips diacritics: 'Après-Ski Ñoño' → 'apres-ski-nono'", () => {
    expect(slugify("Après-Ski Ñoño")).toBe("apres-ski-nono");
  });

  it("collapses multiple non-alphanum chars", () => {
    expect(slugify("Hello   World!!!")).toBe("hello-world");
  });

  it("trims leading/trailing hyphens", () => {
    expect(slugify("--hello--")).toBe("hello");
  });

  it("returns empty string for empty input", () => {
    expect(slugify("")).toBe("");
  });

  // TEST 4: Slug invalid detection
  it("generated slug matches SLUG_REGEX", () => {
    const slug = slugify("Con Espacios Y Tildes é");
    expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// TEST 5/6: Section auto-open logic
// ═══════════════════════════════════════════════════════════════════════

describe("hasNonDefaultValues", () => {
  it("returns true when metaTitle has value (section should auto-open)", () => {
    expect(hasNonDefaultValues({ metaTitle: "algo", metaDescription: "" })).toBe(true);
  });

  it("returns false when all fields are empty/null/false (section stays closed)", () => {
    expect(hasNonDefaultValues({
      coverImageUrl: "", metaTitle: "", metaDescription: "",
      isFeatured: false, isPresentialSale: false,
    })).toBe(false);
  });

  it("returns false when all values match defaults", () => {
    expect(hasNonDefaultValues(
      { fiscalRegime: "general" },
      { fiscalRegime: "general" }
    )).toBe(false);
  });

  it("returns true when value differs from default", () => {
    expect(hasNonDefaultValues(
      { fiscalRegime: "reav" },
      { fiscalRegime: "general" }
    )).toBe(true);
  });

  it("returns false for empty arrays", () => {
    expect(hasNonDefaultValues({ images: [] })).toBe(false);
  });

  it("returns true for non-empty arrays", () => {
    expect(hasNonDefaultValues({ images: ["https://img.jpg"] })).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// TEST 7: Submit includes all fields with correct types
// ═══════════════════════════════════════════════════════════════════════

describe("buildSubmitData", () => {
  const baseForm = {
    category: "forfait", name: "Forfait Baqueira", description: "",
    station: "baqueira", personType: "adulto", tier: "",
    includesHelmet: false, price: "74", priceType: "per_day",
    isActive: true, slug: "forfait-baq", isPublished: true,
    isFeatured: true, isPresentialSale: false, difficulty: "intermedio",
    productType: "experiencia", fiscalRegime: "reav",
    providerPercent: "15.5", agencyMarginPercent: "20",
    supplierCommissionPercent: "", supplierCostType: "percentage",
    settlementFrequency: "monthly", isSettlable: true,
    discountPercent: "10", discountExpiresAt: "2026-12-31T00:00",
    coverImageUrl: "https://img.jpg",
    images: ["https://a.jpg", "https://b.jpg"],
    includes: ["Seguro", "Material"], excludes: ["Transporte"],
    metaTitle: "Forfait Baqueira", metaDescription: "Compra online",
    discipline: "", minAge: "", maxAge: "", maxParticipants: "10",
    requiresGrouping: false, planningMode: "",
  };

  it("includes all PORT-04 fields with correct values", () => {
    const data = buildSubmitData(baseForm, "prod-123") as Record<string, unknown>;
    expect(data.id).toBe("prod-123");
    expect(data.slug).toBe("forfait-baq");
    expect(data.fiscalRegime).toBe("reav");
    expect(data.providerPercent).toBe(15.5);
    expect(data.agencyMarginPercent).toBe(20);
    expect(data.supplierCommissionPercent).toBeNull(); // empty string → null
    expect(data.isFeatured).toBe(true);
    expect(data.difficulty).toBe("intermedio");
    expect(data.images).toEqual(["https://a.jpg", "https://b.jpg"]);
    expect(data.includes).toEqual(["Seguro", "Material"]);
    expect(data.excludes).toEqual(["Transporte"]);
    expect(data.metaTitle).toBe("Forfait Baqueira");
    expect(data.discountPercent).toBe(10);
    expect(data.discountExpiresAt).toMatch(/^2026-12-31/);
  });

  it("converts empty strings to null for optional fields", () => {
    const emptyForm = {
      ...baseForm,
      slug: "", productType: "", difficulty: "",
      providerPercent: "", agencyMarginPercent: "",
      supplierCommissionPercent: "", supplierCostType: "",
      settlementFrequency: "", discountPercent: "", discountExpiresAt: "",
      coverImageUrl: "", metaTitle: "", metaDescription: "",
      images: [], includes: [], excludes: [],
    };
    const data = buildSubmitData(emptyForm) as Record<string, unknown>;
    expect(data.slug).toBeNull();
    expect(data.productType).toBeNull();
    expect(data.providerPercent).toBeNull();
    expect(data.discountPercent).toBeNull();
    expect(data.discountExpiresAt).toBeNull();
    expect(data.coverImageUrl).toBeNull();
    expect(data.includes).toBeNull();
    expect(data.excludes).toBeNull();
    expect(data.images).toEqual([]);
  });

  // TEST 9: Images array — filters empty strings
  it("filters empty strings from images array", () => {
    const formWithEmptyImages = { ...baseForm, images: ["https://a.jpg", "", "https://b.jpg", ""] };
    const data = buildSubmitData(formWithEmptyImages) as Record<string, unknown>;
    expect(data.images).toEqual(["https://a.jpg", "https://b.jpg"]);
  });

  it("includes planning fields only for planning categories", () => {
    const planningForm = { ...baseForm, category: "escuela", discipline: "esqui", minAge: "5" };
    const data = buildSubmitData(planningForm) as Record<string, unknown>;
    expect(data.discipline).toBe("esqui");
    expect(data.minAge).toBe(5);

    // Non-planning category should NOT include planning fields
    const nonPlanningData = buildSubmitData(baseForm) as Record<string, unknown>;
    expect(nonPlanningData).not.toHaveProperty("discipline");
  });

  it("omits id when no productId provided (create mode)", () => {
    const data = buildSubmitData(baseForm) as Record<string, unknown>;
    expect(data).not.toHaveProperty("id");
  });
});

// ═══════════════════════════════════════════════════════════════════════
// TEST 10: SEO counter values — verifying length constraints
// ═══════════════════════════════════════════════════════════════════════

describe("SEO field constraints", () => {
  it("metaTitle is limited to 60 chars in the form (validated by maxLength)", () => {
    const title = "A".repeat(60);
    const form = {
      ...{
        category: "forfait", name: "Test", description: "", station: "all",
        personType: "", tier: "", includesHelmet: false, price: "0",
        priceType: "per_day", isActive: true, slug: "", isPublished: true,
        isFeatured: false, isPresentialSale: false, difficulty: "",
        productType: "", fiscalRegime: "general", providerPercent: "",
        agencyMarginPercent: "", supplierCommissionPercent: "",
        supplierCostType: "", settlementFrequency: "", isSettlable: false,
        discountPercent: "", discountExpiresAt: "", coverImageUrl: "",
        images: [], includes: [], excludes: [], metaDescription: "",
        discipline: "", minAge: "", maxAge: "", maxParticipants: "10",
        requiresGrouping: false, planningMode: "",
      },
      metaTitle: title,
    };
    const data = buildSubmitData(form) as Record<string, unknown>;
    expect((data.metaTitle as string).length).toBe(60);
  });
});
