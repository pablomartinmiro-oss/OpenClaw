import { describe, it, expect } from "vitest";
import { createSign, generateKeyPairSync } from "crypto";

/**
 * Tests for GHL webhook signature verification.
 *
 * We can't test with GHL's real private key (we only have the public key),
 * so we test the verification logic with a test key pair.
 */

describe("GHL Webhook Signature Verification", () => {
  // Generate a test RSA key pair
  const { publicKey, privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 4096,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });

  function signPayload(payload: string, key: string): string {
    const signer = createSign("SHA256");
    signer.update(payload);
    signer.end();
    return signer.sign(key, "base64");
  }

  function verifyWithKey(
    rawBody: string,
    signature: string | null,
    pubKey: string
  ): boolean {
    if (!signature) return true; // Match production behavior
    try {
      const { createVerify } = require("crypto");
      const verifier = createVerify("SHA256");
      verifier.update(rawBody);
      verifier.end();
      return verifier.verify(pubKey, signature, "base64");
    } catch {
      return false;
    }
  }

  it("accepts a valid RSA signature", () => {
    const body = JSON.stringify({ type: "ContactCreate", locationId: "loc-1" });
    const sig = signPayload(body, privateKey);
    expect(verifyWithKey(body, sig, publicKey)).toBe(true);
  });

  it("rejects a tampered payload", () => {
    const body = JSON.stringify({ type: "ContactCreate", locationId: "loc-1" });
    const sig = signPayload(body, privateKey);

    const tampered = JSON.stringify({ type: "ContactCreate", locationId: "HACKED" });
    expect(verifyWithKey(tampered, sig, publicKey)).toBe(false);
  });

  it("rejects a garbage signature", () => {
    const body = JSON.stringify({ type: "ContactCreate", locationId: "loc-1" });
    expect(verifyWithKey(body, "not-a-real-signature", publicKey)).toBe(false);
  });

  it("accepts requests with no signature header (graceful degradation)", () => {
    const body = JSON.stringify({ type: "ContactCreate", locationId: "loc-1" });
    expect(verifyWithKey(body, null, publicKey)).toBe(true);
  });

  it("treats empty string signature same as missing (graceful degradation)", () => {
    const body = JSON.stringify({ type: "ContactCreate", locationId: "loc-1" });
    // Empty string is falsy — treated same as null (no header present)
    const result = verifyWithKey(body, "", publicKey);
    expect(result).toBe(true);
  });
});
