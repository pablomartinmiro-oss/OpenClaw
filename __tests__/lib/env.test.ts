import { describe, it, expect } from "vitest";
import { z } from "zod";

// Re-create the schema here to test independently without triggering parse at import
const envSchema = z.object({
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  DATABASE_URL: z.string().startsWith("postgresql://"),
  REDIS_URL: z.string().startsWith("redis"),
  GHL_CLIENT_ID: z.string().min(1),
  GHL_CLIENT_SECRET: z.string().min(1),
  GHL_REDIRECT_URI: z.string().url(),
  ENCRYPTION_KEY: z.string().length(64),
  ENABLE_NOTIFICATIONS: z.enum(["true", "false"]).default("true"),
  ENABLE_WEBHOOK_LOGGING: z.enum(["true", "false"]).default("true"),
  ENABLE_MOCK_GHL: z.enum(["true", "false"]).default("false"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const VALID_ENV = {
  NEXTAUTH_URL: "http://localhost:3000",
  NEXTAUTH_SECRET: "a".repeat(32),
  DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
  REDIS_URL: "redis://localhost:6379",
  GHL_CLIENT_ID: "client-id",
  GHL_CLIENT_SECRET: "client-secret",
  GHL_REDIRECT_URI: "http://localhost:3000/api/ghl/oauth/callback",
  ENCRYPTION_KEY: "a".repeat(64),
};

describe("env validation", () => {
  it("parses valid env successfully", () => {
    const result = envSchema.safeParse(VALID_ENV);
    expect(result.success).toBe(true);
  });

  it("applies defaults for optional fields", () => {
    const result = envSchema.parse(VALID_ENV);
    expect(result.ENABLE_NOTIFICATIONS).toBe("true");
    expect(result.ENABLE_MOCK_GHL).toBe("false");
    expect(result.LOG_LEVEL).toBe("info");
    expect(result.NODE_ENV).toBe("development");
  });

  it("fails if NEXTAUTH_URL is not a valid URL", () => {
    const result = envSchema.safeParse({
      ...VALID_ENV,
      NEXTAUTH_URL: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("fails if NEXTAUTH_SECRET is too short", () => {
    const result = envSchema.safeParse({
      ...VALID_ENV,
      NEXTAUTH_SECRET: "short",
    });
    expect(result.success).toBe(false);
  });

  it("fails if DATABASE_URL does not start with postgresql://", () => {
    const result = envSchema.safeParse({
      ...VALID_ENV,
      DATABASE_URL: "mysql://localhost/db",
    });
    expect(result.success).toBe(false);
  });

  it("fails if ENCRYPTION_KEY is not 64 characters", () => {
    const result = envSchema.safeParse({
      ...VALID_ENV,
      ENCRYPTION_KEY: "too-short",
    });
    expect(result.success).toBe(false);
  });

  it("fails if GHL_CLIENT_ID is empty", () => {
    const result = envSchema.safeParse({
      ...VALID_ENV,
      GHL_CLIENT_ID: "",
    });
    expect(result.success).toBe(false);
  });

  it("fails if required fields are missing", () => {
    const result = envSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects invalid LOG_LEVEL", () => {
    const result = envSchema.safeParse({
      ...VALID_ENV,
      LOG_LEVEL: "verbose",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid NODE_ENV", () => {
    const result = envSchema.safeParse({
      ...VALID_ENV,
      NODE_ENV: "staging",
    });
    expect(result.success).toBe(false);
  });
});
