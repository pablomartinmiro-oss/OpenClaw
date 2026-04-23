import { describe, it, expect } from "vitest";
import { registerSchema, validateBody } from "@/lib/validation";

describe("registerSchema — public registration endpoint", () => {
  const validPayload = {
    email: "usuario@ejemplo.com",
    password: "Segura123",
    name: "Ana García",
    companyName: "Ski Resort SL",
  };

  it("accepts a valid new-tenant payload", () => {
    const result = validateBody(validPayload, registerSchema);
    expect(result.ok).toBe(true);
  });

  it("accepts a valid invite-flow payload (no companyName required)", () => {
    const result = validateBody(
      { email: "nuevo@empresa.com", password: "Fuerte99!", name: "Luis", inviteToken: "tok_abc" },
      registerSchema
    );
    expect(result.ok).toBe(true);
  });

  it("normalizes email — trims whitespace and lowercases", () => {
    const result = validateBody(
      { ...validPayload, email: "  USUARIO@Ejemplo.COM  " },
      registerSchema
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.email).toBe("usuario@ejemplo.com");
    }
  });

  it("rejects missing email — returns safe error, no DB write", () => {
    const { ok, error } = validateBody(
      { password: "Segura123", name: "Ana" },
      registerSchema
    );
    expect(ok).toBe(false);
    expect(error).toContain("email");
  });

  it("rejects invalid email format — returns safe error, no DB write", () => {
    const { ok, error } = validateBody(
      { ...validPayload, email: "not-an-email" },
      registerSchema
    );
    expect(ok).toBe(false);
    expect(error).toContain("email");
  });

  it("rejects missing password — returns safe error, no DB write", () => {
    const { ok, error } = validateBody(
      { email: "a@b.com", name: "Ana" },
      registerSchema
    );
    expect(ok).toBe(false);
    expect(error).toContain("password");
  });

  it("rejects password shorter than 8 characters", () => {
    const { ok, error } = validateBody(
      { ...validPayload, password: "Ab1" },
      registerSchema
    );
    expect(ok).toBe(false);
    expect(error).toContain("password");
  });

  it("rejects password with no uppercase letter", () => {
    const { ok, error } = validateBody(
      { ...validPayload, password: "sinmayus1" },
      registerSchema
    );
    expect(ok).toBe(false);
    expect(error).toContain("password");
  });

  it("rejects password with no lowercase letter", () => {
    const { ok, error } = validateBody(
      { ...validPayload, password: "SINMINUS1" },
      registerSchema
    );
    expect(ok).toBe(false);
    expect(error).toContain("password");
  });

  it("rejects password with no digit", () => {
    const { ok, error } = validateBody(
      { ...validPayload, password: "SinNumero" },
      registerSchema
    );
    expect(ok).toBe(false);
    expect(error).toContain("password");
  });

  it("rejects missing name — returns safe error, no DB write", () => {
    const { ok, error } = validateBody(
      { email: "a@b.com", password: "Segura123" },
      registerSchema
    );
    expect(ok).toBe(false);
    expect(error).toContain("name");
  });
});
