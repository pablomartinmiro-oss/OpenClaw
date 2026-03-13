import { describe, it, expect, vi, beforeEach } from "vitest";

// We need to set up env before importing
const VALID_KEY = "a".repeat(64);

describe("encryption", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.ENCRYPTION_KEY = VALID_KEY;
  });

  it("encrypts and decrypts a string correctly", async () => {
    const { encrypt, decrypt } = await import("@/lib/encryption");
    const plaintext = "my-secret-ghl-token";

    const ciphertext = encrypt(plaintext);
    expect(ciphertext).not.toBe(plaintext);
    expect(ciphertext).toContain(":"); // iv:tag:encrypted format

    const decrypted = decrypt(ciphertext);
    expect(decrypted).toBe(plaintext);
  });

  it("produces different ciphertext for the same plaintext (random IV)", async () => {
    const { encrypt } = await import("@/lib/encryption");
    const plaintext = "same-token";

    const ct1 = encrypt(plaintext);
    const ct2 = encrypt(plaintext);

    expect(ct1).not.toBe(ct2); // Different IVs
  });

  it("fails to decrypt with tampered ciphertext", async () => {
    const { encrypt, decrypt } = await import("@/lib/encryption");
    const ciphertext = encrypt("test-token");

    // Tamper with the encrypted portion
    const parts = ciphertext.split(":");
    parts[2] = "0000" + parts[2].slice(4);
    const tampered = parts.join(":");

    expect(() => decrypt(tampered)).toThrow();
  });

  it("fails to decrypt with invalid format", async () => {
    const { decrypt } = await import("@/lib/encryption");

    expect(() => decrypt("not-valid-ciphertext")).toThrow(
      "Invalid ciphertext format"
    );
  });

  it("throws if ENCRYPTION_KEY is missing", async () => {
    process.env.ENCRYPTION_KEY = "";
    const { encrypt } = await import("@/lib/encryption");

    expect(() => encrypt("test")).toThrow("ENCRYPTION_KEY");
  });

  it("handles empty string encryption", async () => {
    const { encrypt, decrypt } = await import("@/lib/encryption");
    const plaintext = "";

    const ciphertext = encrypt(plaintext);
    const decrypted = decrypt(ciphertext);
    expect(decrypted).toBe(plaintext);
  });

  it("handles unicode characters", async () => {
    const { encrypt, decrypt } = await import("@/lib/encryption");
    const plaintext = "hello 🌍 世界";

    const ciphertext = encrypt(plaintext);
    const decrypted = decrypt(ciphertext);
    expect(decrypted).toBe(plaintext);
  });
});
