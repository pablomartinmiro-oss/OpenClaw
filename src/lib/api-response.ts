import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

/**
 * Standard API error response — never exposes internals.
 * Logs the full error server-side, returns a safe message to the client.
 */
export function apiError(
  error: unknown,
  opts: {
    status?: number;
    code?: string;
    publicMessage?: string;
    logContext?: Record<string, unknown>;
  } = {}
) {
  const {
    status = 500,
    code = "INTERNAL_ERROR",
    publicMessage = "An unexpected error occurred",
    logContext = {},
  } = opts;

  // Log full error details server-side
  const log = logger.child({ ...logContext, errorCode: code });
  if (error instanceof Error) {
    log.error({ err: error, stack: error.stack }, publicMessage);
  } else {
    log.error({ err: error }, publicMessage);
  }

  // Return safe response — no message, stack, or details
  return NextResponse.json(
    { error: publicMessage, code },
    { status }
  );
}

/**
 * 401 Unauthorized response
 */
export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

/**
 * 403 Forbidden response
 */
export function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

/**
 * 400 Bad Request with a safe message
 */
export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

/**
 * 404 Not Found
 */
export function notFound(resource = "Resource") {
  return NextResponse.json({ error: `${resource} not found` }, { status: 404 });
}
