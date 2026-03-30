export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const status = await prisma.syncStatus.findUnique({
    where: { tenantId: session.user.tenantId },
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
