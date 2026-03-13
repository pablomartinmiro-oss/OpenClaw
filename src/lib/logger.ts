import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport:
    process.env.NODE_ENV === "development"
      ? { target: "pino-pretty", options: { colorize: true } }
      : undefined,
  base: { service: "ghl-dashboard" },
});

export function createRequestLogger(tenantId: string, userId?: string) {
  return logger.child({ tenantId, userId });
}

export function createGHLLogger(tenantId: string, endpoint: string) {
  return logger.child({ tenantId, layer: "ghl", endpoint });
}
