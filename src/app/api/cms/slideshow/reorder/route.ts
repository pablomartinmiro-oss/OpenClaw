export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, reorderSchema } from "@/lib/validation";

export async function PATCH(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "cms");
  if (modErr) return modErr;

  const log = logger.child({ tenantId, path: "/api/cms/slideshow/reorder" });

  try {
    const body = await request.json();
    const validated = validateBody(body, reorderSchema);
    if (!validated.ok) return NextResponse.json({ error: validated.error }, { status: 400 });

    const updates = validated.data.ids.map((id, index) =>
      prisma.slideshowItem.updateMany({ where: { id, tenantId }, data: { sortOrder: index } })
    );
    await prisma.$transaction(updates);

    log.info({ count: validated.data.ids.length }, "Slideshow reordered");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, { publicMessage: "Error al reordenar slideshow", code: "CMS_REORDER_ERROR", logContext: { tenantId } });
  }
}
