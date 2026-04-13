export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant, requireOwner } from "@/lib/auth/guard";
import { apiError, badRequest } from "@/lib/api-response";
import { validateBody, createPdfTemplateSchema } from "@/lib/validation";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/db";

const SYSTEM_PDF_TEMPLATES = [
  { templateKey: "quote", name: "Presupuesto", category: "quotes" },
  { templateKey: "invoice", name: "Factura", category: "finance" },
  { templateKey: "settlement", name: "Liquidacion", category: "suppliers" },
  { templateKey: "ticket", name: "Ticket TPV", category: "tpv" },
];

export async function GET() {
  try {
    const [session, authError] = await requireTenant();
    if (authError) return authError;

    const { tenantId } = session;
    const log = logger.child({ tenantId, path: "/api/settings/pdf-templates" });

    const dbTemplates = await prisma.pdfTemplate.findMany({
      where: { tenantId },
      orderBy: { templateKey: "asc" },
    });
    const dbMap = new Map(dbTemplates.map((t) => [t.templateKey, t]));

    const templates = SYSTEM_PDF_TEMPLATES.map((sys) => {
      const db = dbMap.get(sys.templateKey);
      if (db) return db;
      return {
        id: null,
        templateKey: sys.templateKey,
        name: sys.name,
        category: sys.category,
        isCustom: false,
        isActive: true,
        bodyHtml: "",
        headerColor: "#E87B5A",
        accentColor: "#5B8C6D",
      };
    });

    const systemKeys = new Set(SYSTEM_PDF_TEMPLATES.map((s) => s.templateKey));
    const customExtra = dbTemplates.filter((t) => !systemKeys.has(t.templateKey));

    log.info({ count: templates.length }, "PDF templates fetched");
    return NextResponse.json({ templates: [...templates, ...customExtra] });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al cargar plantillas PDF",
      code: "PDF_TEMPLATES_FETCH_ERROR",
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const [session, authError] = await requireOwner();
    if (authError) return authError;

    const { tenantId } = session;
    const log = logger.child({ tenantId, path: "/api/settings/pdf-templates" });

    const body = await request.json();
    const parsed = validateBody(body, createPdfTemplateSchema);
    if (!parsed.ok) return badRequest(parsed.error);

    const template = await prisma.pdfTemplate.create({
      data: {
        tenantId,
        ...parsed.data,
        isCustom: true,
      },
    });

    log.info({ templateId: template.id }, "PDF template created");
    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al crear plantilla PDF",
      code: "PDF_TEMPLATE_CREATE_ERROR",
    });
  }
}
