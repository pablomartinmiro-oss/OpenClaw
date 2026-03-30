export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

const PABLO_USER_ID = "pablo";

const transcriptAnalysisSchema = z.object({
  summary: z.string(),
  commitments: z.array(z.object({
    who: z.string().describe("'Pablo' or person's name"),
    what: z.string().describe("What they committed to do"),
    when: z.string().optional().describe("When (if mentioned)"),
  })),
  followUps: z.array(z.object({
    description: z.string(),
    person: z.string().optional(),
    urgency: z.enum(["urgent", "normal", "low"]).default("normal"),
  })),
  actionItems: z.array(z.object({
    title: z.string(),
    description: z.string().optional(),
    assignee: z.string().optional(),
    dueDate: z.string().optional(),
  })),
  decisions: z.array(z.string()),
  peopleAndAgreements: z.array(z.object({
    person: z.string(),
    agreement: z.string(),
  })),
  tasks: z.array(z.object({
    title: z.string(),
    description: z.string().optional(),
    priority: z.number().int().min(1).max(4).default(3),
    dueDate: z.string().nullable().optional(),
    source: z.literal("transcript"),
  })),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      transcript: string;
      meetingTitle?: string;
      meetingDate?: string;
      save?: boolean;
    };

    if (!body.transcript || body.transcript.trim().length === 0) {
      return NextResponse.json({ error: "Transcript is required" }, { status: 400 });
    }

    const meetingTitle = body.meetingTitle || "Reunión sin título";
    const meetingDate = body.meetingDate || new Date().toISOString().split("T")[0];

    const prompt = `Analiza este transcript de reunión de Pablo (GM de Sensa Padel y agencia Viddix AI).

Reunión: ${meetingTitle}
Fecha: ${meetingDate}

TRANSCRIPT:
${body.transcript.slice(0, 8000)}

Extrae:
1. Resumen ejecutivo de la reunión (2-3 oraciones en español)
2. Compromisos de Pablo ("yo te mando...", "lo reviso...", "te llamo...")
3. Follow-ups necesarios (con quién y sobre qué)
4. Action items discutidos
5. Decisiones clave tomadas
6. Personas mencionadas y qué se acordó con cada una
7. Lista de tareas concretas para Pablo (prioridad 1=urgente, 2=importante, 3=normal)

IMPORTANTE: Solo extrae tareas CONCRETAS y ACCIONABLES. No incluyas ideas vagas.
Para las fechas de tareas, usa formato YYYY-MM-DD o null si no se especificó.`;

    const result = await generateObject({
      model: anthropic("claude-sonnet-4-5"),
      schema: transcriptAnalysisSchema,
      prompt,
    });

    const analysis = result.object;

    // If save=true, persist to database
    if (body.save) {
      // Create an InboxItem for the transcript
      const inboxItem = await (prisma as any).inboxItem.create({
        data: {
          userId: PABLO_USER_ID,
          source: "transcript",
          subject: meetingTitle,
          content: body.transcript.slice(0, 5000),
          receivedAt: new Date(meetingDate),
          processedAt: new Date(),
          aiSummary: analysis.summary,
          requiresAction: analysis.tasks.length > 0,
          actionType: analysis.tasks.length > 0 ? "task" : "info",
          priority: Math.min(...(analysis.tasks.map(t => t.priority) || [3])),
          status: "pending",
        },
      });

      // Save tasks
      let tasksCreated = 0;
      for (const task of analysis.tasks) {
        let dueDate: Date | null = null;
        if (task.dueDate) {
          const parsed = new Date(task.dueDate);
          if (!isNaN(parsed.getTime())) dueDate = parsed;
        }

        await (prisma as any).chiefTask.create({
          data: {
            userId: PABLO_USER_ID,
            title: task.title,
            description: task.description || null,
            source: "transcript",
            sourceId: inboxItem.id,
            sourceContext: `${meetingTitle} (${meetingDate})`,
            priority: task.priority,
            status: "todo",
            dueDate,
          },
        });
        tasksCreated++;
      }

      return NextResponse.json({
        analysis,
        saved: true,
        tasksCreated,
        inboxItemId: inboxItem.id,
      });
    }

    return NextResponse.json({ analysis, saved: false });
  } catch (err) {
    console.error("Transcript processing error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Processing failed" },
      { status: 500 }
    );
  }
}
