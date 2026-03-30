/**
 * Sensa Padel AI Agent
 * Understands the business, queries real data, executes actions
 */

import { NextResponse } from "next/server";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const log = logger.child({ route: "/api/sensa/chat" });

// Tools the agent can use
async function getInactivePlayers(days: number) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  
  const players = await prisma.$queryRaw<Array<{
    id: string; name: string; phone: string | null; email: string | null;
    lastPlayedAt: Date | null; totalSessions: number; membershipType: string;
  }>>`
    SELECT id, name, phone, email, "lastPlayedAt", "totalSessions", "membershipType"
    FROM "SensaMember"
    WHERE "isActive" = true
    AND ("lastPlayedAt" IS NULL OR "lastPlayedAt" < ${cutoff})
    AND "membershipType" = 'none'
    ORDER BY "lastPlayedAt" DESC NULLS LAST
    LIMIT 50
  `;
  return players;
}

async function getHotLeads() {
  const leads = await prisma.$queryRaw<Array<{
    id: string; name: string; phone: string | null; visitCount: number;
    lastVisit: Date | null; status: string;
  }>>`
    SELECT id, name, phone, "visitCount", "lastVisit", status
    FROM "SensaLead"
    WHERE status IN ('new', 'warm', 'contacted')
    AND "visitCount" >= 2
    ORDER BY "lastVisit" DESC NULLS LAST
    LIMIT 20
  `;
  return leads;
}

async function getTodayStats() {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  const [todayRev, yesterdayRev, members] = await Promise.all([
    prisma.$queryRaw<Array<{ total: number; bookings: number; newPlayers: number }>>`
      SELECT COALESCE("totalRevenue", 0) as total, COALESCE("courtBookings", 0) as bookings, COALESCE("newPlayers", 0) as "newPlayers"
      FROM "SensaRevenue" WHERE date::text = ${today} LIMIT 1
    `,
    prisma.$queryRaw<Array<{ total: number }>>`
      SELECT COALESCE("totalRevenue", 0) as total FROM "SensaRevenue" WHERE date::text = ${yesterday} LIMIT 1
    `,
    prisma.$queryRaw<Array<{ type: string; count: number }>>`
      SELECT "membershipType" as type, COUNT(*) as count FROM "SensaMember"
      WHERE "isActive" = true GROUP BY "membershipType"
    `,
  ]);
  
  return { today: todayRev[0] || { total: 0, bookings: 0, newPlayers: 0 }, yesterday: yesterdayRev[0] || { total: 0 }, members };
}

async function sendWhatsApp(phone: string, message: string) {
  // For now, log the action - in future connect to WhatsApp Business API
  log.info({ phone, message: message.substring(0, 50) }, "WhatsApp send requested");
  return { sent: true, phone, preview: message.substring(0, 100) };
}

async function sendEmail(email: string, subject: string, body: string) {
  if (!process.env.RESEND_API_KEY) return { sent: false, reason: "No email configured" };
  
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to: email,
      subject,
      html: `<p>${body.replace(/\n/g, '<br>')}</p>`,
    }),
  });
  return { sent: res.ok, email };
}

export async function POST(req: Request) {
  try {
    const { message, history = [] } = await req.json() as {
      message: string;
      history: Array<{ role: "user" | "assistant"; content: string }>;
    };

    // Get current business context
    const stats = await getTodayStats().catch(() => null);
    
    const systemPrompt = `Eres el asistente de IA de Sensa Padel, un club de pádel con 6 pistas en España. 
Actúas como el asistente personal del GM (Pablo).

DATOS ACTUALES DEL NEGOCIO:
- Revenue hoy: €${stats?.today?.total || 0}
- Revenue ayer: €${stats?.yesterday?.total || 0}  
- Reservas hoy: ${stats?.today?.bookings || 0}
- Jugadores nuevos hoy: ${stats?.today?.newPlayers || 0}
- Socios: ${stats?.members?.map(m => `${m.count} ${m.type}`).join(', ') || 'no data'}

MEMBRESÍAS:
- Unlimited: €350/mes (reservas ilimitadas)
- Standard: €200/mes (8 reservas/mes)
- Sin membresía: pago por sesión

ACCIONES QUE PUEDES EJECUTAR:
Cuando el usuario pida algo, primero explica qué vas a hacer, luego ejecuta la acción.

Responde siempre en español. Sé directo y ejecuta lo que se pide.
Si necesitas datos (jugadores inactivos, leads, etc.), dime qué función usar y yo los busco.

FUNCIONES DISPONIBLES:
- GET_INACTIVE_PLAYERS(days) - jugadores sin venir X días
- GET_HOT_LEADS() - leads calientes pendientes
- SEND_WHATSAPP(phone, message) - enviar WhatsApp
- SEND_EMAIL(email, subject, body) - enviar email

Formato para acciones: usa [ACTION:FUNCTION_NAME(params)] en tu respuesta.`;

    // Check if we need to fetch data first
    let dataContext = "";
    
    if (message.toLowerCase().includes("inactiv") || message.toLowerCase().includes("no han venido") || message.toLowerCase().includes("mes") || message.toLowerCase().includes("semana")) {
      const days = message.includes("mes") ? 30 : message.includes("semana") ? 7 : 14;
      const inactive = await getInactivePlayers(days);
      dataContext = `\nJUGADORES INACTIVOS (${days} días): ${JSON.stringify(inactive.slice(0, 10))}`;
    }
    
    if (message.toLowerCase().includes("lead") || message.toLowerCase().includes("convertir")) {
      const leads = await getHotLeads();
      dataContext += `\nLEADS CALIENTES: ${JSON.stringify(leads.slice(0, 10))}`;
    }

    const { text } = await generateText({
      model: anthropic("claude-sonnet-4-6"),
      system: systemPrompt + dataContext,
      messages: [
        ...history.map(h => ({ role: h.role, content: h.content })),
        { role: "user" as const, content: message },
      ],
      maxTokens: 1000,
    });

    // Parse and execute actions from response
    const actions: Array<{ type: string; result: unknown }> = [];
    const actionRegex = /\[ACTION:(\w+)\(([^)]*)\)\]/g;
    let match;
    
    while ((match = actionRegex.exec(text)) !== null) {
      const [, fnName, paramsStr] = match;
      try {
        const params = paramsStr.split(',').map(p => p.trim().replace(/['"]/g, ''));
        
        if (fnName === 'SEND_WHATSAPP' && params.length >= 2) {
          const result = await sendWhatsApp(params[0], params.slice(1).join(','));
          actions.push({ type: 'whatsapp', result });
        } else if (fnName === 'SEND_EMAIL' && params.length >= 3) {
          const result = await sendEmail(params[0], params[1], params.slice(2).join(','));
          actions.push({ type: 'email', result });
        }
      } catch (e) {
        log.warn({ fnName, e }, "Action execution failed");
      }
    }

    // Clean action tags from response
    const cleanResponse = text.replace(actionRegex, '').trim();

    return NextResponse.json({
      response: cleanResponse,
      actions,
      success: true,
    });

  } catch (err) {
    log.error({ err }, "Sensa chat error");
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
