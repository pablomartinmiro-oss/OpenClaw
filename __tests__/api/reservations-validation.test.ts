import { describe, it, expect } from "vitest";
import {
  createReservationSchema,
  updateReservationSchema,
  validateBody,
} from "@/lib/validation";

const validPayload = {
  clientName: "María García",
  clientEmail: "maria@example.com",
  clientPhone: "+34 612 345 678",
  source: "web",
  station: "baqueira",
  activityDate: "2026-02-10T09:00:00.000Z",
  schedule: "09:00-13:00",
  participants: [
    { name: "María García", type: "adulto", service: "Cursillo 3d", level: "Principiante", material: true },
    { name: "Sofía García", type: "infantil", service: "Escuelita", level: "Principiante", material: false },
  ],
  totalPrice: 350,
  status: "pendiente",
};

describe("createReservationSchema", () => {
  it("accepts a valid full payload — no DB write until this passes", () => {
    const { ok, data } = validateBody(validPayload, createReservationSchema);
    expect(ok).toBe(true);
    if (ok) {
      expect(data.clientName).toBe("María García");
      expect(data.station).toBe("baqueira");
      expect(data.activityDate).toBeInstanceOf(Date);
      expect(data.participants).toHaveLength(2);
      expect(data.participants![0].type).toBe("adulto");
      expect(data.participants![1].type).toBe("infantil");
    }
  });

  it("rejects missing required clientName — returns 400-safe error", () => {
    const { ok, error } = validateBody(
      { ...validPayload, clientName: "" },
      createReservationSchema
    );
    expect(ok).toBe(false);
    expect(error).toContain("clientName");
  });

  it("rejects invalid participant type enum — protects DB from bad data", () => {
    const { ok, error } = validateBody(
      {
        ...validPayload,
        participants: [{ name: "Test", type: "senior" }],
      },
      createReservationSchema
    );
    expect(ok).toBe(false);
    expect(error).toContain("type");
  });

  it("rejects missing required source field", () => {
    const { ok, error } = validateBody(
      { ...validPayload, source: undefined },
      createReservationSchema
    );
    expect(ok).toBe(false);
    expect(error).toContain("source");
  });
});

describe("updateReservationSchema", () => {
  it("accepts a valid partial update", () => {
    const { ok, data } = validateBody(
      { status: "confirmada", notes: "Confirmado por teléfono" },
      updateReservationSchema
    );
    expect(ok).toBe(true);
    if (ok) {
      expect(data.status).toBe("confirmada");
      expect(data.notes).toBe("Confirmado por teléfono");
    }
  });

  it("rejects an invalid status value — only known statuses allowed", () => {
    const { ok, error } = validateBody(
      { status: "desconocido" },
      updateReservationSchema
    );
    expect(ok).toBe(false);
    expect(error).toContain("status");
  });
});
