export const dynamic = "force-dynamic";
import { anthropic } from "@ai-sdk/anthropic";
import { generateText, tool } from "ai";
import { z } from "zod";
import { requireTenant } from "@/lib/auth/guard";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { computeAgeBracket } from "@/lib/planning/types";

export const maxDuration = 30;

const SYSTEM_PROMPT = `Eres Atlas, el asistente AI de Skicenter — un ERP para escuelas de esqui.

CAPACIDADES:
- Crear reservas con participantes estructurados (nombre, edad, nivel, disciplina)
- Asignar clases a profesores en el horario
- Consultar el planning del dia (grupos, profesores, participantes)
- Consultar profesores disponibles
- Crear incidencias

REGLAS:
- Siempre responde en ESPANOL
- Se breve y directo (2-3 frases max)
- Cuando crees algo, confirma que se creo con los datos
- Si falta informacion, pregunta lo necesario
- Usa las herramientas disponibles, no inventes datos
- Niveles de esqui: A (principiante), B (basico), C (intermedio), D (avanzado)
- Disciplinas: esqui, snow, telemark, freestyle
- Horarios cursillos: manana 10:00-13:00, tarde 13:00-16:00
- Clases particulares: flexible 9:00-16:00

ESTACIONES: Baqueira Beret, Sierra Nevada, La Pinilla, Formigal, Grandvalira
`;

export async function POST(req: Request) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;

  try {
    const { messages } = await req.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ text: "ANTHROPIC_API_KEY no configurada." }, { status: 503 });
    }

    const result = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: SYSTEM_PROMPT,
      messages,
      maxTokens: 1000,
      tools: {
        createReservationWithParticipants: tool({
          description: "Crea una reserva con participantes estructurados para el planning de la escuela de esqui",
          parameters: z.object({
            clientName: z.string().describe("Nombre del titular de la reserva"),
            clientPhone: z.string().default("").describe("Telefono del titular"),
            clientEmail: z.string().default("").describe("Email del titular"),
            station: z.string().default("baqueira").describe("Estacion de esqui"),
            activityDate: z.string().describe("Fecha de la actividad (YYYY-MM-DD)"),
            schedule: z.string().default("10:00-13:00").describe("Horario"),
            source: z.string().default("web").describe("Origen de la reserva"),
            participants: z.array(z.object({
              firstName: z.string(),
              age: z.number().optional(),
              discipline: z.enum(["esqui", "snow", "telemark", "freestyle"]).default("esqui"),
              level: z.enum(["A", "B", "C", "D"]).default("A"),
              language: z.string().default("es"),
            })).describe("Lista de participantes"),
          }),
          execute: async ({ clientName, clientPhone, clientEmail, station, activityDate, schedule, source, participants }) => {
            const reservation = await prisma.reservation.create({
              data: {
                tenantId, clientName, clientPhone: clientPhone || "000000000",
                clientEmail: clientEmail || "", station, activityDate: new Date(activityDate),
                schedule, source, status: "confirmada", totalPrice: 0,
              },
            });
            const created = [];
            for (const p of participants) {
              const ageBracket = p.age ? computeAgeBracket(p.age) : "adulto";
              const participant = await prisma.participant.create({
                data: {
                  tenantId, reservationId: reservation.id,
                  firstName: p.firstName, age: p.age ?? null,
                  ageBracket, discipline: p.discipline, level: p.level,
                  language: p.language,
                },
              });
              created.push({ id: participant.id, name: p.firstName, level: p.level });
            }
            return { reservationId: reservation.id, clientName, station, date: activityDate, participants: created };
          },
        }),

        assignClassToInstructor: tool({
          description: "Crea un grupo (GroupCell) y asigna un profesor a una clase en un horario",
          parameters: z.object({
            instructorName: z.string().describe("Nombre del profesor"),
            date: z.string().describe("Fecha (YYYY-MM-DD)"),
            startTime: z.string().default("10:00").describe("Hora inicio (HH:mm)"),
            endTime: z.string().default("13:00").describe("Hora fin (HH:mm)"),
            discipline: z.enum(["esqui", "snow", "telemark", "freestyle"]).default("esqui"),
            level: z.enum(["A", "B", "C", "D"]).default("A"),
            station: z.string().default("baqueira"),
          }),
          execute: async ({ instructorName, date, startTime, endTime, discipline, level, station }) => {
            const instructor = await prisma.instructor.findFirst({
              where: { tenantId, user: { name: { contains: instructorName, mode: "insensitive" as const } } },
              include: { user: { select: { name: true } } },
            });
            if (!instructor) return { error: `Profesor "${instructorName}" no encontrado` };

            const group = await prisma.groupCell.create({
              data: {
                tenantId, activityDate: new Date(date), station,
                timeSlotStart: startTime, timeSlotEnd: endTime,
                discipline, level, instructorId: instructor.id, status: "confirmed",
              },
            });
            return { groupId: group.id, instructor: instructor.user.name, date, time: `${startTime}-${endTime}`, discipline, level };
          },
        }),

        getInstructors: tool({
          description: "Consulta los profesores disponibles con su informacion",
          parameters: z.object({
            station: z.string().optional().describe("Filtrar por estacion"),
          }),
          execute: async ({ station }) => {
            const where: Record<string, unknown> = { tenantId, isActive: true };
            if (station) where.station = station;
            const instructors = await prisma.instructor.findMany({
              where,
              include: { user: { select: { name: true } } },
              take: 20,
            });
            return instructors.map((i) => ({
              name: i.user.name, tdLevel: i.tdLevel, station: i.station,
              disciplines: i.disciplines, languages: i.languages,
              hourlyRate: i.hourlyRate,
            }));
          },
        }),

        getTodayPlanning: tool({
          description: "Consulta el planning del dia: grupos formados, profesores asignados, participantes",
          parameters: z.object({
            date: z.string().optional().describe("Fecha (YYYY-MM-DD), por defecto hoy"),
            station: z.string().optional(),
          }),
          execute: async ({ date, station }) => {
            const d = date ? new Date(date) : new Date();
            const dayStart = new Date(d); dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(d); dayEnd.setHours(23, 59, 59, 999);
            const where: Record<string, unknown> = { tenantId, activityDate: { gte: dayStart, lte: dayEnd } };
            if (station) where.station = station;
            const groups = await prisma.groupCell.findMany({
              where,
              include: {
                instructor: { select: { user: { select: { name: true } }, tdLevel: true } },
                units: { include: { participant: { select: { firstName: true, level: true, discipline: true } } } },
              },
            });
            return groups.map((g) => ({
              time: `${g.timeSlotStart}-${g.timeSlotEnd}`,
              discipline: g.discipline, level: g.level,
              instructor: g.instructor?.user.name ?? "Sin asignar",
              participants: g.units.map((u) => u.participant.firstName),
              count: g.units.length,
            }));
          },
        }),
      },
      maxSteps: 3,
    });

    logger.info({ userId: session.userId }, "AI chat completed");
    return NextResponse.json({ text: result.text });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al procesar la solicitud",
      code: "AI_CHAT_FAILED",
      logContext: { tenantId },
    });
  }
}
