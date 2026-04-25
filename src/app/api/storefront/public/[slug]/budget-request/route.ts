export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError, badRequest } from "@/lib/api-response";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import { validateBody } from "@/lib/validation";

const publicBudgetRequestSchema = z.object({
  customerName: z.string().min(1, "El nombre es obligatorio").max(200),
  email: z.string().email("Email invalido").max(200),
  phone: z.string().max(50).optional().nullable(),
  company: z.string().max(200).optional().nullable(),
  startDate: z.string().max(50).optional().nullable(),
  endDate: z.string().max(50).optional().nullable(),
  numAdults: z.coerce.number().int().min(0).max(50).default(0),
  numChildren: z.coerce.number().int().min(0).max(50).default(0),
  station: z.string().max(100).optional().nullable(),
  activities: z.array(z.string().max(50)).max(20).default([]),
  notes: z.string().max(2000).optional().nullable(),
  // honeypot
  website: z.string().max(0).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const ip = getClientIP(request);
  const rl = await rateLimit(`budget:${ip}`, "submit");
  if (rl) return rl;

  const { slug } = await params;
  const log = logger.child({
    slug,
    ip,
    path: "/api/storefront/public/budget-request",
  });

  try {
    const body = await request.json();
    const validated = validateBody(body, publicBudgetRequestSchema);
    if (!validated.ok) return badRequest(validated.error);
    const data = validated.data;

    if (data.website && data.website.length > 0) {
      log.warn({ ip }, "Honeypot triggered on budget request");
      return NextResponse.json({ ok: true });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      select: { id: true, name: true },
    });
    if (!tenant) return badRequest("Tenant no encontrado");

    const lines: string[] = [];
    lines.push(`[Tienda: ${tenant.name} (${slug})]`);
    if (data.company) lines.push(`Empresa: ${data.company}`);
    if (data.startDate || data.endDate) {
      lines.push(
        `Fechas: ${data.startDate ?? "?"} → ${data.endDate ?? "?"}`
      );
    }
    const numChildren = data.numChildren ?? 0;
    const activities = data.activities ?? [];
    lines.push(
      `Personas: ${data.numAdults} adultos${
        numChildren > 0 ? `, ${numChildren} ninos` : ""
      }`
    );
    if (data.station) lines.push(`Estacion: ${data.station}`);
    if (activities.length > 0) {
      lines.push(`Actividades: ${activities.join(", ")}`);
    }
    if (data.notes) lines.push(`\nNotas: ${data.notes}`);

    const submission = await prisma.contactSubmission.create({
      data: {
        nombre: data.customerName,
        email: data.email,
        telefono: data.phone ?? null,
        asunto: `Solicitud de presupuesto — ${tenant.name}`,
        mensaje: lines.join("\n"),
      },
      select: { id: true, createdAt: true },
    });

    log.info(
      { submissionId: submission.id, tenantId: tenant.id },
      "Public budget request received"
    );

    return NextResponse.json({
      ok: true,
      id: submission.id,
      message:
        "Hemos recibido tu solicitud. Te contactaremos en menos de 24 horas con tu presupuesto personalizado.",
    });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al enviar la solicitud de presupuesto",
      code: "BUDGET_REQUEST_ERROR",
    });
  }
}
