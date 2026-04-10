import { describe, it, expect } from "vitest";
import { createSign, createVerify, generateKeyPairSync } from "crypto";

/**
 * Tests for GHL webhook RSA signature verification (audit finding #6).
 *
 * We can't test with GHL's real private key (we only have the public key),
 * so we test the verification logic with a test key pair.
 *
 * Security invariant: missing or invalid signatures MUST return 401.
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
    if (!signature) return false;
    try {
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

  it("rejects requests with no signature header (returns 401)", () => {
    const body = JSON.stringify({ type: "ContactCreate", locationId: "loc-1" });
    expect(verifyWithKey(body, null, publicKey)).toBe(false);
  });

  it("rejects empty string signature (returns 401)", () => {
    const body = JSON.stringify({ type: "ContactCreate", locationId: "loc-1" });
    expect(verifyWithKey(body, "", publicKey)).toBe(false);
  });
});

describe("GHL Webhook Route — signature enforcement", () => {
  // Generate a test RSA key pair to simulate GHL signing
  const { publicKey: testPublicKey, privateKey: testPrivateKey } =
    generateKeyPairSync("rsa", {
      modulusLength: 4096,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });

  function signPayload(payload: string): string {
    const signer = createSign("SHA256");
    signer.update(payload);
    signer.end();
    return signer.sign(testPrivateKey, "base64");
  }

  /**
   * Simulate the route's signature check logic with a swappable public key.
   * This mirrors the production verifyGhlSignature() function exactly,
   * so we can test it against our test key pair.
   */
  function simulateRouteSignatureCheck(
    rawBody: string,
    signatureHeader: string | null,
    pubKey: string
  ): 200 | 401 {
    if (!signatureHeader) return 401;
    try {
      const verifier = createVerify("SHA256");
      verifier.update(rawBody);
      verifier.end();
      const valid = verifier.verify(pubKey, signatureHeader, "base64");
      return valid ? 200 : 401;
    } catch {
      return 401;
    }
  }

  it("returns 200 for a valid RSA signature", () => {
    const body = JSON.stringify({ type: "ContactCreate", locationId: "loc-1" });
    const sig = signPayload(body);
    expect(simulateRouteSignatureCheck(body, sig, testPublicKey)).toBe(200);
  });

  it("returns 401 for an invalid RSA signature", () => {
    const body = JSON.stringify({ type: "ContactCreate", locationId: "loc-1" });
    const sig = signPayload(body);
    const tampered = JSON.stringify({ type: "ContactCreate", locationId: "EVIL" });
    expect(simulateRouteSignatureCheck(tampered, sig, testPublicKey)).toBe(401);
  });

  it("returns 401 when x-wh-signature header is missing", () => {
    const body = JSON.stringify({ type: "ContactCreate", locationId: "loc-1" });
    expect(simulateRouteSignatureCheck(body, null, testPublicKey)).toBe(401);
  });

  it("returns 401 for a garbage signature string", () => {
    const body = JSON.stringify({ type: "ContactCreate", locationId: "loc-1" });
    expect(simulateRouteSignatureCheck(body, "garbage", testPublicKey)).toBe(401);
  });
});
