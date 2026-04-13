import { describe, it, expect } from "vitest";
import {
  buildReservationConfirm,
  buildQuoteSend,
  buildPaymentFailed,
  buildPaymentConfirm,
  buildInvoiceEmail,
  buildCancellationClient,
  buildVoucherIssued,
  buildQuoteReminder,
  buildTpvTicket,
  TEMPLATE_KEYS,
  TEMPLATE_METADATA,
} from "@/lib/email/builders";

describe("Email Template Builders", () => {
  describe("buildReservationConfirm", () => {
    it("generates valid HTML with client name and details", () => {
      const html = buildReservationConfirm({
        clientName: "Juan Lopez",
        station: "Baqueira Beret",
        activityDate: "15/01/2026",
        schedule: "10:00 - 14:00",
        services: "Clase grupal + Forfait",
        totalPrice: "120,00 EUR",
      });

      expect(html).toContain("Juan Lopez");
      expect(html).toContain("Baqueira Beret");
      expect(html).toContain("Reserva Confirmada");
      expect(html).toContain("120,00 EUR");
      expect(html).toContain("<!DOCTYPE html>");
    });

    it("includes reservation number when provided", () => {
      const html = buildReservationConfirm({
        clientName: "Ana",
        reservationNumber: "RES-2026-0001",
        station: "Sierra Nevada",
        activityDate: "20/02/2026",
        schedule: "09:00",
        services: "Forfait",
        totalPrice: "50,00 EUR",
      });

      expect(html).toContain("RES-2026-0001");
    });
  });

  describe("buildQuoteSend", () => {
    it("generates HTML with payment button when URL provided", () => {
      const html = buildQuoteSend({
        clientName: "Maria Garcia",
        destination: "Baqueira",
        checkIn: "10/01/2026",
        checkOut: "12/01/2026",
        totalAmount: "350,00 EUR",
        paymentUrl: "https://example.com/pay",
      });

      expect(html).toContain("Maria Garcia");
      expect(html).toContain("Pagar ahora");
      expect(html).toContain("https://example.com/pay");
    });

    it("omits payment button when no URL", () => {
      const html = buildQuoteSend({
        clientName: "Pedro",
        destination: "Sierra Nevada",
        checkIn: "01/03/2026",
        checkOut: "03/03/2026",
        totalAmount: "200,00 EUR",
      });

      expect(html).not.toContain("Pagar ahora");
    });
  });

  describe("buildPaymentFailed", () => {
    it("generates error-styled email", () => {
      const html = buildPaymentFailed({
        clientName: "Carlos",
        amount: "150,00 EUR",
      });

      expect(html).toContain("Error en el Pago");
      expect(html).toContain("Carlos");
      expect(html).toContain("150,00 EUR");
    });
  });

  describe("buildPaymentConfirm", () => {
    it("generates success-styled email", () => {
      const html = buildPaymentConfirm({
        clientName: "Laura",
        amount: "200,00 EUR",
        paymentRef: "AUTH-12345",
      });

      expect(html).toContain("Pago Confirmado");
      expect(html).toContain("AUTH-12345");
    });
  });

  describe("buildInvoiceEmail", () => {
    it("includes invoice details and download button", () => {
      const html = buildInvoiceEmail({
        clientName: "Empresa SL",
        invoiceNumber: "FAC-2026-0001",
        total: "450,00 EUR",
        issuedAt: "15/03/2026",
        pdfUrl: "https://example.com/invoice.pdf",
      });

      expect(html).toContain("FAC-2026-0001");
      expect(html).toContain("Descargar PDF");
    });
  });

  describe("buildCancellationClient", () => {
    it("generates warning-styled cancellation email", () => {
      const html = buildCancellationClient({
        clientName: "Pablo",
        cancellationNumber: "ANU-2026-0001",
        reason: "Mal tiempo",
        resolution: "Bono de compensacion emitido",
      });

      expect(html).toContain("Cancelacion Procesada");
      expect(html).toContain("ANU-2026-0001");
    });
  });

  describe("buildVoucherIssued", () => {
    it("includes voucher code with monospace styling", () => {
      const html = buildVoucherIssued({
        clientName: "Marta",
        voucherCode: "COMP-ABC123",
        amount: "75,00 EUR",
        expiresAt: "31/12/2026",
      });

      expect(html).toContain("COMP-ABC123");
      expect(html).toContain("monospace");
    });
  });

  describe("buildQuoteReminder", () => {
    it("adapts title to reminder step", () => {
      const html1 = buildQuoteReminder({
        clientName: "Luis",
        totalAmount: "300,00 EUR",
        step: "reminder_1",
      });
      expect(html1).toContain("Recordatorio de Presupuesto");

      const html2 = buildQuoteReminder({
        clientName: "Luis",
        totalAmount: "270,00 EUR",
        step: "discount",
        discountPercent: 10,
      });
      expect(html2).toContain("Oferta especial");
      expect(html2).toContain("10%");
    });
  });

  describe("buildTpvTicket", () => {
    it("renders item table with totals", () => {
      const html = buildTpvTicket({
        clientName: "Elena",
        ticketNumber: "TPV-2026-0015",
        date: "01/04/2026",
        items: [
          { description: "Forfait dia completo", quantity: 2, total: "90,00 EUR" },
          { description: "Alquiler equipo", quantity: 1, total: "35,00 EUR" },
        ],
        totalAmount: "125,00 EUR",
      });

      expect(html).toContain("TPV-2026-0015");
      expect(html).toContain("Forfait dia completo");
      expect(html).toContain("125,00 EUR");
      expect(html).toContain("TOTAL");
    });
  });

  describe("TEMPLATE_METADATA", () => {
    it("has metadata for all template keys", () => {
      for (const key of TEMPLATE_KEYS) {
        const meta = TEMPLATE_METADATA[key];
        expect(meta).toBeDefined();
        expect(meta.name).toBeTruthy();
        expect(meta.category).toBeTruthy();
        expect(meta.recipient).toBeTruthy();
      }
    });
  });

  describe("all builders produce valid HTML", () => {
    it("all templates start with DOCTYPE and end with closing tags", () => {
      const templates = [
        buildReservationConfirm({
          clientName: "Test", station: "Test", activityDate: "01/01/2026",
          schedule: "10:00", services: "Test", totalPrice: "0 EUR",
        }),
        buildQuoteSend({
          clientName: "Test", destination: "Test", checkIn: "01/01/2026",
          checkOut: "02/01/2026", totalAmount: "0 EUR",
        }),
        buildPaymentFailed({ clientName: "Test", amount: "0 EUR" }),
        buildPaymentConfirm({ clientName: "Test", amount: "0 EUR" }),
        buildInvoiceEmail({
          clientName: "Test", invoiceNumber: "FAC-001", total: "0 EUR", issuedAt: "01/01/2026",
        }),
        buildCancellationClient({ clientName: "Test" }),
        buildVoucherIssued({
          clientName: "Test", voucherCode: "TEST", amount: "0 EUR", expiresAt: "01/01/2026",
        }),
        buildQuoteReminder({ clientName: "Test", totalAmount: "0 EUR", step: "reminder_1" }),
        buildTpvTicket({
          clientName: "Test", ticketNumber: "TPV-001", date: "01/01/2026",
          items: [{ description: "Item", quantity: 1, total: "0 EUR" }], totalAmount: "0 EUR",
        }),
      ];

      for (const html of templates) {
        expect(html).toContain("<!DOCTYPE html>");
        expect(html).toContain("</html>");
        expect(html).toContain("</body>");
      }
    });
  });
});
