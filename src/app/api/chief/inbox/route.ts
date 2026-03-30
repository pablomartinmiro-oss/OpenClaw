import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const PABLO_USER_ID = "pablo";

export async function GET() {
  try {
    const items = await (prisma as any).inboxItem.findMany({
      where: {
        userId: PABLO_USER_ID,
        requiresAction: true,
        status: "pending",
      },
      orderBy: [{ priority: "asc" }, { receivedAt: "desc" }],
      take: 50,
    });
    return NextResponse.json({ items });
  } catch (err) {
    console.error("Inbox fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch inbox" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json() as {
      id: string;
      status?: string;
      snoozedUntil?: string;
    };

    if (!body.id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    const updated = await (prisma as any).inboxItem.update({
      where: { id: body.id },
      data: {
        ...(body.status ? { status: body.status } : {}),
        ...(body.snoozedUntil ? { snoozedUntil: new Date(body.snoozedUntil) } : {}),
      },
    });

    return NextResponse.json({ item: updated });
  } catch (err) {
    console.error("Inbox update error:", err);
    return NextResponse.json({ error: "Failed to update inbox item" }, { status: 500 });
  }
}
