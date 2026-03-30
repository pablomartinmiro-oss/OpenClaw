export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";

export async function POST() {
  const session = await auth();
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Mark onboarding as complete without GHL
  await prisma.tenant.update({
    where: { id: session.user.tenantId },
    data: { onboardingComplete: true },
  });

  return NextResponse.json({ ok: true });
}
