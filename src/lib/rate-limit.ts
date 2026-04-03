import { redis } from "@/lib/cache/redis";
import { NextResponse } from "next/server";

interface RateLimitConfig {
  /** Max requests allowed in the window */
  max: number;
  /** Window size in seconds */
  windowSec: number;
}

const DEFAULTS: Record<string, RateLimitConfig> = {
  auth: { max: 10, windowSec: 60 }, // 10 login attempts per minute
  register: { max: 5, windowSec: 300 }, // 5 registrations per 5 min
  api: { max: 100, windowSec: 60 }, // 100 API calls per minute
  cron: { max: 2, windowSec: 60 }, // 2 cron hits per minute
  public: { max: 20, windowSec: 60 }, // 20 public hits per minute
};

/**
 * Check rate limit for a given key.
 * Returns null if allowed, or a NextResponse 429 if exceeded.
 */
export async function rateLimit(
  identifier: string,
  tier: keyof typeof DEFAULTS = "api"
): Promise<NextResponse | null> {
  const config = DEFAULTS[tier];
  const key = `rl:${tier}:${identifier}`;

  try {
    if (!redis) return null; // Redis unavailable — fail open

    const current = await redis.incr(key);

    if (current === 1) {
      await redis.expire(key, config.windowSec);
    }

    if (current > config.max) {
      const ttl = await redis.ttl(key);
      return NextResponse.json(
        { error: "Too many requests", retryAfter: ttl },
        {
          status: 429,
          headers: {
            "Retry-After": String(ttl > 0 ? ttl : config.windowSec),
            "X-RateLimit-Limit": String(config.max),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    return null; // Allowed
  } catch {
    return null; // Redis error — fail open
  }
}

/**
 * Extract a stable identifier for rate limiting.
 * Uses IP address from headers (Railway sets x-forwarded-for).
 */
export function getClientIP(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}
