export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { apiError } from "@/lib/api-response";
import { logger } from "@/lib/logger";

export async function POST() {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;

  try {
    // Mark onboarding as complete without GHL
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { onboardingComplete: true },
    });

    logger.info({ tenantId }, "Onboarding completed (GHL skipped)");

    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al completar el onboarding",
      code: "ONBOARDING_ERROR",
      logContext: { tenantId },
    });
  }
}
