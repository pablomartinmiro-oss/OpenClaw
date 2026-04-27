export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { buildQuoteConfirmationHTML } from "@/lib/email/templates/quote-confirmation";
import { buildQuoteReminderHTML } from "@/lib/email/templates/quote-reminder";
import { buildBookingConfirmationHTML } from "@/lib/email/templates/booking-confirmation";
import { buildWelcomeTenantHTML } from "@/lib/email/templates/welcome-tenant";
import {
  buildContactFormNotificationHTML,
  buildContactFormConfirmationHTML,
} from "@/lib/email/templates/contact-form-notification";

// Only available in development
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ template: string }> },
) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const { template } = await params;

  let html: string;

  switch (template) {
    case "quote-confirmation":
      html = buildQuoteConfirmationHTML({
        quoteNumber: "QT-2024-0042",
        clientName: "María González Pérez",
        destination: "Baqueira Beret",
        checkIn: "15 feb 2025",
        checkOut: "22 feb 2025",
        totalAmount: 1842.5,
        items: [
          { name: "Alquiler esquí adulto — 7 días", quantity: 2, totalPrice: 504 },
          { name: "Forfait Baqueira — 7 días", quantity: 2, totalPrice: 980 },
          { name: "Clases grupo — 5 días", quantity: 2, totalPrice: 358.5 },
        ],
        expiresAt: "20 ene 2025",
        storefrontUrl: "https://skiinet.com/s/skicenter/presupuesto",
      });
      break;

    case "quote-reminder":
      html = buildQuoteReminderHTML({
        quoteNumber: "QT-2024-0042",
        clientName: "María González Pérez",
        destination: "Baqueira Beret",
        checkIn: "15 feb 2025",
        checkOut: "22 feb 2025",
        totalAmount: 1842.5,
        expiresAt: "20 ene 2025 a las 23:59",
        paymentUrl: "https://skiinet.com/presupuestos/pay/abc123",
      });
      break;

    case "booking-confirmation":
      html = buildBookingConfirmationHTML({
        reservationId: "clxyz123abc456",
        clientName: "Carlos Martínez López",
        station: "Sierra Nevada",
        activityDate: "10 feb 2025",
        schedule: "09:00",
        services: [
          "Alquiler esquí adulto — 5 días",
          "Forfait Sierra Nevada — 5 días",
          "Clases particulares — 2 horas",
        ],
        totalPrice: 645,
        meetingPoint: "Recepción principal de Pradollano, junto a la taquilla principal. Busca a nuestro instructor con el chaleco azul de Skicenter.",
        notes: "Recuerda traer tu DNI o pasaporte. El seguro de esquí está incluido en tu reserva.",
        dashboardUrl: "https://skiinet.com/reservas",
      });
      break;

    case "welcome-tenant":
      html = buildWelcomeTenantHTML({
        ownerName: "Ana López García",
        companyName: "Alpine Adventures SL",
        dashboardUrl: "https://skiinet.com",
      });
      break;

    case "contact-form-notification":
      html = buildContactFormNotificationHTML({
        nombre: "Pedro Sánchez Ruiz",
        email: "pedro@ejemplo.com",
        telefono: "+34 666 123 456",
        asunto: "Presupuesto viaje esquí",
        mensaje:
          "Hola, me gustaría recibir información sobre un paquete de esquí para 4 personas (2 adultos y 2 niños de 8 y 11 años) para la primera semana de febrero en Baqueira. Estamos interesados en alquiler de material, forfait y clases. ¿Podéis enviarme un presupuesto?",
      });
      break;

    case "contact-form-confirmation":
      html = buildContactFormConfirmationHTML({ nombre: "Pedro Sánchez Ruiz" });
      break;

    default:
      return NextResponse.json(
        {
          error: "Unknown template",
          available: [
            "quote-confirmation",
            "quote-reminder",
            "booking-confirmation",
            "welcome-tenant",
            "contact-form-notification",
            "contact-form-confirmation",
          ],
        },
        { status: 404 },
      );
  }

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
