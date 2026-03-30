export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

const PABLO_USER_ID = "pablo";

interface GmailTokens {
  accessToken: string;
  refreshToken: string | null;
  tokenExpiry: Date | null;
}

async function refreshGmailToken(tokens: GmailTokens): Promise<string> {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;

  if (!tokens.refreshToken) throw new Error("No refresh token available");

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: tokens.refreshToken,
      client_id: clientId!,
      client_secret: clientSecret!,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    throw new Error(`Token refresh failed: ${await response.text()}`);
  }

  const data = await response.json() as { access_token: string; expires_in: number };
  const tokenExpiry = new Date(Date.now() + data.expires_in * 1000);

  await (prisma as any).integration.update({
    where: { userId_provider: { userId: PABLO_USER_ID, provider: "gmail" } },
    data: {
      accessToken: data.access_token,
      tokenExpiry,
      updatedAt: new Date(),
    },
  });

  return data.access_token;
}

async function getValidAccessToken(tokens: GmailTokens): Promise<string> {
  if (tokens.tokenExpiry && new Date(tokens.tokenExpiry) < new Date(Date.now() + 5 * 60 * 1000)) {
    return refreshGmailToken(tokens);
  }
  return tokens.accessToken;
}

async function fetchGmailMessages(accessToken: string) {
  // Get list of unread message IDs
  const listUrl = new URL("https://gmail.googleapis.com/gmail/v1/users/me/messages");
  listUrl.searchParams.set("q", "is:unread -category:promotions -category:social -category:updates");
  listUrl.searchParams.set("maxResults", "50");

  const listResponse = await fetch(listUrl.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!listResponse.ok) {
    throw new Error(`Gmail list failed: ${listResponse.status}`);
  }

  const listData = await listResponse.json() as { messages?: Array<{ id: string }> };
  if (!listData.messages || listData.messages.length === 0) return [];

  // Fetch details for each message (batch, max 10 at a time)
  const messages = [];
  const batchSize = 10;
  for (let i = 0; i < Math.min(listData.messages.length, 50); i += batchSize) {
    const batch = listData.messages.slice(i, i + batchSize);
    const details = await Promise.all(
      batch.map(async (msg) => {
        const res = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!res.ok) return null;
        return res.json();
      })
    );
    messages.push(...details.filter(Boolean));
  }

  return messages;
}

function parseEmailHeaders(message: Record<string, unknown>) {
  const headers = (message.payload as Record<string, unknown>)?.headers as Array<{ name: string; value: string }> || [];
  const getHeader = (name: string) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || "";

  const from = getHeader("From");
  const subject = getHeader("Subject");
  const date = getHeader("Date");

  // Parse "Name <email>" format
  const fromMatch = from.match(/^(.+?)\s*<(.+?)>$/) || ["", from, from];
  const fromName = fromMatch[1]?.trim().replace(/"/g, "") || "";
  const fromEmail = fromMatch[2]?.trim() || from;

  return {
    fromName,
    fromEmail,
    subject,
    date,
    snippet: (message.snippet as string) || "",
  };
}

const emailAnalysisSchema = z.object({
  requiresAction: z.boolean(),
  actionType: z.enum(["reply", "follow-up", "task", "info", "spam"]).nullable(),
  priority: z.number().int().min(1).max(4),
  summary: z.string().max(200),
  extractedTasks: z.array(z.object({
    title: z.string(),
    description: z.string().optional(),
  })).optional(),
});

export async function POST() {
  try {
    const integration = await (prisma as any).integration.findUnique({
      where: { userId_provider: { userId: PABLO_USER_ID, provider: "gmail" } },
    });

    if (!integration || !integration.accessToken) {
      return NextResponse.json({ error: "Gmail not connected" }, { status: 400 });
    }

    const accessToken = await getValidAccessToken(integration as GmailTokens);
    const messages = await fetchGmailMessages(accessToken);

    if (messages.length === 0) {
      return NextResponse.json({ synced: 0, message: "No new unread emails" });
    }

    let syncedCount = 0;
    let tasksCreated = 0;

    for (const message of messages) {
      const msgRecord = message as Record<string, unknown>;
      const messageId = msgRecord.id as string;

      // Skip if already processed
      const existing = await (prisma as any).inboxItem.findFirst({
        where: { externalId: messageId, userId: PABLO_USER_ID },
      });
      if (existing) continue;

      const { fromName, fromEmail, subject, date, snippet } = parseEmailHeaders(msgRecord);

      // Use Claude to analyze the email
      const analysisPrompt = `Analyze this email and determine if Pablo (GM at Sensa Padel & Viddix AI agency) needs to take action.

From: ${fromName} <${fromEmail}>
Subject: ${subject}
Date: ${date}
Content preview: ${snippet}

Determine:
1. Does this require action from Pablo? (not newsletters, automated alerts, or FYI emails)
2. What type of action? reply=needs response, follow-up=Pablo needs to follow up on something, task=creates a work item, info=just informational, spam=junk
3. Priority: 1=urgent(today), 2=important(this week), 3=normal, 4=low
4. One-line summary in Spanish (max 150 chars)
5. Any specific tasks to extract (be selective, only concrete actionable items)`;

      let analysis;
      try {
        const result = await generateObject({
          model: anthropic("claude-haiku-4-5"),
          schema: emailAnalysisSchema,
          prompt: analysisPrompt,
        });
        analysis = result.object;
      } catch (aiErr) {
        console.error("AI analysis failed for message", messageId, aiErr);
        // Save with defaults
        analysis = {
          requiresAction: false,
          actionType: null,
          priority: 3,
          summary: subject || "Email sin analizar",
          extractedTasks: [],
        };
      }

      const receivedAt = date ? new Date(date) : new Date();

      // Save to InboxItem
      const inboxItem = await (prisma as any).inboxItem.create({
        data: {
          userId: PABLO_USER_ID,
          source: "gmail",
          externalId: messageId,
          subject: subject || null,
          content: snippet || null,
          fromEmail: fromEmail || null,
          fromName: fromName || null,
          receivedAt: isNaN(receivedAt.getTime()) ? new Date() : receivedAt,
          processedAt: new Date(),
          aiSummary: analysis.summary,
          requiresAction: analysis.requiresAction,
          actionType: analysis.actionType || null,
          priority: analysis.priority,
          status: "pending",
        },
      });

      syncedCount++;

      // Extract and save tasks
      if (analysis.requiresAction && analysis.extractedTasks && analysis.extractedTasks.length > 0) {
        for (const task of analysis.extractedTasks) {
          await (prisma as any).chiefTask.create({
            data: {
              userId: PABLO_USER_ID,
              title: task.title,
              description: task.description || null,
              source: "gmail",
              sourceId: inboxItem.id,
              sourceContext: `${fromName}: ${subject}`,
              priority: analysis.priority,
              status: "todo",
            },
          });
          tasksCreated++;
        }
      }
    }

    // Update last sync time
    await (prisma as any).integration.update({
      where: { userId_provider: { userId: PABLO_USER_ID, provider: "gmail" } },
      data: {
        metadata: { lastSync: new Date().toISOString() },
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      synced: syncedCount,
      tasksCreated,
      total: messages.length,
      message: `Procesados ${syncedCount} emails nuevos, ${tasksCreated} tareas creadas`,
    });
  } catch (err) {
    console.error("Gmail sync error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Sync failed" },
      { status: 500 }
    );
  }
}
