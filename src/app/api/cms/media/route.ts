export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, createMediaFileSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "cms");
  if (modErr) return modErr;

  const log = logger.child({ tenantId, path: "/api/cms/media" });
  const type = request.nextUrl.searchParams.get("type");

  try {
    const where: Record<string, unknown> = { tenantId };
    if (type) where.type = type;

    const files = await prisma.mediaFile.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    log.info({ count: files.length }, "Media files fetched");
    return NextResponse.json({ files });
  } catch (error) {
    return apiError(error, { publicMessage: "Error al obtener archivos", code: "CMS_MEDIA_ERROR", logContext: { tenantId } });
  }
}

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId, userId } = session;
  const modErr = await requireModule(tenantId, "cms");
  if (modErr) return modErr;

  const log = logger.child({ tenantId, path: "/api/cms/media" });

  try {
    const body = await request.json();
    const validated = validateBody(body, createMediaFileSchema);
    if (!validated.ok) return NextResponse.json({ error: validated.error }, { status: 400 });

    const file = await prisma.mediaFile.create({
      data: { tenantId, uploadedBy: userId, ...validated.data },
    });
    log.info({ fileId: file.id }, "Media file registered");
    return NextResponse.json({ file }, { status: 201 });
  } catch (error) {
    return apiError(error, { publicMessage: "Error al registrar archivo", code: "CMS_MEDIA_ERROR", logContext: { tenantId } });
  }
}
