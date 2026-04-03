export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { apiError } from "@/lib/api-response";

export async function GET() {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;

  try {
    const borrador = await prisma.quote.count({ where: { tenantId, status: "borrador" } });
    return NextResponse.json({ borrador });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to count quotes",
      code: "QUOTE_COUNT_ERROR",
      logContext: { tenantId },
    });
  }
}
