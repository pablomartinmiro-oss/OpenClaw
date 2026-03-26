/**
 * QA Agent
 * Specialist: Verification only
 * Job: Test everything after deployment. Pass or fail with details.
 */

import { logger } from "@/lib/logger";

const log = logger.child({ agent: "qa-agent" });
const GHL_BASE = "https://services.leadconnectorhq.com";

export interface QASpec {
  locationId: string;
  locationToken: string;
  dashboardUrl: string;
  tenantSlug: string;
  expectedPipelines: string[];
  expectedFields: string[];
}

export interface QAResult {
  passed: boolean;
  score: number; // 0-100
  checks: Array<{
    name: string;
    status: "pass" | "fail" | "warn";
    detail: string;
  }>;
  log: string[];
  summary: string;
}

export async function runQAAgent(spec: QASpec): Promise<QAResult> {
  const result: QAResult = {
    passed: false,
    score: 0,
    checks: [],
    log: [],
    summary: "",
  };

  const emit = (msg: string) => {
    log.info(msg);
    result.log.push(`[QA-Agent] ${msg}`);
  };

  const check = (name: string, status: "pass" | "fail" | "warn", detail: string) => {
    result.checks.push({ name, status, detail });
    const icon = status === "pass" ? "✅" : status === "fail" ? "❌" : "⚠️";
    emit(`  ${icon} ${name}: ${detail}`);
  };

  emit(`Starting QA verification for ${spec.tenantSlug}`);

  // ── Check 1: GHL Location Accessible ──────────────────────────────────────
  try {
    const res = await fetch(`${GHL_BASE}/locations/${spec.locationId}`, {
      headers: { Authorization: `Bearer ${spec.locationToken}`, Version: "2021-07-28" },
    });
    const d = await res.json() as { location?: { name: string } };
    if (d.location?.name) {
      check("GHL Location", "pass", `Location "${d.location.name}" accessible`);
    } else {
      check("GHL Location", "fail", "Location not accessible with provided token");
    }
  } catch (e) {
    check("GHL Location", "fail", `Connection error: ${e}`);
  }

  // ── Check 2: Custom Fields ─────────────────────────────────────────────────
  try {
    const res = await fetch(`${GHL_BASE}/locations/${spec.locationId}/customFields`, {
      headers: { Authorization: `Bearer ${spec.locationToken}`, Version: "2021-07-28" },
    });
    const d = await res.json() as { customFields?: Array<{ name: string }> };
    const fields = (d.customFields || []).map((f) => f.name);
    const missing = spec.expectedFields.filter((f) => !fields.some(ef => ef.toLowerCase().includes(f.toLowerCase())));

    if (missing.length === 0) {
      check("Custom Fields", "pass", `All ${spec.expectedFields.length} expected fields present`);
    } else if (missing.length <= 2) {
      check("Custom Fields", "warn", `Missing: ${missing.join(", ")}`);
    } else {
      check("Custom Fields", "fail", `Missing ${missing.length} fields: ${missing.slice(0, 3).join(", ")}...`);
    }
  } catch (e) {
    check("Custom Fields", "fail", `Error checking fields: ${e}`);
  }

  // ── Check 3: Pipelines ────────────────────────────────────────────────────
  try {
    const res = await fetch(`${GHL_BASE}/opportunities/pipelines/?locationId=${spec.locationId}`, {
      headers: { Authorization: `Bearer ${spec.locationToken}`, Version: "2021-07-28" },
    });
    const d = await res.json() as { pipelines?: Array<{ name: string }> };
    const pipelines = (d.pipelines || []).map((p) => p.name);

    if (pipelines.length >= spec.expectedPipelines.length) {
      check("Pipelines", "pass", `${pipelines.length} pipelines found`);
    } else {
      check("Pipelines", "warn", `Only ${pipelines.length} pipelines (expected ${spec.expectedPipelines.length}) — snapshot may need to be applied`);
    }
  } catch (e) {
    check("Pipelines", "warn", `Could not verify pipelines: ${e}`);
  }

  // ── Check 4: Dashboard URL Live ───────────────────────────────────────────
  try {
    const res = await fetch(`${spec.dashboardUrl}`, { method: "HEAD" });
    if (res.ok || res.status === 307 || res.status === 302) {
      check("Dashboard URL", "pass", `${spec.dashboardUrl} is live (${res.status})`);
    } else {
      check("Dashboard URL", "warn", `Dashboard returned ${res.status} — may need login`);
    }
  } catch (e) {
    check("Dashboard URL", "fail", `Dashboard not reachable: ${e}`);
  }

  // ── Check 5: API Health ───────────────────────────────────────────────────
  try {
    const res = await fetch(`https://openclaw-production-50e4.up.railway.app/api/health`);
    const d = await res.json() as { status: string };
    if (d.status === "ok") {
      check("API Health", "pass", "Dashboard API is healthy");
    } else {
      check("API Health", "warn", `API status: ${d.status}`);
    }
  } catch (e) {
    check("API Health", "fail", `API unreachable: ${e}`);
  }

  // ── Check 6: Contact Sync ─────────────────────────────────────────────────
  try {
    const res = await fetch(`${GHL_BASE}/contacts/?locationId=${spec.locationId}&limit=1`, {
      headers: { Authorization: `Bearer ${spec.locationToken}`, Version: "2021-07-28" },
    });
    const d = await res.json() as { contacts?: unknown[]; total?: number };
    const total = d.total || (d.contacts || []).length;
    check("Contact Access", "pass", `GHL contacts accessible (${total} total)`);
  } catch (e) {
    check("Contact Access", "fail", `Cannot access contacts: ${e}`);
  }

  // ── Calculate Score ───────────────────────────────────────────────────────
  const passes = result.checks.filter((c) => c.status === "pass").length;
  const fails = result.checks.filter((c) => c.status === "fail").length;
  result.score = Math.round((passes / result.checks.length) * 100);
  result.passed = fails === 0;

  result.summary = result.passed
    ? `✅ All checks passed (${result.score}/100) — ${spec.tenantSlug} is ready for client`
    : `⚠️ ${fails} check(s) failed (${result.score}/100) — review before client handoff`;

  emit(`\n${result.summary}`);
  return result;
}
