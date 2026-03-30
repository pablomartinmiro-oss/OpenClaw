import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

const PABLO_USER_ID = "pablo";
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8599127311:AAHuF9UfbA0W1IpSo9yaD_JpjbVfZ-a8dCg";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "2130743649";

async function sendTelegram(message: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: "Markdown",
        }),
      }
    );
    const data = await response.json() as { ok: boolean };
    return data.ok;
  } catch (err) {
    console.error("Telegram send error:", err);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({})) as { send_telegram?: boolean };
    const sendToTelegram = body.send_telegram ?? false;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    // Get pending tasks ordered by priority + due date
    const tasks = await (prisma as any).chiefTask.findMany({
      where: {
        userId: PABLO_USER_ID,
        status: { in: ["todo", "in_progress"] },
      },
      orderBy: [{ priority: "asc" }, { dueDate: "asc" }],
      take: 20,
    });

    // Get overdue tasks
    const overdueTasks = tasks.filter((t: { dueDate: Date | null }) =>
      t.dueDate && new Date(t.dueDate) < today
    );

    // Get inbox items requiring action
    const inboxItems = await (prisma as any).inboxItem.findMany({
      where: {
        userId: PABLO_USER_ID,
        requiresAction: true,
        status: "pending",
      },
      orderBy: [{ priority: "asc" }, { receivedAt: "desc" }],
      take: 10,
    });

    // Get hot leads from Sensa Padel (visited but not contacted in 7+ days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const hotLeads = await prisma.sensaLead.findMany({
      where: {
        status: { in: ["new", "hot"] },
        lastVisit: { gte: sevenDaysAgo },
      },
      include: { member: { select: { name: true, phone: true } } },
      orderBy: { lastVisit: "desc" },
      take: 5,
    });

    // Build context for Claude
    const urgentTasks = tasks.filter((t: { priority: number }) => t.priority === 1);
    const importantTasks = tasks.filter((t: { priority: number }) => t.priority === 2);
    const normalTasks = tasks.filter((t: { priority: number; dueDate: Date | null }) =>
      t.priority >= 3 && t.dueDate && new Date(t.dueDate) <= tomorrow
    );

    const contextData = {
      fecha: now.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" }),
      tareasUrgentes: urgentTasks.map((t: { title: string; dueDate: Date | null; sourceContext: string | null }) => ({
        titulo: t.title,
        vence: t.dueDate ? new Date(t.dueDate).toLocaleDateString("es-ES") : null,
        contexto: t.sourceContext,
      })),
      tareasImportantes: importantTasks.map((t: { title: string; dueDate: Date | null; sourceContext: string | null }) => ({
        titulo: t.title,
        vence: t.dueDate ? new Date(t.dueDate).toLocaleDateString("es-ES") : null,
        contexto: t.sourceContext,
      })),
      tareasHoy: normalTasks.map((t: { title: string }) => ({ titulo: t.title })),
      tareasVencidas: overdueTasks.map((t: { title: string; dueDate: Date | null }) => ({
        titulo: t.title,
        vencio: t.dueDate ? new Date(t.dueDate).toLocaleDateString("es-ES") : null,
      })),
      emailsAccion: inboxItems.map((item: { fromName: string | null; subject: string | null; aiSummary: string | null; actionType: string | null }) => ({
        de: item.fromName || item.subject,
        asunto: item.subject,
        resumen: item.aiSummary,
        tipo: item.actionType,
      })),
      leadsCalientes: hotLeads.map((lead) => ({
        nombre: lead.member.name,
        ultimaVisita: new Date(lead.lastVisit).toLocaleDateString("es-ES"),
        diasDesdeVisita: Math.floor((now.getTime() - new Date(lead.lastVisit).getTime()) / (1000 * 60 * 60 * 24)),
        telefono: lead.member.phone,
      })),
    };

    const prompt = `Eres el Chief of Staff personal de Pablo. Genera su briefing diario en español, conciso y accionable.

Datos de hoy (${contextData.fecha}):
${JSON.stringify(contextData, null, 2)}

Genera el briefing con este formato EXACTO (usa Markdown de Telegram, asteriscos para bold):

🌅 *Buenos días Pablo*

${contextData.tareasVencidas.length > 0 ? `*⚠️ Tareas vencidas:*\n${contextData.tareasVencidas.map((t: { titulo: string; vencio: string | null }) => `• ${t.titulo} (venció ${t.vencio})`).join("\n")}\n\n` : ""}*🔴 Urgente (haz esto primero):*
[si no hay, escribe "• Nada urgente hoy 🎉"]

*🟡 Importante hoy:*
[lista o "• Todo bajo control"]

*📧 Emails que necesitan respuesta:*
[lista o "• Bandeja limpia ✅"]

*🎾 Sensa Padel - Leads calientes:*
[lista o "• Sin leads pendientes"]

*Para mañana:* [1-2 frases sobre qué viene mañana]

Sé breve y directo. Máximo 50 palabras por sección.`;

    const { text: briefing } = await generateText({
      model: anthropic("claude-sonnet-4-5"),
      prompt,
    });

    if (sendToTelegram) {
      const sent = await sendTelegram(briefing);
      return NextResponse.json({ briefing, sent });
    }

    return NextResponse.json({ briefing });
  } catch (err) {
    console.error("Briefing error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Briefing failed" },
      { status: 500 }
    );
  }
}
