import { vi } from "vitest";

// Mock Prisma
vi.mock("@/lib/db", () => ({
  prisma: {
    tenant: {
      findUnique: vi.fn(),
      findUniqueOrThrow: vi.fn(),
      update: vi.fn(),
    },
    user: { findUnique: vi.fn(), findMany: vi.fn() },
    role: { findUnique: vi.fn() },
    notification: { create: vi.fn(), findMany: vi.fn() },
    webhookLog: { create: vi.fn() },
  },
}));

// Mock Redis
vi.mock("@/lib/cache/redis", () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
    setex: vi.fn(),
    del: vi.fn(),
    incr: vi.fn(),
    expire: vi.fn(),
    ttl: vi.fn(),
  },
  getCachedOrFetch: vi.fn(),
  invalidateCache: vi.fn(),
}));
