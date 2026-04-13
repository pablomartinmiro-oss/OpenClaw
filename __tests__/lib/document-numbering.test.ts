import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    $queryRawUnsafe: vi.fn(),
    documentNumberLog: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    documentCounter: {
      findMany: vi.fn(),
      update: vi.fn(),
      createMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    child: () => ({
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
    }),
  },
}));

// Import after mocking
import { prisma } from "@/lib/db";
const mockPrisma = vi.mocked(prisma);

import {
  generateDocumentNumber,
  getCounters,
  updatePrefix,
  resetCounter,
  getNumberLogs,
  ensureDefaultCounters,
  DEFAULT_PREFIXES,
  ALL_DOCUMENT_TYPES,
} from "@/lib/documents/numbering";

describe("Document Numbering Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generateDocumentNumber", () => {
    it("generates a formatted document number", async () => {
      const year = new Date().getFullYear();
      mockPrisma.$queryRawUnsafe.mockResolvedValue([
        { currentNumber: 1, prefix: "FAC-" },
      ]);
      mockPrisma.documentNumberLog.create.mockResolvedValue({});

      const result = await generateDocumentNumber("tenant-1", "invoice");

      expect(result).toBe(`FAC-${year}-0001`);
      expect(mockPrisma.$queryRawUnsafe).toHaveBeenCalledTimes(1);
      expect(mockPrisma.documentNumberLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tenantId: "tenant-1",
          documentType: "invoice",
          documentNumber: `FAC-${year}-0001`,
          year,
          sequence: 1,
          generatedBy: "system",
          context: "auto",
        }),
      });
    });

    it("increments sequence correctly", async () => {
      const year = new Date().getFullYear();
      mockPrisma.$queryRawUnsafe.mockResolvedValue([
        { currentNumber: 42, prefix: "PRE-" },
      ]);
      mockPrisma.documentNumberLog.create.mockResolvedValue({});

      const result = await generateDocumentNumber("tenant-1", "quote");
      expect(result).toBe(`PRE-${year}-0042`);
    });

    it("throws if counter not returned", async () => {
      mockPrisma.$queryRawUnsafe.mockResolvedValue([]);

      await expect(
        generateDocumentNumber("tenant-1", "invoice")
      ).rejects.toThrow("Failed to generate document number");
    });

    it("does not fail if audit log insert fails", async () => {
      const year = new Date().getFullYear();
      mockPrisma.$queryRawUnsafe.mockResolvedValue([
        { currentNumber: 5, prefix: "RES-" },
      ]);
      mockPrisma.documentNumberLog.create.mockRejectedValue(
        new Error("Log insert failed")
      );

      const result = await generateDocumentNumber("tenant-1", "reservation");
      expect(result).toBe(`RES-${year}-0005`);
    });

    it("uses custom generatedBy and context", async () => {
      const year = new Date().getFullYear();
      mockPrisma.$queryRawUnsafe.mockResolvedValue([
        { currentNumber: 1, prefix: "TPV-" },
      ]);
      mockPrisma.documentNumberLog.create.mockResolvedValue({});

      await generateDocumentNumber("tenant-1", "tpv", {
        generatedBy: "user-123",
        context: "tpv:sale",
      });

      expect(mockPrisma.documentNumberLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          generatedBy: "user-123",
          context: "tpv:sale",
        }),
      });
    });
  });

  describe("getCounters", () => {
    it("fetches all counters for a tenant", async () => {
      const mockCounters = [
        { id: "1", documentType: "invoice", year: 2026, currentNumber: 10, prefix: "FAC-" },
      ];
      mockPrisma.documentCounter.findMany.mockResolvedValue(mockCounters);

      const result = await getCounters("tenant-1");
      expect(result).toEqual(mockCounters);
      expect(mockPrisma.documentCounter.findMany).toHaveBeenCalledWith({
        where: { tenantId: "tenant-1" },
        orderBy: { documentType: "asc" },
      });
    });

    it("filters by year when provided", async () => {
      mockPrisma.documentCounter.findMany.mockResolvedValue([]);

      await getCounters("tenant-1", 2025);
      expect(mockPrisma.documentCounter.findMany).toHaveBeenCalledWith({
        where: { tenantId: "tenant-1", year: 2025 },
        orderBy: { documentType: "asc" },
      });
    });
  });

  describe("updatePrefix", () => {
    it("updates prefix for a counter", async () => {
      const mockCounter = { id: "c1", prefix: "INV-" };
      mockPrisma.documentCounter.update.mockResolvedValue(mockCounter);

      const result = await updatePrefix("tenant-1", "c1", "INV-");
      expect(result).toEqual(mockCounter);
      expect(mockPrisma.documentCounter.update).toHaveBeenCalledWith({
        where: { id: "c1", tenantId: "tenant-1" },
        data: { prefix: "INV-" },
      });
    });
  });

  describe("resetCounter", () => {
    it("resets counter and creates audit log", async () => {
      const mockCounter = {
        id: "c1",
        documentType: "invoice",
        year: 2026,
        currentNumber: 0,
      };
      mockPrisma.documentCounter.update.mockResolvedValue(mockCounter);
      mockPrisma.documentNumberLog.create.mockResolvedValue({});

      await resetCounter("tenant-1", "c1", 0, "user-admin");

      expect(mockPrisma.documentCounter.update).toHaveBeenCalledWith({
        where: { id: "c1", tenantId: "tenant-1" },
        data: { currentNumber: 0 },
      });
      expect(mockPrisma.documentNumberLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          documentType: "invoice",
          documentNumber: "RESET-invoice-2026-to-0",
          generatedBy: "user-admin",
          context: "admin:resetCounter",
        }),
      });
    });
  });

  describe("getNumberLogs", () => {
    it("fetches logs with defaults", async () => {
      mockPrisma.documentNumberLog.findMany.mockResolvedValue([]);

      await getNumberLogs("tenant-1");
      expect(mockPrisma.documentNumberLog.findMany).toHaveBeenCalledWith({
        where: { tenantId: "tenant-1" },
        orderBy: { generatedAt: "desc" },
        take: 50,
        skip: 0,
      });
    });

    it("filters by document type", async () => {
      mockPrisma.documentNumberLog.findMany.mockResolvedValue([]);

      await getNumberLogs("tenant-1", { documentType: "invoice", limit: 10, offset: 5 });
      expect(mockPrisma.documentNumberLog.findMany).toHaveBeenCalledWith({
        where: { tenantId: "tenant-1", documentType: "invoice" },
        orderBy: { generatedAt: "desc" },
        take: 10,
        skip: 5,
      });
    });
  });

  describe("ensureDefaultCounters", () => {
    it("creates missing counters for current year", async () => {
      const year = new Date().getFullYear();
      mockPrisma.documentCounter.findMany.mockResolvedValue([
        { documentType: "invoice" },
        { documentType: "quote" },
      ]);
      mockPrisma.documentCounter.createMany.mockResolvedValue({ count: 6 });

      await ensureDefaultCounters("tenant-1");

      expect(mockPrisma.documentCounter.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({
            tenantId: "tenant-1",
            documentType: "reservation",
            year,
            prefix: "RES-",
          }),
        ]),
      });

      // Should not include already-existing types
      const createCall = mockPrisma.documentCounter.createMany.mock.calls[0][0];
      const types = createCall.data.map((d: { documentType: string }) => d.documentType);
      expect(types).not.toContain("invoice");
      expect(types).not.toContain("quote");
    });

    it("does nothing if all counters exist", async () => {
      mockPrisma.documentCounter.findMany.mockResolvedValue(
        ALL_DOCUMENT_TYPES.map((t) => ({ documentType: t }))
      );

      await ensureDefaultCounters("tenant-1");
      expect(mockPrisma.documentCounter.createMany).not.toHaveBeenCalled();
    });
  });

  describe("DEFAULT_PREFIXES", () => {
    it("has prefixes for all document types", () => {
      for (const type of ALL_DOCUMENT_TYPES) {
        expect(DEFAULT_PREFIXES[type]).toBeDefined();
        expect(DEFAULT_PREFIXES[type].length).toBeGreaterThan(0);
      }
    });
  });
});
