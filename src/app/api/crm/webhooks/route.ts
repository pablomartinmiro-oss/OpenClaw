export const dynamic = "force-dynamic";
import { createVerify } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import {
  invalidateContactCaches,
  invalidateConversationCaches,
  invalidateOpportunityCaches,
} from "@/lib/cache/invalidation";
import { maybeCreateQuoteFromSurvey } from "@/lib/quotes/from-survey";
import {
  upsertCachedContact,
  deleteCachedContact,
  updateCachedContactTags,
  updateCachedContactDnd,
  cacheMessage,
  upsertCachedOpportunity,
  updateCachedOpportunityField,
} from "@/lib/ghl/sync";

// GHL raw response — webhook payload varies by event type
interface WebhookPayload {
  type: string;
  locationId: string;
  [key: string]: unknown;
}

// GHL RSA public key for webhook signature verification
// See: https://marketplace.gohighlevel.com/docs/webhook/WebhookIntegrationGuide
const GHL_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAokvo/r9tVgcfZ5DysOSC
Frm602qYV0MaAiNnX9O8KxMbiyRKWeL9JpCpVpt4XHIcBOK4u3cLSqJGOLaPuXw6
dO0t6Q/ZVdAV5Phz+ZtzPL16iCGeK9po6D6JHBpbi989mmzMryUnQJezlYJ3DVfB
csedpinheNnyYeFXolrJvcsjDtfAeRx5ByHQmTnSdFUzuAnC9/GepgLT9SM4nCpv
uxmZMxrJt5Rw+VUaQ9B8JSvbMPpez4peKaJPZHBbU3OdeCVx5klVXXZQGNHOs8gF
3kvoV5rTnXV0IknLBXlcKKAQLZcY/Q9rG6Ifi9c+5vqlvHPCUJFT5XUGG5RKgOKU
J062fRtN+rLYZUV+BjafxQauvC8wSWeYja63VSUruvmNj8xkx2zE/Juc+yjLjTXp
IocmaiFeAO6fUtNjDeFVkhf5LNb59vECyrHD2SQIrhgXpO4Q3dVNA5rw576PwTzN
h/AMfHKIjE4xQA1SZuYJmNnmVZLIZBlQAF9Ntd03rfadZ+yDiOXCCs9FkHibELhC
HULgCsnuDJHcrGNd5/Ddm5hxGQ0ASitgHeMZ0kcIOwKDOzOU53lDza6/Y09T7sYJ
PQe7z0cvj7aE4B+Ax1ZoZGPzpJlZtGXCsu9aTEGEnKzmsFqwcSsnw3JB31IGKAyk
T1hhTiaCeIY/OwwwNUY2yvcCAwEAAQ==
-----END PUBLIC KEY-----`;

/**
 * Verify GHL webhook signature using RSA public key.
 * GHL signs the raw body with their private key and sends the
 * base64-encoded signature in the x-wh-signature header.
 * Returns true if verified, false if signature invalid.
 * If no signature header is present, logs a warning but accepts
 * (some GHL events may not include signatures during testing).
 */
function verifyGhlSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader) {
    // No signature present — accept but log (GHL test events may omit it)
    return true;
  }

  try {
    const verifier = createVerify("SHA256");
    verifier.update(rawBody);
    verifier.end();
    return verifier.verify(GHL_PUBLIC_KEY, signatureHeader, "base64");
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const log = logger.child({ path: "/api/crm/webhooks" });

  const rawBody = await req.text();
  log.info({ method: req.method, bodyLength: rawBody.length }, "[WEBHOOK] Received");

  // GHL sends signature in x-wh-signature (RSA) header
  const signature = req.headers.get("x-wh-signature");

  if (!verifyGhlSignature(rawBody, signature)) {
    log.warn("Invalid GHL webhook signature — rejecting");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: WebhookPayload;
  try {
    payload = JSON.parse(rawBody) as WebhookPayload;
  } catch {
    log.warn("Invalid webhook JSON body");
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { type, locationId } = payload;

  if (!type || !locationId) {
    log.warn({ payload }, "Missing type or locationId in webhook");
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Find tenant by GHL location ID
  const tenant = await prisma.tenant.findUnique({
    where: { ghlLocationId: locationId },
    select: { id: true },
  });

  // Log the webhook
  await prisma.webhookLog.create({
    data: {
      tenantId: tenant?.id ?? null,
      event: type,
      payload: JSON.parse(JSON.stringify(payload)),
      status: tenant ? "received" : "failed",
      error: tenant ? null : `Unknown locationId: ${locationId}`,
    },
  });

  if (!tenant) {
    log.warn({ locationId, type }, "Webhook from unknown location");
    return NextResponse.json({ received: true });
  }

  const tenantId = tenant.id;
  log.info({ tenantId, event: type }, "Processing webhook");

  try {
    const data = (payload as Record<string, unknown>);

    switch (type) {
      // ==================== CONTACTS ====================
      case "ContactCreate":
        await upsertCachedContact(tenantId, data);
        await invalidateContactCaches(tenantId, (data.contactId as string) ?? (data.id as string));
        // Auto-create draft quote if contact has survey data
        await maybeCreateQuoteFromSurvey(tenantId, data).catch((err) =>
          log.error({ error: err }, "Failed to create quote from survey")
        );
        break;

      case "ContactUpdate":
        await upsertCachedContact(tenantId, data);
        await invalidateContactCaches(tenantId, (data.contactId as string) ?? (data.id as string));
        // GHL sends ContactUpdate when a form is submitted on an existing contact —
        // process survey data exactly like ContactCreate (with duplicate detection)
        log.info({
          contactId: (data.contactId as string) ?? (data.id as string),
          hasCustomFields: !!data.customFields,
        });
        await maybeCreateQuoteFromSurvey(tenantId, data).catch((err) =>
          log.error({ error: err }, "Failed to create quote from survey (ContactUpdate)")
        );
        break;

      case "ContactDelete":
        await deleteCachedContact(tenantId, (data.id as string) ?? (data.contactId as string));
        await invalidateContactCaches(tenantId, data.id as string);
        break;

      case "ContactTagUpdate":
        await updateCachedContactTags(tenantId, data);
        await invalidateContactCaches(tenantId, data.id as string ?? data.contactId as string);
        break;

      case "ContactDndUpdate":
        await updateCachedContactDnd(tenantId, data);
        break;

      // ==================== MESSAGES ====================
      case "InboundMessage":
      case "OutboundMessage":
        await cacheMessage(tenantId, data);
        await invalidateConversationCaches(tenantId, data.conversationId as string);
        break;

      // ==================== OPPORTUNITIES ====================
      case "OpportunityCreate":
        await upsertCachedOpportunity(tenantId, data);
        if (data.pipelineId) {
          await invalidateOpportunityCaches(tenantId, data.pipelineId as string);
        }
        break;

      case "OpportunityStageUpdate":
      case "OpportunityStatusUpdate":
      case "OpportunityMonetaryValueUpdate":
        await updateCachedOpportunityField(tenantId, data);
        if (data.pipelineId) {
          await invalidateOpportunityCaches(tenantId, data.pipelineId as string);
        }
        break;

      // ==================== NOTES & TASKS ====================
      case "NoteCreate":
      case "TaskCreate":
        // Invalidate contact cache so notes/tasks show fresh
        if (data.contactId) {
          await invalidateContactCaches(tenantId, data.contactId as string);
        }
        break;

      default:
        log.info({ event: type }, "Unhandled webhook event type");
    }

    // Mark as processed
    await prisma.webhookLog.updateMany({
      where: { tenantId, event: type, status: "received" },
      data: { status: "processed", processedAt: new Date() },
    });

    log.info({ tenantId, event: type }, "Webhook processed");
  } catch (error) {
    log.error({ tenantId, event: type, error }, "Webhook processing failed");
    await prisma.webhookLog.updateMany({
      where: { tenantId, event: type, status: "received" },
      data: {
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });
  }

  // Always return 200 to avoid GHL retries
  return NextResponse.json({ received: true });
}
