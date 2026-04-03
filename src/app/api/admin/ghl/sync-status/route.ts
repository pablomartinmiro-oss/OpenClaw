export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";

export async function GET() {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;

  const status = await prisma.syncStatus.findUnique({
    where: { tenantId },
  });

  return NextResponse.json({
    syncStatus: status ?? {
      lastFullSync: null,
      lastIncrSync: null,
      contactCount: 0,
      conversationCount: 0,
      opportunityCount: 0,
      pipelineCount: 0,
      syncInProgress: false,
      lastError: null,
    },
  });
}
