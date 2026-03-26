/**
 * GHL-Builder Agent
 * Specialist: GoHighLevel API only
 * Job: Create pipelines, custom fields, tags, values, automations in a GHL location
 */

import { logger } from "@/lib/logger";

const log = logger.child({ agent: "ghl-builder" });
const GHL_BASE = "https://services.leadconnectorhq.com";

export interface GHLBuildSpec {
  locationId: string;
  locationToken: string;
  pipelines: Array<{ name: string; stages: string[] }>;
  customFields: Array<{ name: string; dataType: string }>;
  tags: string[];
  customValues: Array<{ name: string; value: string }>;
}

export interface GHLBuildResult {
  success: boolean;
  created: {
    pipelines: string[];
    customFields: string[];
    tags: string[];
    customValues: string[];
  };
  errors: string[];
  log: string[];
}

export async function runGHLBuilder(spec: GHLBuildSpec): Promise<GHLBuildResult> {
  const result: GHLBuildResult = {
    success: false,
    created: { pipelines: [], customFields: [], tags: [], customValues: [] },
    errors: [],
    log: [],
  };

  const h = {
    Authorization: `Bearer ${spec.locationToken}`,
    Version: "2021-07-28",
    "Content-Type": "application/json",
  };

  const emit = (msg: string) => {
    log.info(msg);
    result.log.push(`[GHL-Builder] ${msg}`);
  };

  emit(`Starting GHL build for location ${spec.locationId}`);

  // ── Custom Fields ──────────────────────────────────────────────────────────
  emit(`Creating ${spec.customFields.length} custom fields...`);
  for (const field of spec.customFields) {
    try {
      const res = await fetch(`${GHL_BASE}/locations/${spec.locationId}/customFields`, {
        method: "POST", headers: h,
        body: JSON.stringify({ name: field.name, dataType: field.dataType, model: "contact" }),
      });
      const d = await res.json() as { customField?: { id: string } };
      if (d.customField?.id) {
        result.created.customFields.push(field.name);
        emit(`  ✅ Field: ${field.name}`);
      }
    } catch (e) {
      result.errors.push(`Field ${field.name}: ${e}`);
      emit(`  ❌ Field failed: ${field.name}`);
    }
  }

  // ── Tags ──────────────────────────────────────────────────────────────────
  emit(`Creating ${spec.tags.length} tags...`);
  for (const tag of spec.tags) {
    try {
      await fetch(`${GHL_BASE}/locations/${spec.locationId}/tags`, {
        method: "POST", headers: h,
        body: JSON.stringify({ name: tag }),
      });
      result.created.tags.push(tag);
    } catch (e) {
      result.errors.push(`Tag ${tag}: ${e}`);
    }
  }
  emit(`  ✅ ${result.created.tags.length} tags created`);

  // ── Custom Values ─────────────────────────────────────────────────────────
  emit(`Creating ${spec.customValues.length} custom values...`);
  for (const val of spec.customValues) {
    try {
      const res = await fetch(`${GHL_BASE}/locations/${spec.locationId}/customValues`, {
        method: "POST", headers: h,
        body: JSON.stringify({ name: val.name, value: val.value }),
      });
      const d = await res.json() as { customValue?: { id: string } };
      if (d.customValue?.id) {
        result.created.customValues.push(val.name);
        emit(`  ✅ Value: ${val.name}`);
      }
    } catch (e) {
      result.errors.push(`Value ${val.name}: ${e}`);
    }
  }

  // ── Pipelines (note: GHL API doesn't support pipeline creation via token)
  // ── We log what needs to be created manually or via snapshot
  emit(`Pipelines needed (${spec.pipelines.length}) — will be loaded via snapshot:`);
  for (const p of spec.pipelines) {
    emit(`  📋 ${p.name}: ${p.stages.join(" → ")}`);
    result.created.pipelines.push(`${p.name} [snapshot-only]`);
  }

  result.success = result.errors.length === 0;
  emit(`Done. ${result.errors.length} errors. Fields: ${result.created.customFields.length}, Tags: ${result.created.tags.length}`);

  return result;
}
