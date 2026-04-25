export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError, badRequest } from "@/lib/api-response";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import { validateBody } from "@/lib/validation";

const lookupSchema = z.object({
  locator: z.string().max(50).optional().nullable(),
  email: z.string().email().max(200).optional().nullable(),
});

const submitSchema = z.object({
  reservationId: z.string().min(1, "Reserva requerida"),
  email: z.string().email("Email invalido").max(200),
  reason: z.string().max(50).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  website: z.string().max(0).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const rl = await rateLimit(getClientIP(request), "public");
  if (rl) return rl;

  const { slug } = await params;
  const { searchParams } = request.nextUrl;
  const validated = lookupSchema.safeParse({
    locator: searchParams.get("locator"),
    email: searchParams.get("email"),
  });
  if (!validated.success) return badRequest("Parametros invalidos");
  const { locator, email } = validated.data;

  if (!locator && !email) {
    return badRequest("Debes proporcionar localizador o email");
  }

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!tenant) return badRequest("Tenant no encontrado");

    const where: Record<string, unknown> = { tenantId: tenant.id };
    if (locator) {
      where.id = locator;
    }
    if (email) {
      where.clientEmail = email;
    }

    const reservation = await prisma.reservation.findFirst({
      where,
      select: {
        id: true,
        clientName: true,
        clientEmail: true,
        station: true,
        activityDate: true,
        totalPrice: true,
        status: true,
        source: true,
      },
    });

    if (!reservation) {
      return NextResponse.json(
        { found: false, message: "No se encontro ninguna reserva" },
        { status: 404 }
      );
    }

    if (reservation.status === "cancelada") {
      return NextResponse.json({
        found: true,
        cancelled: true,
        reservation: {
          id: reservation.id,
          clientName: reservation.clientName,
          station: reservation.station,
          activityDate: reservation.activityDate,
        },
      });
    }

    return NextResponse.json({
      found: true,
      cancelled: false,
      reservation: {
        id: reservation.id,
        clientName: reservation.clientName,
        clientEmail: reservation.clientEmail,
        station: reservation.station,
        activityDate: reservation.activityDate,
        totalPrice: reservation.totalPrice,
        source: reservation.source,
      },
    });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al buscar la reserva",
      code: "PUBLIC_RESERVATION_LOOKUP_ERROR",
    });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const ip = getClientIP(request);
  const rl = await rateLimit(`cancel:${ip}`, "submit");
  if (rl) return rl;

  const { slug } = await params;
  const log = logger.child({
    slug,
    ip,
    path: "/api/storefront/public/cancellation",
  });

  try {
    const body = await request.json();
    const validated = validateBody(body, submitSchema);
    if (!validated.ok) return badRequest(validated.error);
    const data = validated.data;

    if (data.website && data.website.length > 0) {
      log.warn({ ip }, "Honeypot triggered on cancellation");
      return NextResponse.json({ ok: true });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!tenant) return badRequest("Tenant no encontrado");

    const reservation = await prisma.reservation.findFirst({
      where: {
        id: data.reservationId,
        tenantId: tenant.id,
        clientEmail: data.email,
      },
      select: { id: true, status: true },
    });
    if (!reservation) {
      return badRequest(
        "No se encontro la reserva o el email no coincide"
      );
    }

    const existing = await prisma.cancellationRequest.findFirst({
      where: {
        tenantId: tenant.id,
        reservationId: reservation.id,
        status: { notIn: ["cerrada", "resuelta"] },
      },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        {
          error: "Ya existe una solicitud de cancelacion para esta reserva",
          requestId: existing.id,
        },
        { status: 409 }
      );
    }

    const reasonText = [data.reason, data.notes].filter(Boolean).join(" — ");
    const created = await prisma.cancellationRequest.create({
      data: {
        tenantId: tenant.id,
        reservationId: reservation.id,
        reason: reasonText || null,
        status: "recibida",
      },
    });

    await prisma.cancellationLog.create({
      data: {
        tenantId: tenant.id,
        requestId: created.id,
        previousStatus: "",
        newStatus: "recibida",
        actorId: `public:${data.email}`,
        notes: reasonText || "Solicitud publica de cancelacion",
      },
    });

    log.info(
      { requestId: created.id, reservationId: reservation.id },
      "Public cancellation request received"
    );

    return NextResponse.json({
      ok: true,
      requestId: created.id,
      message:
        "Hemos recibido tu solicitud de cancelacion. Te contactaremos en breve para revisar el caso.",
    });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al procesar la solicitud de cancelacion",
      code: "PUBLIC_CANCELLATION_ERROR",
    });
  }
}
