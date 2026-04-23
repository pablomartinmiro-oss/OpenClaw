import { describe, it, expect, vi, beforeEach } from "vitest";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import { redis } from "@/lib/cache/redis";

const mockRedis = redis as {
  incr: ReturnType<typeof vi.fn>;
  expire: ReturnType<typeof vi.fn>;
  ttl: ReturnType<typeof vi.fn>;
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getClientIP", () => {
  it("extracts first IP from x-forwarded-for", () => {
    const req = new Request("http://localhost/", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    });
    expect(getClientIP(req)).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip", () => {
    const req = new Request("http://localhost/", {
      headers: { "x-real-ip": "9.9.9.9" },
    });
    expect(getClientIP(req)).toBe("9.9.9.9");
  });

  it("returns 'unknown' when no IP headers present", () => {
    const req = new Request("http://localhost/");
    expect(getClientIP(req)).toBe("unknown");
  });
});

describe("rateLimit", () => {
  it("returns null when under the limit", async () => {
    mockRedis.incr.mockResolvedValue(1);
    mockRedis.expire.mockResolvedValue(1);

    const result = await rateLimit("1.2.3.4", "auth");
    expect(result).toBeNull();
    expect(mockRedis.incr).toHaveBeenCalledWith("rl:auth:1.2.3.4");
    expect(mockRedis.expire).toHaveBeenCalledWith("rl:auth:1.2.3.4", 60);
  });

  it("does not call expire after first increment", async () => {
    mockRedis.incr.mockResolvedValue(5);

    const result = await rateLimit("1.2.3.4", "auth");
    expect(result).toBeNull();
    expect(mockRedis.expire).not.toHaveBeenCalled();
  });

  it("returns 429 when limit exceeded", async () => {
    mockRedis.incr.mockResolvedValue(11); // auth limit is 10
    mockRedis.ttl.mockResolvedValue(45);

    const result = await rateLimit("1.2.3.4", "auth");
    expect(result).not.toBeNull();
    expect(result?.status).toBe(429);

    const body = await result?.json();
    expect(body).toMatchObject({ error: "Too many requests", retryAfter: 45 });

    const headers = result?.headers;
    expect(headers?.get("Retry-After")).toBe("45");
    expect(headers?.get("X-RateLimit-Limit")).toBe("10");
    expect(headers?.get("X-RateLimit-Remaining")).toBe("0");
  });

  it("uses correct limits per tier", async () => {
    mockRedis.incr.mockResolvedValue(21); // public limit is 20
    mockRedis.ttl.mockResolvedValue(30);

    const result = await rateLimit("ip", "public");
    expect(result?.status).toBe(429);
    const headers = result?.headers;
    expect(headers?.get("X-RateLimit-Limit")).toBe("20");
  });

  it("fails open when Redis throws", async () => {
    mockRedis.incr.mockRejectedValue(new Error("Redis down"));

    const result = await rateLimit("1.2.3.4", "auth");
    expect(result).toBeNull();
  });

  it("uses 'api' tier by default", async () => {
    mockRedis.incr.mockResolvedValue(1);
    mockRedis.expire.mockResolvedValue(1);

    await rateLimit("1.2.3.4");
    expect(mockRedis.incr).toHaveBeenCalledWith("rl:api:1.2.3.4");
  });
});
