export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const players = await prisma.sensaMember.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        sessions: { orderBy: { playedAt: "desc" }, take: 1 },
        lead: true,
      },
    });
    return NextResponse.json({ players });
  } catch (error) {
    console.error("GET /api/sensa/players error:", error);
    return NextResponse.json({ error: "Failed to fetch players" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, court, isFirst = false, amountPaid = 0 } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Create or find member
    const member = await prisma.sensaMember.create({
      data: {
        name,
        phone: phone || null,
        email: email || null,
        memberType: "none",
      },
    });

    // Create session
    await prisma.sensaSession.create({
      data: {
        memberId: member.id,
        court: court || null,
        amountPaid: Number(amountPaid),
        isFirst: Boolean(isFirst),
        playedAt: new Date(),
      },
    });

    // Create lead if first visit
    if (isFirst) {
      await prisma.sensaLead.create({
        data: {
          memberId: member.id,
          status: "new",
          firstVisit: new Date(),
          lastVisit: new Date(),
          visitCount: 1,
        },
      });
    }

    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    console.error("POST /api/sensa/players error:", error);
    return NextResponse.json({ error: "Failed to create player" }, { status: 500 });
  }
}
