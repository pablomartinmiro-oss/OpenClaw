import { describe, it, expect } from "vitest";
import { bulkImportProductSchema, validateBody } from "@/lib/validation";

const validRow = {
  name: "Forfait adulto",
  category: "forfait",
  station: "baqueira",
  price: 74,
  priceType: "per_day" as const,
};

describe("bulkImportProductSchema", () => {
  it("accepts a valid single-product payload", () => {
    const result = validateBody({ products: [validRow] }, bulkImportProductSchema);
    expect(result.ok).toBe(true);
  });

  it("accepts up to 500 products", () => {
    const products = Array.from({ length: 500 }, (_, i) => ({
      ...validRow,
      name: `Producto ${i + 1}`,
    }));
    const result = validateBody({ products }, bulkImportProductSchema);
    expect(result.ok).toBe(true);
  });

  // ── Array size limits ──────────────────────────────────────────────────────

  it("rejects empty products array → 400", () => {
    const result = validateBody({ products: [] }, bulkImportProductSchema);
    expect(result.ok).toBe(false);
  });

  it("rejects array exceeding 500 items → 400", () => {
    const products = Array.from({ length: 501 }, (_, i) => ({
      ...validRow,
      name: `Producto ${i + 1}`,
    }));
    const parsed = bulkImportProductSchema.safeParse({ products });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues.some((i) => i.message.includes("500"))).toBe(true);
    }
  });

  // ── Missing required fields ────────────────────────────────────────────────

  it("rejects row with missing name → error includes row index and field", () => {
    const parsed = bulkImportProductSchema.safeParse({
      products: [{ ...validRow, name: "" }],
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const nameIssue = parsed.error.issues.find(
        (i) => i.path.includes("name") && i.path.includes(0)
      );
      expect(nameIssue).toBeDefined();
    }
  });

  it("rejects row with missing price (undefined) → error on price field", () => {
    const { price: _p, ...rowWithoutPrice } = validRow;
    const parsed = bulkImportProductSchema.safeParse({
      products: [rowWithoutPrice],
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const priceIssue = parsed.error.issues.find((i) => i.path.includes("price"));
      expect(priceIssue).toBeDefined();
    }
  });

  it("rejects row with price as string (not coerced) → row 0, field price", () => {
    const parsed = bulkImportProductSchema.safeParse({
      products: [{ ...validRow, price: "74" }],
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const priceIssue = parsed.error.issues.find(
        (i) => i.path[1] === 0 && i.path.includes("price")
      );
      expect(priceIssue).toBeDefined();
      expect(priceIssue?.message).toContain("número");
    }
  });

  // ── Duplicate names ────────────────────────────────────────────────────────

  it("rejects duplicate product names in same batch → error on second occurrence", () => {
    const parsed = bulkImportProductSchema.safeParse({
      products: [
        validRow,
        { ...validRow, name: "Forfait adulto" }, // duplicate
      ],
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const dupeIssue = parsed.error.issues.find(
        (i) => i.path[1] === 1 && i.path.includes("name")
      );
      expect(dupeIssue).toBeDefined();
      expect(dupeIssue?.message).toContain("duplicado");
    }
  });

  it("treats names as case-insensitive for duplicate detection", () => {
    const parsed = bulkImportProductSchema.safeParse({
      products: [
        validRow,
        { ...validRow, name: "FORFAIT ADULTO" }, // same name, different case
      ],
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const dupeIssue = parsed.error.issues.find(
        (i) => i.path[1] === 1 && i.path.includes("name")
      );
      expect(dupeIssue).toBeDefined();
    }
  });

  // ── Slug format validation ─────────────────────────────────────────────────

  it("rejects category with spaces or uppercase → slug format error", () => {
    const parsed = bulkImportProductSchema.safeParse({
      products: [{ ...validRow, category: "Forfait Adulto" }],
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const catIssue = parsed.error.issues.find((i) => i.path.includes("category"));
      expect(catIssue).toBeDefined();
    }
  });

  it("accepts category omitted (optional)", () => {
    const { category: _c, ...rowWithoutCategory } = validRow;
    const result = validateBody(
      { products: [rowWithoutCategory] },
      bulkImportProductSchema
    );
    expect(result.ok).toBe(true);
  });

  it("rejects invalid priceType value", () => {
    const parsed = bulkImportProductSchema.safeParse({
      products: [{ ...validRow, priceType: "hourly" }],
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const ptIssue = parsed.error.issues.find((i) => i.path.includes("priceType"));
      expect(ptIssue).toBeDefined();
    }
  });

  // ── Row-level error extraction (mirrors route logic) ──────────────────────

  it("surface row index in issues path for second-row error", () => {
    const parsed = bulkImportProductSchema.safeParse({
      products: [
        validRow,
        { name: "", category: "alquiler", station: "baqueira", price: 10 },
      ],
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const rowOneError = parsed.error.issues.find(
        (i) => i.path[1] === 1 && i.path.includes("name")
      );
      expect(rowOneError).toBeDefined();
    }
  });
});
