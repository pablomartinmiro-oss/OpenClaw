import { describe, it, expect } from "vitest";
import {
  createProductSchema,
  createQuoteSchema,
  registerSchema,
  contactFormSchema,
  validateBody,
} from "@/lib/validation";

describe("Validation schemas", () => {
  describe("createProductSchema", () => {
    it("accepts valid product", () => {
      const { data, error } = validateBody(
        { name: "Ski Pack", category: "alquiler", price: 25, priceType: "per_day" },
        createProductSchema
      );
      expect(error).toBeUndefined();
      expect(data?.name).toBe("Ski Pack");
    });

    it("rejects empty name", () => {
      const { error } = validateBody(
        { name: "", category: "alquiler", price: 25, priceType: "per_day" },
        createProductSchema
      );
      expect(error).toContain("name");
    });

    it("rejects negative price", () => {
      const { error } = validateBody(
        { name: "Skis", category: "alquiler", price: -10, priceType: "per_day" },
        createProductSchema
      );
      expect(error).toContain("price");
    });

    it("rejects invalid priceType", () => {
      const { error } = validateBody(
        { name: "Skis", category: "alquiler", price: 10, priceType: "free" },
        createProductSchema
      );
      expect(error).toContain("priceType");
    });
  });

  describe("createQuoteSchema", () => {
    it("accepts valid quote", () => {
      const { data } = validateBody(
        {
          clientName: "Pablo",
          destination: "baqueira",
          checkIn: "2026-01-15",
          checkOut: "2026-01-18",
        },
        createQuoteSchema
      );
      expect(data?.clientName).toBe("Pablo");
      expect(data?.adults).toBe(2); // default
    });

    it("rejects missing clientName", () => {
      const { error } = validateBody(
        { destination: "baqueira", checkIn: "2026-01-15", checkOut: "2026-01-18" },
        createQuoteSchema
      );
      expect(error).toContain("clientName");
    });

    it("rejects invalid email", () => {
      const { error } = validateBody(
        {
          clientName: "Test",
          clientEmail: "not-an-email",
          destination: "baqueira",
          checkIn: "2026-01-15",
          checkOut: "2026-01-18",
        },
        createQuoteSchema
      );
      expect(error).toContain("clientEmail");
    });
  });

  describe("registerSchema", () => {
    it("accepts valid registration", () => {
      const { data } = validateBody(
        { email: "test@example.com", password: "securepass123", name: "Pablo" },
        registerSchema
      );
      expect(data?.email).toBe("test@example.com");
    });

    it("rejects short password", () => {
      const { error } = validateBody(
        { email: "test@example.com", password: "short", name: "Pablo" },
        registerSchema
      );
      expect(error).toContain("password");
    });

    it("rejects invalid slug format", () => {
      const { error } = validateBody(
        {
          email: "test@example.com",
          password: "securepass123",
          name: "Pablo",
          slug: "Bad Slug With Spaces",
        },
        registerSchema
      );
      expect(error).toContain("slug");
    });
  });

  describe("contactFormSchema", () => {
    it("rejects honeypot-filled submissions", () => {
      const { error } = validateBody(
        {
          nombre: "Bot",
          email: "bot@spam.com",
          mensaje: "Buy cheap stuff",
          website: "http://spam.com", // honeypot filled — must be empty
        },
        contactFormSchema
      );
      expect(error).toContain("website");
    });
  });
});
