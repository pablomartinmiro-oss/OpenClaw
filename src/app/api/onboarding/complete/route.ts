export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";

export async function POST() {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;

  try {
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { onboardingComplete: true },
    });

    logger.info({ tenantId }, "Onboarding completed");

    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al completar el onboarding",
      code: "ONBOARDING_ERROR",
      logContext: { tenantId },
    });
  }
}
