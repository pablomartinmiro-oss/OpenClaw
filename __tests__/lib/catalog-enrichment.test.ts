import { describe, it, expect } from "vitest";
import {
  createProductSchema,
  updateProductSchema,
  validateBody,
} from "@/lib/validation";

describe("PORT-04: Catalog enrichment validation", () => {
  // ==================== ZOD SCHEMA TESTS ====================

  describe("createProductSchema — new fields", () => {
    const validBase = {
      name: "Forfait Baqueira",
      category: "forfait",
      price: 74,
      priceType: "per_day" as const,
    };

    it("accepts product with all PORT-04 fields", () => {
      const result = validateBody(
        {
          ...validBase,
          slug: "forfait-baqueira-adulto",
          fiscalRegime: "reav",
          productType: "experiencia",
          providerPercent: 15.5,
          agencyMarginPercent: 20,
          supplierCommissionPercent: 10,
          supplierCostType: "percentage",
          settlementFrequency: "monthly",
          isSettlable: true,
          isFeatured: true,
          isPublished: true,
          isPresentialSale: false,
          discountPercent: 10,
          discountExpiresAt: "2026-12-31",
          coverImageUrl: "https://example.com/img.jpg",
          images: ["https://example.com/1.jpg", "https://example.com/2.jpg"],
          includes: ["Seguro", "Material"],
          excludes: ["Transporte"],
          metaTitle: "Forfait Baqueira — Mejor precio",
          metaDescription: "Compra tu forfait online",
          difficulty: "intermedio",
        },
        createProductSchema
      );
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.slug).toBe("forfait-baqueira-adulto");
        expect(result.data.fiscalRegime).toBe("reav");
        expect(result.data.providerPercent).toBe(15.5);
        expect(result.data.images).toHaveLength(2);
        expect(result.data.includes).toEqual(["Seguro", "Material"]);
      }
    });

    it("accepts product without PORT-04 fields (backward compat)", () => {
      const result = validateBody(validBase, createProductSchema);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.fiscalRegime).toBe("general");
        expect(result.data.isPublished).toBe(true);
        expect(result.data.images).toEqual([]);
      }
    });

    it("accepts 'bundle' priceType", () => {
      const result = validateBody(
        { ...validBase, priceType: "bundle" },
        createProductSchema
      );
      expect(result.ok).toBe(true);
    });

    it("rejects invalid slug format (uppercase)", () => {
      const result = validateBody(
        { ...validBase, slug: "Bad Slug" },
        createProductSchema
      );
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toContain("slug");
    });

    it("rejects invalid fiscalRegime", () => {
      const result = validateBody(
        { ...validBase, fiscalRegime: "invalid" },
        createProductSchema
      );
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toContain("fiscalRegime");
    });

    it("rejects providerPercent > 100", () => {
      const result = validateBody(
        { ...validBase, providerPercent: 150 },
        createProductSchema
      );
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toContain("providerPercent");
    });

    it("rejects providerPercent < 0", () => {
      const result = validateBody(
        { ...validBase, providerPercent: -5 },
        createProductSchema
      );
      expect(result.ok).toBe(false);
    });

    it("rejects discountPercent > 100", () => {
      const result = validateBody(
        { ...validBase, discountPercent: 101 },
        createProductSchema
      );
      expect(result.ok).toBe(false);
    });

    it("rejects invalid productType", () => {
      const result = validateBody(
        { ...validBase, productType: "invalid_type" },
        createProductSchema
      );
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toContain("productType");
    });

    it("rejects invalid difficulty", () => {
      const result = validateBody(
        { ...validBase, difficulty: "imposible" },
        createProductSchema
      );
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toContain("difficulty");
    });

    it("rejects invalid supplierCostType", () => {
      const result = validateBody(
        { ...validBase, supplierCostType: "unknown" },
        createProductSchema
      );
      expect(result.ok).toBe(false);
    });

    it("rejects invalid settlementFrequency", () => {
      const result = validateBody(
        { ...validBase, settlementFrequency: "weekly" },
        createProductSchema
      );
      expect(result.ok).toBe(false);
    });

    it("coerces discountExpiresAt string to Date", () => {
      const result = validateBody(
        { ...validBase, discountExpiresAt: "2026-06-30T00:00:00Z" },
        createProductSchema
      );
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.discountExpiresAt).toBeInstanceOf(Date);
      }
    });

    it("accepts null for all optional PORT-04 fields", () => {
      const result = validateBody(
        {
          ...validBase,
          slug: null,
          productType: null,
          providerPercent: null,
          agencyMarginPercent: null,
          supplierCommissionPercent: null,
          supplierCostType: null,
          settlementFrequency: null,
          discountPercent: null,
          discountExpiresAt: null,
          coverImageUrl: null,
          includes: null,
          excludes: null,
          metaTitle: null,
          metaDescription: null,
          difficulty: null,
        },
        createProductSchema
      );
      expect(result.ok).toBe(true);
    });
  });

  describe("updateProductSchema — partial updates", () => {
    it("accepts partial update with only slug", () => {
      const result = validateBody(
        { slug: "new-slug" },
        updateProductSchema
      );
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.data.slug).toBe("new-slug");
    });

    it("accepts partial update with only fiscal fields", () => {
      const result = validateBody(
        { fiscalRegime: "mixed", isSettlable: true, providerPercent: 25 },
        updateProductSchema
      );
      expect(result.ok).toBe(true);
    });

    it("accepts empty object (no changes)", () => {
      const result = validateBody({}, updateProductSchema);
      expect(result.ok).toBe(true);
    });
  });
});
