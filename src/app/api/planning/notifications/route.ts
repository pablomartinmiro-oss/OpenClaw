export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";

export async function GET() {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modError = await requireModule(tenantId, "instructors");
  if (modError) return modError;

  try {
    const templates = await prisma.notificationTemplate.findMany({
      where: { tenantId },
      orderBy: { trigger: "asc" },
    });
    return NextResponse.json({ templates });
  } catch (error) {
    return apiError(error, { publicMessage: "Error", code: "NOTIF_ERROR", logContext: { tenantId } });
  }
}

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modError = await requireModule(tenantId, "instructors");
  if (modError) return modError;
  const log = logger.child({ tenantId, path: "/api/planning/notifications" });

  try {
    const body = await request.json();
    const { trigger, channel, subject, body: templateBody } = body;

    if (!trigger || !channel || !templateBody) {
      return NextResponse.json({ error: "trigger, channel y body son obligatorios" }, { status: 400 });
    }

    const template = await prisma.notificationTemplate.upsert({
      where: { tenantId_trigger_channel: { tenantId, trigger, channel } },
      create: { tenantId, trigger, channel, subject, body: templateBody },
      update: { subject, body: templateBody },
    });

    log.info({ trigger, channel }, "Notification template saved");
    return NextResponse.json({ template });
  } catch (error) {
    return apiError(error, { publicMessage: "Error", code: "NOTIF_SAVE_ERROR", logContext: { tenantId } });
  }
}
