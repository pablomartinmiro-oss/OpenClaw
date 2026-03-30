export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const revenues = await prisma.sensaRevenue.findMany({
      orderBy: { date: "desc" },
      take: 90,
    });
    return NextResponse.json({ revenues });
  } catch (error) {
    console.error("GET /api/sensa/revenue error:", error);
    return NextResponse.json({ error: "Failed to fetch revenue" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      courtBookings = 0,
      courtRevenue = 0,
      newMemberships = 0,
      membershipRevenue = 0,
      classesRevenue = 0,
      otherRevenue = 0,
      notes = "",
      date,
    } = body;

    const entry = await prisma.sensaRevenue.create({
      data: {
        date: date ? new Date(date) : new Date(),
        courtBookings: Number(courtBookings),
        courtRevenue: Number(courtRevenue),
        newMemberships: Number(newMemberships),
        membershipRevenue: Number(membershipRevenue),
        classesRevenue: Number(classesRevenue),
        otherRevenue: Number(otherRevenue),
        notes,
      },
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error("POST /api/sensa/revenue error:", error);
    return NextResponse.json({ error: "Failed to create revenue entry" }, { status: 500 });
  }
}
