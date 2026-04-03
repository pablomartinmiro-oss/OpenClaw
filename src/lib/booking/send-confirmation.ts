import { sendEmail } from "@/lib/email/client";
import {
  buildHotelBookingConfirmationHTML,
  buildSpaAppointmentConfirmationHTML,
  buildRestaurantBookingConfirmationHTML,
} from "@/lib/email/module-templates";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

const log = logger.child({ module: "booking-confirmation" });

/**
 * Send a booking confirmation email for hotel, spa, or restaurant bookings.
 * Fire-and-forget — errors are logged but not re-thrown.
 */
export async function sendBookingConfirmation(
  type: "hotel" | "spa" | "restaurant",
  bookingData: Record<string, unknown>,
  tenantId: string
): Promise<void> {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { name: true },
    });

    if (!tenant) {
      log.warn({ tenantId }, "Tenant not found for confirmation email");
      return;
    }

    const tenantInfo = { name: tenant.name };
    const clientEmail = bookingData.clientEmail as string | undefined;
    const clientName = bookingData.clientName as string | undefined;

    if (!clientEmail || !clientName) {
      log.info({ tenantId, type }, "No client email — skipping confirmation");
      return;
    }

    let html: string;
    let subject: string;

    switch (type) {
      case "hotel": {
        subject = `Confirmacion de reserva de hotel — ${tenant.name}`;
        html = buildHotelBookingConfirmationHTML({
          tenant: tenantInfo,
          guestName: clientName,
          roomType: (bookingData.roomType as string) ?? "Habitacion",
          checkIn: (bookingData.checkIn as string) ?? "",
          checkOut: (bookingData.checkOut as string) ?? "",
          nights: (bookingData.nights as number) ?? 1,
          guests: (bookingData.guests as number) ?? 1,
          total: (bookingData.totalPrice as number) ?? 0,
          confirmationCode: bookingData.confirmationCode as string | undefined,
        });
        break;
      }
      case "spa": {
        subject = `Confirmacion de cita spa — ${tenant.name}`;
        html = buildSpaAppointmentConfirmationHTML({
          tenant: tenantInfo,
          clientName,
          treatment: (bookingData.treatment as string) ?? "Tratamiento",
          date: (bookingData.date as string) ?? "",
          time: (bookingData.time as string) ?? "",
          duration: (bookingData.duration as string) ?? "",
          therapist: bookingData.therapist as string | undefined,
          price: (bookingData.price as number) ?? 0,
        });
        break;
      }
      case "restaurant": {
        subject = `Confirmacion de reserva — ${tenant.name}`;
        html = buildRestaurantBookingConfirmationHTML({
          tenant: tenantInfo,
          clientName,
          restaurant: (bookingData.restaurant as string) ?? "Restaurante",
          date: (bookingData.date as string) ?? "",
          time: (bookingData.time as string) ?? "",
          guests: (bookingData.guests as number) ?? 1,
          notes: bookingData.notes as string | undefined,
        });
        break;
      }
    }

    await sendEmail({
      tenantId,
      contactId: null,
      subject,
      html,
      to: clientEmail,
    });

    log.info({ tenantId, type, to: clientEmail }, "Booking confirmation sent");
  } catch (error) {
    log.error(
      { tenantId, type, err: error },
      "Failed to send booking confirmation — non-blocking"
    );
  }
}
