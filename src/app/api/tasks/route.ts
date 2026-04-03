export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const log = logger.child({ tenantId, path: "/api/tasks" });
  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status");
  const quoteId = searchParams.get("quoteId");

  try {
    const where: Record<string, unknown> = { tenantId };
    if (status) where.status = status;
    if (quoteId) where.quoteId = quoteId;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        quote: { select: { id: true, clientName: true, destination: true } },
        quoteItem: { select: { id: true, name: true, category: true } },
      },
      orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al cargar tareas",
      code: "TASKS_FETCH_FAILED",
      logContext: { tenantId },
    });
  }
}

export async function PATCH(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId, userId } = session;
  const log = logger.child({ tenantId, path: "/api/tasks" });

  try {
    const body = await request.json();
    const { taskId, status: newStatus } = body;

    if (!taskId || !newStatus) {
      return NextResponse.json({ error: "taskId and status required" }, { status: 400 });
    }

    const task = await prisma.task.findFirst({ where: { id: taskId, tenantId } });
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: newStatus,
        completedAt: newStatus === "completed" ? new Date() : null,
        completedBy: newStatus === "completed" ? userId : null,
      },
    });

    log.info({ taskId, newStatus }, "Task updated");
    return NextResponse.json({ task: updated });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al actualizar tarea",
      code: "TASK_UPDATE_FAILED",
      logContext: { tenantId },
    });
  }
}
