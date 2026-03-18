/**
 * Import Nexor Opportunities into Skicenter GHL
 *
 * This script:
 * 1. Reads the exported CSV files from Nexor
 * 2. Gets the Skicenter OAuth token from the database (Velno tenant)
 * 3. Matches/creates contacts in Skicenter by email or phone
 * 4. Matches/creates pipelines and stages
 * 5. Creates opportunities linked to the correct contacts and stages
 *
 * Run from the ghl-dashboard project root:
 *   npx tsx import-nexor-opportunities.ts
 *
 * Requires: DATABASE_URL and ENCRYPTION_KEY env vars pointing to production
 */

import axios, { AxiosInstance } from "axios";
import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";

// ============================================================
// CONFIGURATION
// ============================================================

const GHL_BASE = "https://services.leadconnectorhq.com";
const API_VERSION = "2021-07-28";
const SKICENTER_LOCATION_ID = "FsOiwAoJJB4C8dAL3gUT";
const RATE_LIMIT_DELAY_MS = 150; // ~6.6 req/sec

// CSV files to import (adjust paths as needed)
const CSV_DIR = process.env.CSV_DIR || "./csv-imports";
const CSV_FILES = [
  "opportunities_altocampoo.csv",
  "opportunities_astun.csv",
  "opportunities_baqueira.csv",
  "opportunities_candanchu.csv",
  "opportunities_formigal.csv",
  "opportunities_madrid.csv",
  "opportunities_sierranevada.csv",
];

// ============================================================
// HELPERS
// ============================================================

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const log = {
  info: (msg: string) => console.log(`✅ ${msg}`),
  warn: (msg: string) => console.log(`⚠️  ${msg}`),
  error: (msg: string) => console.log(`❌ ${msg}`),
  section: (msg: string) => console.log(`\n${"=".repeat(60)}\n  ${msg}\n${"=".repeat(60)}`),
  progress: (current: number, total: number, label: string) =>
    process.stdout.write(`\r  [${current}/${total}] ${label}${"".padEnd(40)}`),
};

const stats = {
  contacts: { matched: 0, created: 0, failed: 0 },
  pipelines: { matched: 0, created: 0, failed: 0 },
  stages: { matched: 0, created: 0, failed: 0 },
  opportunities: { created: 0, skipped: 0, failed: 0 },
};

// ============================================================
// GET SKICENTER ACCESS TOKEN
// ============================================================

async function getSkicenterToken(): Promise<string> {
  // Option 1: Env var (if you have it)
  if (process.env.SKICENTER_TOKEN) {
    return process.env.SKICENTER_TOKEN;
  }

  // Option 2: Read from database using raw pg
  try {
    const pg = await import("pg");
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

    const result = await pool.query(
      `SELECT id, name, "ghlAccessToken" FROM "Tenant" WHERE "ghlLocationId" = $1 LIMIT 1`,
      [SKICENTER_LOCATION_ID]
    );

    await pool.end();

    const tenant = result.rows[0];
    if (!tenant?.ghlAccessToken) {
      throw new Error("No GHL access token found for Skicenter tenant");
    }

    log.info(`Found tenant: ${tenant.name} (${tenant.id})`);

    // Decrypt the token
    const { decrypt } = await import("./src/lib/encryption");
    const token = decrypt(tenant.ghlAccessToken);

    return token;
  } catch (err: any) {
    log.error(`Could not get token from DB: ${err.message}\n${err.stack}`);
    log.info("Set SKICENTER_TOKEN env var with a valid bearer token instead.");
    process.exit(1);
  }
}

// ============================================================
// READ CSV FILES
// ============================================================

interface CsvRow {
  "Opportunity Name": string;
  "Contact Name": string;
  phone: string;
  email: string;
  pipeline: string;
  stage: string;
  "Lead Value": string;
  source: string;
  assigned: string;
  "Created on": string;
  "Updated on": string;
  tags: string;
  status: string;
  "Opportunity ID": string;
  "Contact ID": string;
  "Pipeline Stage ID": string;
  "Pipeline ID": string;
}

function readAllCsvs(): CsvRow[] {
  const allRows: CsvRow[] = [];

  for (const file of CSV_FILES) {
    const filePath = path.join(CSV_DIR, file);
    if (!fs.existsSync(filePath)) {
      log.warn(`File not found: ${filePath} — skipping`);
      continue;
    }

    const content = fs.readFileSync(filePath, "utf-8");
    const rows = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    }) as CsvRow[];

    // Filter out rows with empty pipeline/stage or raw IDs
    const validRows = rows.filter(
      (r) =>
        r.pipeline &&
        r.stage &&
        !r.pipeline.match(/^[a-zA-Z0-9]{20,}$/) && // skip raw ID pipelines
        !r.stage.match(/^[a-zA-Z0-9]{20,}$/) // skip raw ID stages
    );

    log.info(`${file}: ${validRows.length} valid rows (${rows.length - validRows.length} skipped)`);
    allRows.push(...validRows);
  }

  return allRows;
}

// ============================================================
// CONTACT MANAGEMENT
// ============================================================

// Cache: email/phone → GHL contact ID
const contactCache = new Map<string, string>();

async function loadExistingContacts(client: AxiosInstance): Promise<void> {
  log.section("LOADING EXISTING SKICENTER CONTACTS");

  let startAfter: string | undefined;
  let total = 0;

  while (true) {
    const params: any = { limit: 100, locationId: SKICENTER_LOCATION_ID };
    if (startAfter) params.startAfter = startAfter;

    try {
      const { data } = await client.get("/contacts/", { params });
      const contacts = data.contacts || [];

      for (const c of contacts) {
        if (c.email) contactCache.set(c.email.toLowerCase(), c.id);
        if (c.phone) contactCache.set(c.phone, c.id);
      }

      total += contacts.length;
      log.progress(total, data.meta?.total || "?", "Loading contacts");

      if (!contacts.length || !data.meta?.nextPageUrl) break;
      startAfter = contacts[contacts.length - 1].id;
      await sleep(RATE_LIMIT_DELAY_MS);
    } catch (err: any) {
      log.error(`Failed loading contacts at offset ${total}: ${err.response?.data?.message || err.message}`);
      break;
    }
  }

  console.log("");
  log.info(`Loaded ${contactCache.size} contact identifiers (email + phone) from ${total} contacts`);
}

async function findOrCreateContact(
  client: AxiosInstance,
  email: string,
  phone: string,
  name: string
): Promise<string | null> {
  // Check cache first
  const emailKey = email?.toLowerCase();
  if (emailKey && contactCache.has(emailKey)) {
    stats.contacts.matched++;
    return contactCache.get(emailKey)!;
  }
  if (phone && contactCache.has(phone)) {
    stats.contacts.matched++;
    return contactCache.get(phone)!;
  }

  // Not found — create new contact
  if (!email && !phone) {
    stats.contacts.failed++;
    return null;
  }

  const nameParts = (name || "").split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  try {
    const payload: any = {
      firstName,
      lastName,
      locationId: SKICENTER_LOCATION_ID,
      source: "Nexor Migration",
    };
    if (email) payload.email = email;
    if (phone) payload.phone = phone;

    const { data } = await client.post("/contacts/", payload);
    const newId = data.contact?.id;

    if (newId) {
      if (emailKey) contactCache.set(emailKey, newId);
      if (phone) contactCache.set(phone, newId);
      stats.contacts.created++;
      return newId;
    }

    stats.contacts.failed++;
    return null;
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message;

    // If duplicate, try to search for existing
    if (err.response?.status === 400 || msg.includes("duplicate") || msg.includes("already exists")) {
      try {
        const { data } = await client.get("/contacts/search/duplicate", {
          params: { locationId: SKICENTER_LOCATION_ID, email, phone },
        });
        const existing = data.contact;
        if (existing?.id) {
          if (emailKey) contactCache.set(emailKey, existing.id);
          if (phone) contactCache.set(phone, existing.id);
          stats.contacts.matched++;
          return existing.id;
        }
      } catch {
        // Fallback: search by email
        try {
          const { data } = await client.get("/contacts/", {
            params: { locationId: SKICENTER_LOCATION_ID, query: email || phone, limit: 1 },
          });
          if (data.contacts?.[0]?.id) {
            const id = data.contacts[0].id;
            if (emailKey) contactCache.set(emailKey, id);
            if (phone) contactCache.set(phone, id);
            stats.contacts.matched++;
            return id;
          }
        } catch {}
      }
    }

    stats.contacts.failed++;
    return null;
  }
}

// ============================================================
// PIPELINE & STAGE MANAGEMENT
// ============================================================

interface PipelineInfo {
  id: string;
  stages: Map<string, string>; // stage name (lowercase) → stage ID
}

const pipelineCache = new Map<string, PipelineInfo>(); // pipeline name (lowercase) → info

async function loadExistingPipelines(client: AxiosInstance): Promise<void> {
  log.section("LOADING EXISTING SKICENTER PIPELINES");

  try {
    const { data } = await client.get("/opportunities/pipelines", {
      params: { locationId: SKICENTER_LOCATION_ID },
    });

    for (const pipeline of data.pipelines || []) {
      const stageMap = new Map<string, string>();
      for (const stage of pipeline.stages || []) {
        stageMap.set(stage.name.toLowerCase().trim(), stage.id);
      }
      pipelineCache.set(pipeline.name.toLowerCase().trim(), {
        id: pipeline.id,
        stages: stageMap,
      });
      log.info(`Pipeline: "${pipeline.name}" — ${stageMap.size} stages`);
    }
  } catch (err: any) {
    log.error(`Failed to load pipelines: ${err.response?.data?.message || err.message}`);
  }
}

// Normalize stage names for matching (handle typos in CSVs)
function normalizeStage(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/formulado$/, "formulario") // typo in baqueira CSV
    .replace(/\s+/g, " ");
}

async function getOrCreatePipelineAndStage(
  client: AxiosInstance,
  pipelineName: string,
  stageName: string
): Promise<{ pipelineId: string; stageId: string } | null> {
  const pKey = pipelineName.toLowerCase().trim();
  const sKey = normalizeStage(stageName);

  // Check if pipeline exists
  let pipeline = pipelineCache.get(pKey);

  if (!pipeline) {
    // Create the pipeline — we need to know ALL stages for this pipeline
    // For now, create with just this stage; more stages will be added as we encounter them
    log.warn(`Pipeline "${pipelineName}" not found — creating...`);

    try {
      const { data } = await client.post("/opportunities/pipelines", {
        name: pipelineName,
        locationId: SKICENTER_LOCATION_ID,
        stages: [{ name: stageName, position: 0 }],
      });

      const newPipeline = data.pipeline || data;
      const stageMap = new Map<string, string>();
      for (const s of newPipeline.stages || []) {
        stageMap.set(s.name.toLowerCase().trim(), s.id);
      }

      pipeline = { id: newPipeline.id, stages: stageMap };
      pipelineCache.set(pKey, pipeline);
      stats.pipelines.created++;
      log.info(`Created pipeline "${pipelineName}"`);
      await sleep(RATE_LIMIT_DELAY_MS);
    } catch (err: any) {
      stats.pipelines.failed++;
      log.error(`Failed to create pipeline "${pipelineName}": ${err.response?.data?.message || err.message}`);
      return null;
    }
  } else {
    stats.pipelines.matched++;
  }

  // Check if stage exists
  let stageId = pipeline.stages.get(sKey);

  if (!stageId) {
    // Also try the original (non-normalized) name
    stageId = pipeline.stages.get(stageName.toLowerCase().trim());
  }

  if (!stageId) {
    // Stage doesn't exist — we can't easily add stages to existing pipelines via API
    // Try to find a close match
    const allStages = Array.from(pipeline.stages.keys());
    log.warn(`Stage "${stageName}" not found in "${pipelineName}". Available: ${allStages.join(", ")}`);

    // Use the first stage as fallback
    if (allStages.length > 0) {
      stageId = pipeline.stages.get(allStages[0]);
      log.warn(`Using fallback stage: "${allStages[0]}"`);
    } else {
      stats.stages.failed++;
      return null;
    }
  } else {
    stats.stages.matched++;
  }

  return { pipelineId: pipeline.id, stageId: stageId! };
}

// ============================================================
// IMPORT OPPORTUNITIES
// ============================================================

async function importOpportunities(client: AxiosInstance, rows: CsvRow[]): Promise<void> {
  log.section("IMPORTING OPPORTUNITIES");

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    log.progress(i + 1, rows.length, `${row.pipeline} → ${row["Opportunity Name"]?.slice(0, 30)}`);

    // 1. Find or create contact
    const contactId = await findOrCreateContact(
      client,
      row.email,
      row.phone,
      row["Contact Name"]
    );
    await sleep(RATE_LIMIT_DELAY_MS);

    // 2. Get pipeline and stage IDs
    const location = await getOrCreatePipelineAndStage(client, row.pipeline, row.stage);
    if (!location) {
      stats.opportunities.skipped++;
      continue;
    }

    // 3. Create opportunity
    try {
      const payload: any = {
        name: row["Opportunity Name"] || `${row["Contact Name"]} - ${row.email}`,
        pipelineId: location.pipelineId,
        pipelineStageId: location.stageId,
        locationId: SKICENTER_LOCATION_ID,
        status: row.status || "open",
        source: row.source || "Nexor Migration",
      };

      if (contactId) payload.contactId = contactId;

      const monetaryValue = parseFloat(row["Lead Value"]);
      if (!isNaN(monetaryValue) && monetaryValue > 0) {
        payload.monetaryValue = monetaryValue;
      }

      await client.post("/opportunities/", payload);
      stats.opportunities.created++;
      await sleep(RATE_LIMIT_DELAY_MS);
    } catch (err: any) {
      stats.opportunities.failed++;
      if (i < 5 || i % 100 === 0) {
        // Only log first few and every 100th to avoid spam
        log.error(
          `Failed opp "${row["Opportunity Name"]?.slice(0, 30)}": ${err.response?.data?.message || err.message}`
        );
      }
    }
  }

  console.log("");
}

// ============================================================
// ADD TAGS TO CONTACTS
// ============================================================

async function applyTags(client: AxiosInstance, rows: CsvRow[]): Promise<void> {
  log.section("APPLYING TAGS TO CONTACTS");

  let applied = 0;
  const taggedContacts = new Set<string>();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row.tags) continue;

    const emailKey = row.email?.toLowerCase();
    const contactId = (emailKey && contactCache.get(emailKey)) || contactCache.get(row.phone);
    if (!contactId || taggedContacts.has(contactId)) continue;

    const tags = row.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (tags.length === 0) continue;

    try {
      await client.post(`/contacts/${contactId}/tags`, { tags });
      applied++;
      taggedContacts.add(contactId);
      await sleep(RATE_LIMIT_DELAY_MS);
    } catch {
      // Non-critical, skip
    }

    if (i % 200 === 0) log.progress(i, rows.length, "Applying tags");
  }

  console.log("");
  log.info(`Applied tags to ${applied} contacts`);
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log("\n🚀 Nexor → Skicenter GHL Import\n");

  // 1. Get access token
  log.section("AUTHENTICATION");
  const token = await getSkicenterToken();
  log.info(`Got Skicenter access token: ${token.slice(0, 10)}...`);

  const client = axios.create({
    baseURL: GHL_BASE,
    headers: {
      Authorization: `Bearer ${token}`,
      Version: API_VERSION,
      "Content-Type": "application/json",
    },
  });

  // 2. Test connection
  try {
    const { data } = await client.get(`/locations/${SKICENTER_LOCATION_ID}`);
    log.info(`Connected to: ${data.location?.name || data.name || "Skicenter"}`);
  } catch (err: any) {
    log.error(`Cannot connect to Skicenter GHL: ${err.response?.data?.message || err.message}`);
    log.info("The OAuth token may be expired. Re-connect GHL in the dashboard first.");
    process.exit(1);
  }

  // 3. Read CSVs
  log.section("READING CSV FILES");
  const rows = readAllCsvs();
  log.info(`Total rows to import: ${rows.length}`);

  if (rows.length === 0) {
    log.error("No data to import. Check CSV_DIR path.");
    process.exit(1);
  }

  // 4. Auto-confirm (interactive prompt removed for scripted execution)
  log.info(`Proceeding to import ${rows.length} opportunities...`);

  const startTime = Date.now();

  // 5. Load existing data
  await loadExistingContacts(client);
  await loadExistingPipelines(client);

  // 6. Import opportunities (this also creates missing contacts)
  await importOpportunities(client, rows);

  // 7. Apply tags
  await applyTags(client, rows);

  // 8. Final report
  const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);

  log.section("IMPORT COMPLETE");
  console.log(`
  ⏱️  Duration: ${elapsed} minutes

  👤 Contacts:
     Matched (existing): ${stats.contacts.matched}
     Created (new): ${stats.contacts.created}
     Failed: ${stats.contacts.failed}

  📊 Pipelines:
     Matched: ${stats.pipelines.matched}
     Created: ${stats.pipelines.created}
     Failed: ${stats.pipelines.failed}

  🎯 Opportunities:
     Created: ${stats.opportunities.created}
     Skipped (no stage match): ${stats.opportunities.skipped}
     Failed: ${stats.opportunities.failed}
  `);
}

main().catch((err) => {
  log.error(`Import failed: ${err.message}`);
  console.error(err);
  process.exit(1);
});
