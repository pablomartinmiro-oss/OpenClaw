export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const PABLO_USER_ID = "pablo";

export async function GET() {
  try {
    const tasks = await (prisma as any).chiefTask.findMany({
      where: {
        userId: PABLO_USER_ID,
        status: { notIn: ["done", "cancelled"] },
      },
      orderBy: [{ priority: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ tasks });
  } catch (err) {
    console.error("Tasks fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      title: string;
      description?: string;
      source?: string;
      sourceId?: string;
      sourceContext?: string;
      priority?: number;
      dueDate?: string;
    };

    if (!body.title?.trim()) {
      return NextResponse.json({ error: "Title required" }, { status: 400 });
    }

    const task = await (prisma as any).chiefTask.create({
      data: {
        userId: PABLO_USER_ID,
        title: body.title.trim(),
        description: body.description || null,
        source: body.source || "manual",
        sourceId: body.sourceId || null,
        sourceContext: body.sourceContext || null,
        priority: body.priority || 3,
        status: "todo",
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (err) {
    console.error("Task create error:", err);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json() as {
      id: string;
      status?: string;
      title?: string;
      priority?: number;
      dueDate?: string | null;
    };

    if (!body.id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    const data: Record<string, unknown> = { updatedAt: new Date() };
    if (body.status !== undefined) data.status = body.status;
    if (body.title !== undefined) data.title = body.title;
    if (body.priority !== undefined) data.priority = body.priority;
    if (body.dueDate !== undefined) data.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    if (body.status === "done") data.completedAt = new Date();

    const updated = await (prisma as any).chiefTask.update({
      where: { id: body.id },
      data,
    });

    return NextResponse.json({ task: updated });
  } catch (err) {
    console.error("Task update error:", err);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}
