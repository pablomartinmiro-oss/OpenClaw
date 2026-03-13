import { describe, it, expect, vi, beforeEach } from "vitest";

describe("GHL client", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.ENABLE_MOCK_GHL = "true";
    process.env.ENCRYPTION_KEY = "a".repeat(64);
  });

  it("returns mock client when ENABLE_MOCK_GHL is true", async () => {
    const { createGHLClient } = await import("@/lib/ghl/client");
    const client = await createGHLClient("test-tenant-id");

    expect(client).toBeDefined();
    expect(typeof client.get).toBe("function");
    expect(typeof client.post).toBe("function");
    expect(typeof client.put).toBe("function");
  });

  it("mock client returns contacts on GET /contacts", async () => {
    const { createGHLClient } = await import("@/lib/ghl/client");
    const client = await createGHLClient("test-tenant-id");

    const res = await client.get("/contacts");
    const data = res.data as { contacts: unknown[] };
    expect(data.contacts).toBeDefined();
    expect(data.contacts.length).toBeGreaterThan(0);
  });

  it("mock client returns conversations on GET /conversations/search", async () => {
    const { createGHLClient } = await import("@/lib/ghl/client");
    const client = await createGHLClient("test-tenant-id");

    const res = await client.get("/conversations/search");
    const data = res.data as { conversations: unknown[] };
    expect(data.conversations).toBeDefined();
    expect(data.conversations.length).toBeGreaterThan(0);
  });

  it("mock client returns pipelines on GET /opportunities/pipelines", async () => {
    const { createGHLClient } = await import("@/lib/ghl/client");
    const client = await createGHLClient("test-tenant-id");

    const res = await client.get("/opportunities/pipelines");
    const data = res.data as { pipelines: unknown[] };
    expect(data.pipelines).toBeDefined();
    expect(data.pipelines.length).toBeGreaterThan(0);
  });

  it("mock client returns opportunities on GET /opportunities/search", async () => {
    const { createGHLClient } = await import("@/lib/ghl/client");
    const client = await createGHLClient("test-tenant-id");

    const res = await client.get("/opportunities/search");
    const data = res.data as { opportunities: unknown[] };
    expect(data.opportunities).toBeDefined();
    expect(data.opportunities.length).toBeGreaterThan(0);
  });

  it("mock client returns created entity on POST", async () => {
    const { createGHLClient } = await import("@/lib/ghl/client");
    const client = await createGHLClient("test-tenant-id");

    const res = await client.post("/contacts/", { firstName: "Test" });
    const data = res.data as { id: string; firstName: string };
    expect(data.id).toBeDefined();
    expect(data.firstName).toBe("Test");
  });
});
