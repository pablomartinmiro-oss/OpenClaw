export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/db";
import { buildNotificationEmail, buildConfirmationEmail } from "./email-templates";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import { apiError } from "@/lib/api-response";
import { validateBody, contactFormSchema } from "@/lib/validation";

const log = logger.child({ module: "contact-form" });

export async function POST(req: NextRequest) {
  const rl = await rateLimit(getClientIP(req), "public");
  if (rl) return rl;

  const body = await req.json();

  // Honeypot check — bots fill hidden fields (check before validation)
  if (body.website) {
    return NextResponse.json({ success: true });
  }

  const validation = validateBody(body, contactFormSchema);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { nombre, email, telefono, asunto, mensaje } = validation.data;
  const normalizedEmail = email.trim().toLowerCase();

  // Rate limiting — max 3 per email per hour
  try {
    const oneHourAgo = new Date(Date.now() - 3_600_000);
    const recentCount = await prisma.contactSubmission.count({
      where: {
        email: normalizedEmail,
        createdAt: { gte: oneHourAgo },
      },
    });

    if (recentCount >= 3) {
      return NextResponse.json(
        { error: "Has enviado demasiados mensajes. Intentalo de nuevo mas tarde." },
        { status: 429 },
      );
    }
  } catch {
    log.warn("ContactSubmission table may not exist, skipping rate limit");
  }

  // Save to DB
  try {
    await prisma.contactSubmission.create({
      data: {
        nombre: nombre.trim(),
        email: normalizedEmail,
        telefono: telefono?.trim() || null,
        asunto: asunto || "Informacion general",
        mensaje: mensaje.trim(),
      },
    });
  } catch (err) {
    log.warn({ err }, "Could not save contact submission to DB");
  }

  // Send emails via Resend
  await sendEmails({
    nombre: nombre.trim(),
    email: normalizedEmail,
    telefono: telefono?.trim(),
    asunto: asunto || undefined,
    mensaje: mensaje.trim(),
  });

  // Create GHL contact (best effort)
  await createGHLContact({
    nombre: nombre.trim(),
    email: normalizedEmail,
    telefono: telefono?.trim(),
  });

  return NextResponse.json({ success: true });
}

async function sendEmails(data: {
  nombre: string;
  email: string;
  telefono?: string;
  asunto?: string;
  mensaje: string;
}) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      log.warn("RESEND_API_KEY not set, skipping contact form emails");
      return;
    }

    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    // Notification to team
    await resend.emails.send({
      from: "Skicenter Web <reservas@skicenter.es>",
      to: "reservas@skicenter.es",
      subject: `[Web] Nuevo contacto: ${data.asunto || "General"} — ${data.nombre}`,
      html: buildNotificationEmail(data),
    });

    // Confirmation to client
    await resend.emails.send({
      from: "Skicenter <reservas@skicenter.es>",
      to: data.email,
      subject: "Hemos recibido tu mensaje — Skicenter",
      html: buildConfirmationEmail(data.nombre),
    });
  } catch (err) {
    log.error({ err }, "Failed to send contact form emails");
  }
}

async function createGHLContact(data: {
  nombre: string;
  email: string;
  telefono?: string;
}) {
  try {
    const tenant = await prisma.tenant.findFirst({
      where: { ghlLocationId: { not: null } },
      select: { ghlLocationId: true, ghlAccessToken: true },
    });

    if (!tenant?.ghlAccessToken || !tenant.ghlLocationId) return;

    const { decrypt } = await import("@/lib/encryption");
    const token = decrypt(tenant.ghlAccessToken);

    const nameParts = data.nombre.split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || undefined;

    const response = await fetch(
      "https://services.leadconnectorhq.com/contacts/",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Version: "2021-07-28",
        },
        body: JSON.stringify({
          locationId: tenant.ghlLocationId,
          firstName,
          lastName,
          email: data.email,
          phone: data.telefono || undefined,
          tags: ["web-contacto"],
          source: "Formulario Web",
        }),
      },
    );

    if (!response.ok) {
      log.warn({ status: response.status }, "GHL contact creation failed");
    }
  } catch (err) {
    log.error({ err }, "Failed to create GHL contact");
  }
}
