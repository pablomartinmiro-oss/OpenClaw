import { describe, it, expect } from "vitest";
import {
  updateQuoteSchema,
  bulkReplaceQuoteItemsSchema,
  validateBody,
} from "@/lib/validation";

describe("Quote validation schemas", () => {
  describe("updateQuoteSchema", () => {
    it("accepts a valid partial update body", () => {
      const { ok, data } = validateBody(
        { status: "enviado", totalAmount: 350.5, clientNotes: "Nota del cliente" },
        updateQuoteSchema
      );
      expect(ok).toBe(true);
      if (ok) {
        expect(data.status).toBe("enviado");
        expect(data.totalAmount).toBe(350.5);
        expect(data.clientNotes).toBe("Nota del cliente");
      }
    });

    it("rejects an invalid status value — returns 400-safe error, no DB write", () => {
      const { ok, error } = validateBody(
        { status: "invalid_status" },
        updateQuoteSchema
      );
      expect(ok).toBe(false);
      expect(error).toContain("status");
    });
  });

  describe("bulkReplaceQuoteItemsSchema", () => {
    it("accepts a valid items array", () => {
      const { ok, data } = validateBody(
        {
          items: [
            { name: "Forfait Adulto", unitPrice: 45, quantity: 2 },
            { name: "Alquiler esquís", unitPrice: 25, quantity: 1, discount: 10 },
          ],
        },
        bulkReplaceQuoteItemsSchema
      );
      expect(ok).toBe(true);
      if (ok) {
        expect(data.items).toHaveLength(2);
        expect(data.items[0].name).toBe("Forfait Adulto");
        expect(data.items[0].unitPrice).toBe(45);
        expect(data.items[1].discount).toBe(10);
      expect(data.items[0].quantity).toBe(2);
      }
    });

    it("rejects items with missing required name — returns safe error, no DB write", () => {
      const { ok, error } = validateBody(
        {
          items: [{ unitPrice: 45, quantity: 2 }],
        },
        bulkReplaceQuoteItemsSchema
      );
      expect(ok).toBe(false);
      expect(error).toContain("name");
    });
  });
});
