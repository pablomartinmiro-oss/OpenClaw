import Redis from "ioredis";
import { logger } from "@/lib/logger";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

function createRedisClient(): Redis {
  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error("REDIS_URL environment variable is not set");
  }

  const client = new Redis(url, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

  client.on("error", (err) => {
    logger.error({ err }, "Redis connection error");
  });

  client.on("connect", () => {
    logger.info("Redis connected");
  });

  return client;
}

export const redis = globalForRedis.redis ?? createRedisClient();

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

export async function getCachedOrFetch<T>(
  cacheKey: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = await redis.get(cacheKey);
  if (cached) {
    logger.debug({ key: cacheKey }, "Cache hit");
    return JSON.parse(cached) as T;
  }

  logger.debug({ key: cacheKey }, "Cache miss");
  const data = await fetcher();
  await redis.setex(cacheKey, ttlSeconds, JSON.stringify(data));
  return data;
}

export async function invalidateCache(key: string): Promise<void> {
  await redis.del(key);
  logger.debug({ key }, "Cache invalidated");
}
