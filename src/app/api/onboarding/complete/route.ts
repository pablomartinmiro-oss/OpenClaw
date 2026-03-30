export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tenantId } = session.user;

  await prisma.tenant.update({
    where: { id: tenantId },
    data: { onboardingComplete: true },
  });

  logger.info({ tenantId }, "Onboarding completed");

  return NextResponse.json({ ok: true });
}
