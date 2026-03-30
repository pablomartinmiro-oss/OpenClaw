export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getAgentPrompt } from "@/lib/agents/prompts";

const CANOPY_API_URL = "https://canopy-backend-production-81e1.up.railway.app";
const CANOPY_WORKSPACE_ID = "7154e597-bc18-48c3-9296-0c71676e976f";
const CANOPY_EMAIL = "pablo@viddixai.com";
const CANOPY_PASSWORD = "Atlas2026!";

// Cache the Canopy token to avoid re-auth on every request
let canopyToken: string | null = null;
let canopyTokenExpiry = 0;

interface AgentRunRequest {
  agent_name: string;
  task: string;
  agent_id?: string;
  session_id?: string;
}

interface ParsedAction {
  type: "CREATE_ISSUE" | "LOG" | "ALERT" | "FETCH_URL";
  title?: string;
  description?: string;
  priority?: string;
  message?: string;
  url?: string;
}

// ── Canopy auth ──────────────────────────────────────────────────────────────

async function getCanopyToken(): Promise<string | null> {
  if (canopyToken && Date.now() < canopyTokenExpiry) return canopyToken;

  try {
    const res = await fetch(`${CANOPY_API_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: CANOPY_EMAIL, password: CANOPY_PASSWORD }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    canopyToken = data.token ?? data.access_token ?? null;
    // tokens typically valid 1h; refresh 5 min early
    canopyTokenExpiry = Date.now() + 55 * 60 * 1000;
    return canopyToken;
  } catch {
    return null;
  }
}

// ── Action parser ────────────────────────────────────────────────────────────

function parseActions(text: string): ParsedAction[] {
  const actions: ParsedAction[] = [];
  // Split on ACTION: boundaries
  const blocks = text.split(/(?=ACTION:\s)/);

  for (const block of blocks) {
    const lines = block.trim().split("\n");
    const firstLine = lines[0]?.trim() ?? "";

    if (firstLine.startsWith("ACTION: CREATE_ISSUE")) {
      const action: ParsedAction = { type: "CREATE_ISSUE" };
      for (const line of lines.slice(1)) {
        if (line.startsWith("TITLE:")) action.title = line.replace("TITLE:", "").trim();
        else if (line.startsWith("PRIORITY:")) action.priority = line.replace("PRIORITY:", "").trim();
        else if (line.startsWith("DESCRIPTION:")) {
          // Description may be multi-line — grab everything after DESCRIPTION:
          const idx = lines.indexOf(line);
          action.description = lines
            .slice(idx)
            .join("\n")
            .replace(/^DESCRIPTION:\s*/, "")
            .trim();
          break;
        }
      }
      if (action.title) actions.push(action);
    } else if (firstLine.startsWith("ACTION: LOG")) {
      const msgLine = lines.find((l) => l.startsWith("MESSAGE:"));
      if (msgLine) {
        actions.push({ type: "LOG", message: msgLine.replace("MESSAGE:", "").trim() });
      }
    } else if (firstLine.startsWith("ACTION: ALERT")) {
      const action: ParsedAction = { type: "ALERT" };
      for (const line of lines.slice(1)) {
        if (line.startsWith("TITLE:")) action.title = line.replace("TITLE:", "").trim();
        else if (line.startsWith("DESCRIPTION:")) {
          const idx = lines.indexOf(line);
          action.description = lines
            .slice(idx)
            .join("\n")
            .replace(/^DESCRIPTION:\s*/, "")
            .trim();
          break;
        }
      }
      if (action.title) actions.push(action);
    } else if (firstLine.startsWith("ACTION: FETCH_URL")) {
      const urlLine = lines.find((l) => l.startsWith("URL:"));
      if (urlLine) {
        actions.push({ type: "FETCH_URL", url: urlLine.replace("URL:", "").trim() });
      }
    }
  }

  return actions;
}

// ── Action executor ──────────────────────────────────────────────────────────

async function createCanopyIssue(
  token: string,
  title: string,
  description: string,
  priority: string
): Promise<string | null> {
  try {
    const res = await fetch(`${CANOPY_API_URL}/api/v1/issues`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        workspace_id: CANOPY_WORKSPACE_ID,
        title,
        description,
        priority: priority ?? "medium",
        status: "open",
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.id ?? data.issue?.id ?? null;
  } catch {
    return null;
  }
}

async function fetchUrl(url: string): Promise<string> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    const text = await res.text();
    // Truncate to avoid blowing up context
    return text.length > 3000 ? text.slice(0, 3000) + "\n...[truncated]" : text;
  } catch (err) {
    return `Error fetching ${url}: ${err instanceof Error ? err.message : String(err)}`;
  }
}

async function executeActions(
  actions: ParsedAction[],
  token: string | null,
  agentName: string,
  claudeClient: Anthropic,
  systemPrompt: string,
  initialTask: string
): Promise<{ actionsTaken: string[]; issuesCreated: string[]; extraContext: string }> {
  const actionsTaken: string[] = [];
  const issuesCreated: string[] = [];
  let extraContext = "";

  for (const action of actions) {
    switch (action.type) {
      case "FETCH_URL": {
        if (!action.url) break;
        const content = await fetchUrl(action.url);
        extraContext += `\n\nFetched ${action.url}:\n${content}`;
        actionsTaken.push(`Fetched URL: ${action.url}`);
        break;
      }
      case "LOG": {
        actionsTaken.push(`Logged: ${action.message ?? ""}`);
        break;
      }
      case "CREATE_ISSUE":
      case "ALERT": {
        if (!action.title) break;
        const priority = action.type === "ALERT" ? "high" : (action.priority ?? "medium");
        const description = action.description ?? "";
        if (token) {
          const issueId = await createCanopyIssue(token, action.title, description, priority);
          if (issueId) {
            issuesCreated.push(`${action.title} (id: ${issueId})`);
          }
        }
        actionsTaken.push(`${action.type}: ${action.title}`);
        break;
      }
    }
  }

  // If we fetched URLs, run a second Claude pass with the fetched content
  if (extraContext && token) {
    try {
      const followUp = await claudeClient.messages.create({
        model: "claude-opus-4-5",
        max_tokens: 2048,
        system: systemPrompt,
        messages: [
          { role: "user", content: initialTask },
          {
            role: "user",
            content: `Here is the data you requested:\n${extraContext}\n\nNow complete your analysis and respond with the appropriate ACTION blocks.`,
          },
        ],
      });
      const followUpText =
        followUp.content
          .filter((b) => b.type === "text")
          .map((b) => (b as { type: "text"; text: string }).text)
          .join("\n") ?? "";

      // Parse and execute follow-up actions (no more FETCH_URL recursion)
      const followUpActions = parseActions(followUpText).filter(
        (a) => a.type !== "FETCH_URL"
      );
      for (const action of followUpActions) {
        if ((action.type === "CREATE_ISSUE" || action.type === "ALERT") && action.title && token) {
          const priority = action.type === "ALERT" ? "high" : (action.priority ?? "medium");
          const issueId = await createCanopyIssue(token, action.title, action.description ?? "", priority);
          if (issueId) issuesCreated.push(`${action.title} (id: ${issueId})`);
          actionsTaken.push(`${action.type}: ${action.title}`);
        } else if (action.type === "LOG") {
          actionsTaken.push(`Logged: ${action.message ?? ""}`);
        }
      }
    } catch {
      // follow-up pass failed, continue with original results
    }
  }

  return { actionsTaken, issuesCreated, extraContext };
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AgentRunRequest;
    const { agent_name, task, agent_id, session_id } = body;

    if (!agent_name || !task) {
      return NextResponse.json(
        { error: "agent_name and task are required", success: false },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured", success: false },
        { status: 500 }
      );
    }

    const claude = new Anthropic({ apiKey });
    const systemPrompt = getAgentPrompt(agent_name);

    // First Claude pass
    const response = await claude.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: "user", content: task }],
    });

    const output =
      response.content
        .filter((b) => b.type === "text")
        .map((b) => (b as { type: "text"; text: string }).text)
        .join("\n") ?? "";

    // Parse actions from initial response
    const actions = parseActions(output);

    // Get Canopy token (best-effort)
    const token = await getCanopyToken();

    // Execute actions (may do a second Claude pass if FETCH_URL present)
    const { actionsTaken, issuesCreated } = await executeActions(
      actions,
      token,
      agent_name,
      claude,
      systemPrompt,
      task
    );

    console.log(
      `[agents/run] agent=${agent_name} agent_id=${agent_id ?? "n/a"} session=${session_id ?? "n/a"} ` +
      `actions=${actionsTaken.length} issues=${issuesCreated.length}`
    );

    return NextResponse.json({
      output,
      actions_taken: actionsTaken,
      issues_created: issuesCreated,
      success: true,
    });
  } catch (err) {
    console.error("[agents/run] error:", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Unknown error",
        output: "",
        actions_taken: [],
        issues_created: [],
        success: false,
      },
      { status: 500 }
    );
  }
}
