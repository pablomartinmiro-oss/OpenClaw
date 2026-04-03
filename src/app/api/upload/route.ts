export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { apiError } from "@/lib/api-response";
import { logger } from "@/lib/logger";
import { uploadFile } from "@/lib/storage/s3";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_DOC_SIZE = 25 * 1024 * 1024; // 25MB
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
const ALLOWED_DOC_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const log = logger.child({ tenantId, path: "/api/upload" });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const moduleName = (formData.get("module") as string) || "general";
    const entityId = (formData.get("entityId") as string) || "unlinked";

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isDoc = ALLOWED_DOC_TYPES.includes(file.type);

    if (!isImage && !isDoc) {
      return NextResponse.json(
        { error: "Tipo de archivo no permitido" },
        { status: 400 }
      );
    }

    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_DOC_SIZE;
    if (file.size > maxSize) {
      const maxMB = Math.round(maxSize / 1024 / 1024);
      return NextResponse.json(
        { error: `Archivo demasiado grande (max ${maxMB}MB)` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadFile(
      tenantId,
      moduleName,
      entityId,
      buffer,
      file.name,
      file.type
    );

    if (!result) {
      return NextResponse.json(
        { error: "Almacenamiento no configurado" },
        { status: 503 }
      );
    }

    log.info({ key: result.key, module: moduleName, entityId }, "File uploaded");
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al subir archivo",
      code: "UPLOAD_ERROR",
      logContext: { tenantId },
    });
  }
}
