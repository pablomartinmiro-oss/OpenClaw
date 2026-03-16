import axios, { type AxiosInstance, type AxiosError } from "axios";
import { redis } from "@/lib/cache/redis";
import { decrypt, encrypt } from "@/lib/encryption";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { createMockGHLClient, type MockGHLClient } from "./mock-server";

const GHL_BASE_URL = "https://services.leadconnectorhq.com";
const GHL_API_VERSION = "2021-07-28";
const MAX_RETRIES = 3;
const RATE_LIMIT_WINDOW = 10; // seconds
const RATE_LIMIT_MAX = 80; // stay under 100/10s with buffer

export type GHLClient = AxiosInstance | MockGHLClient;

export async function createGHLClient(
  tenantId: string
): Promise<GHLClient> {
  // Mock mode for local dev
  if (process.env.ENABLE_MOCK_GHL === "true") {
    logger.debug({ tenantId }, "Using mock GHL client");
    return createMockGHLClient();
  }

  const tenant = await prisma.tenant.findUniqueOrThrow({
    where: { id: tenantId },
  });

  if (!tenant.ghlAccessToken) {
    throw new Error("GHL not connected for this tenant");
  }

  const ghlLog = logger.child({ tenantId, layer: "ghl" });
  const accessToken = decrypt(tenant.ghlAccessToken);

  const client = axios.create({
    baseURL: GHL_BASE_URL,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Version: GHL_API_VERSION,
      "Content-Type": "application/json",
    },
    timeout: 15000,
  });

  // Rate limit interceptor
  client.interceptors.request.use(async (config) => {
    const key = `ratelimit:${tenantId}`;
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, RATE_LIMIT_WINDOW);
    if (count > RATE_LIMIT_MAX) {
      const ttl = await redis.ttl(key);
      ghlLog.warn({ count, ttl }, "Rate limit approaching, delaying request");
      await new Promise((r) => setTimeout(r, ttl * 1000));
    }
    return config;
  });

  // Token refresh + retry interceptor
  client.interceptors.response.use(
    (res) => {
      ghlLog.info(
        { endpoint: res.config.url, status: res.status },
        "GHL API response"
      );
      return res;
    },
    async (error: AxiosError) => {
      const config = error.config as unknown as {
        _retryCount?: number;
        headers: Record<string, string>;
        url?: string;
      };
      if (!config) throw error;

      config._retryCount = (config._retryCount as number) || 0;

      // Token expired → refresh
      if (error.response?.status === 401 && config._retryCount === 0) {
        ghlLog.info("Access token expired, refreshing");
        const newTokens = await refreshGHLTokens(tenantId);
        config.headers.Authorization = `Bearer ${newTokens.access_token}`;
        config._retryCount = 1;
        return client.request(config);
      }

      // Rate limited or server error → exponential backoff retry
      if (
        (error.response?.status === 429 ||
          (error.response?.status ?? 0) >= 500) &&
        (config._retryCount as number) < MAX_RETRIES
      ) {
        const delay = Math.pow(2, config._retryCount as number) * 1000;
        ghlLog.warn(
          {
            endpoint: config.url,
            status: error.response?.status,
            retryCount: config._retryCount,
            delay,
          },
          "Retrying GHL request"
        );
        await new Promise((r) => setTimeout(r, delay));
        config._retryCount = (config._retryCount as number) + 1;
        return client.request(config);
      }

      ghlLog.error(
        {
          endpoint: config.url,
          status: error.response?.status,
          message: error.message,
        },
        "GHL API error"
      );
      throw error;
    }
  );

  return client;
}

async function refreshGHLTokens(
  tenantId: string
): Promise<{ access_token: string; refresh_token: string }> {
  const tenant = await prisma.tenant.findUniqueOrThrow({
    where: { id: tenantId },
  });

  if (!tenant.ghlRefreshToken) {
    throw new Error("No refresh token available");
  }

  // GHL token endpoint requires x-www-form-urlencoded
  const body = new URLSearchParams({
    client_id: process.env.GHL_CLIENT_ID ?? "",
    client_secret: process.env.GHL_CLIENT_SECRET ?? "",
    grant_type: "refresh_token",
    refresh_token: decrypt(tenant.ghlRefreshToken),
  });

  const res = await axios.post(
    "https://services.leadconnectorhq.com/oauth/token",
    body.toString(),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      ghlAccessToken: encrypt(res.data.access_token),
      ghlRefreshToken: encrypt(res.data.refresh_token),
      ghlTokenExpiry: new Date(Date.now() + res.data.expires_in * 1000),
    },
  });

  logger.info({ tenantId }, "GHL tokens refreshed");
  return res.data;
}
