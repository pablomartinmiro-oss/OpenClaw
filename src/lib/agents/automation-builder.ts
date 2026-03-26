/**
 * Automation-Builder Agent
 * Specialist: GHL workflows + sequences only
 * Job: Configure automations based on client brief
 */

import { logger } from "@/lib/logger";

const log = logger.child({ agent: "automation-builder" });
const GHL_BASE = "https://services.leadconnectorhq.com";

export interface AutomationSpec {
  locationId: string;
  locationToken: string;
  snapshotIds: string[];  // Skicenter, Carson Reed
  bottlenecks: string[];
  industry: string;
  useWhatsApp: boolean;
  automationsToActivate: string[];
}

export interface AutomationResult {
  success: boolean;
  activated: string[];
  skipped: string[];
  log: string[];
  errors: string[];
}

// Map of automation names to their configs
const AUTOMATION_CONFIGS: Record<string, {
  description: string;
  trigger: string;
  priority: number;
}> = {
  "Speed to Lead": {
    description: "Instant SMS + email within 60 seconds of new lead",
    trigger: "contact_created",
    priority: 1,
  },
  "Follow Up Sequence": {
    description: "Day 1, 3, 7, 14, 30 follow-up sequence",
    trigger: "tag_added:new-lead",
    priority: 2,
  },
  "Appointment Booking": {
    description: "Confirmation + reminders for booked appointments",
    trigger: "appointment_booked",
    priority: 3,
  },
  "Won - Welcome Client": {
    description: "Welcome email + task creation when deal is won",
    trigger: "opportunity_won",
    priority: 4,
  },
  "Review Request": {
    description: "Post-service review request sequence",
    trigger: "tag_added:service-complete",
    priority: 5,
  },
  "Win-back 30 Days": {
    description: "Re-engagement sequence after 30 days no activity",
    trigger: "no_activity_days:30",
    priority: 6,
  },
  "Facebook Lead Intake": {
    description: "Instant response to Facebook ad leads",
    trigger: "facebook_lead",
    priority: 7,
  },
  "Membership Nurture": {
    description: "Convert trial users to paying members",
    trigger: "tag_added:trial-done",
    priority: 8,
  },
};

export async function runAutomationBuilder(spec: AutomationSpec): Promise<AutomationResult> {
  const result: AutomationResult = {
    success: false,
    activated: [],
    skipped: [],
    log: [],
    errors: [],
  };

  const emit = (msg: string) => {
    log.info(msg);
    result.log.push(`[Automation-Builder] ${msg}`);
  };

  emit(`Starting automation build for location ${spec.locationId}`);
  emit(`Bottlenecks detected: ${spec.bottlenecks.join(", ")}`);

  // Determine which automations to build based on bottlenecks
  const toActivate = new Set(spec.automationsToActivate);

  // Auto-add based on bottlenecks
  if (spec.bottlenecks.some(b => b.toLowerCase().includes("lead") || b.toLowerCase().includes("follow"))) {
    toActivate.add("Speed to Lead");
    toActivate.add("Follow Up Sequence");
    emit(`  → Adding Speed to Lead + Follow Up (lead leakage detected)`);
  }
  if (spec.bottlenecks.some(b => b.toLowerCase().includes("appointment") || b.toLowerCase().includes("booking"))) {
    toActivate.add("Appointment Booking");
    emit(`  → Adding Appointment Booking (booking issue detected)`);
  }
  if (spec.industry.toLowerCase().includes("sport") || spec.industry.toLowerCase().includes("fitness") || spec.industry.toLowerCase().includes("padel")) {
    toActivate.add("Membership Nurture");
    toActivate.add("Win-back 30 Days");
    emit(`  → Adding Membership Nurture + Win-back (sports/fitness industry)`);
  }

  emit(`Automations to activate: ${Array.from(toActivate).join(", ")}`);

  // Check existing workflows to avoid duplicates
  let existingWorkflows: string[] = [];
  try {
    const res = await fetch(`${GHL_BASE}/workflows/?locationId=${spec.locationId}`, {
      headers: { Authorization: `Bearer ${spec.locationToken}`, Version: "2021-07-28" },
    });
    const d = await res.json() as { workflows?: Array<{ name: string }> };
    existingWorkflows = (d.workflows || []).map((w) => w.name);
    emit(`  Found ${existingWorkflows.length} existing workflows`);
  } catch (e) {
    emit(`  Could not fetch existing workflows — proceeding`);
  }

  // Document automations (GHL workflow creation requires UI — we document + snapshot approach)
  for (const autoName of Array.from(toActivate)) {
    const config = AUTOMATION_CONFIGS[autoName];
    if (!config) {
      result.skipped.push(autoName);
      continue;
    }

    if (existingWorkflows.some(w => w.includes(autoName))) {
      emit(`  ⏭️ Skipping ${autoName} — already exists`);
      result.skipped.push(autoName);
      continue;
    }

    // Log the automation spec for snapshot/manual creation
    emit(`  📋 ${autoName} (priority ${config.priority})`);
    emit(`     Trigger: ${config.trigger}`);
    emit(`     ${config.description}`);
    if (spec.useWhatsApp) {
      emit(`     Channel: WhatsApp (primary) + Email (backup)`);
    } else {
      emit(`     Channel: SMS + Email`);
    }

    result.activated.push(autoName);
  }

  // Document snapshot features needed
  if (spec.snapshotIds.includes("carson_reed")) {
    emit(`\n  📦 Carson Reed snapshot features to load:`);
    emit(`     - Meta Lead Ads webhook intake`);
    emit(`     - AI caller speed-to-lead (Bland AI integration)`);
    emit(`     - 30-day nurture sequence`);
    emit(`     - Appointment booking funnel`);
  }

  if (spec.snapshotIds.includes("skicenter")) {
    emit(`\n  📦 Skicenter snapshot features to load:`);
    emit(`     - Multi-service booking pipeline`);
    emit(`     - Package/bundle quote flow`);
    emit(`     - Seasonal campaign templates`);
    emit(`     - Review request post-service`);
  }

  result.success = true;
  emit(`\nDone. ${result.activated.length} automations configured, ${result.skipped.length} skipped.`);
  emit(`Next step: Apply snapshot(s) in GHL UI to activate these workflows.`);

  return result;
}
