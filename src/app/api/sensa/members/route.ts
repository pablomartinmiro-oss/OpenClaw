import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const members = await prisma.sensaMember.findMany({
      where: { memberType: { in: ["unlimited", "standard"] } },
      include: {
        sessions: {
          orderBy: { playedAt: "desc" },
          take: 1,
        },
      },
      orderBy: { joinDate: "desc" },
    });

    // Sessions this month per member
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const membersWithCount = await Promise.all(
      members.map(async (m) => {
        const sessionsThisMonth = await prisma.sensaSession.count({
          where: { memberId: m.id, playedAt: { gte: monthStart } },
        });
        return { ...m, sessionsThisMonth };
      })
    );

    return NextResponse.json({ members: membersWithCount });
  } catch (error) {
    console.error("GET /api/sensa/members error:", error);
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, memberType = "standard", joinDate } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const member = await prisma.sensaMember.create({
      data: {
        name,
        phone: phone || null,
        email: email || null,
        memberType,
        joinDate: joinDate ? new Date(joinDate) : new Date(),
      },
    });

    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    console.error("POST /api/sensa/members error:", error);
    return NextResponse.json({ error: "Failed to create member" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, memberType } = body;

    if (!id) {
      return NextResponse.json({ error: "Member ID is required" }, { status: 400 });
    }

    const member = await prisma.sensaMember.update({
      where: { id },
      data: { memberType },
    });

    return NextResponse.json({ member });
  } catch (error) {
    console.error("PUT /api/sensa/members error:", error);
    return NextResponse.json({ error: "Failed to update member" }, { status: 500 });
  }
}
