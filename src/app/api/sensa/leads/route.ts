export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const leads = await prisma.sensaLead.findMany({
      where: { status: { not: "converted" } },
      include: {
        member: true,
      },
      orderBy: { lastVisit: "desc" },
    });
    return NextResponse.json({ leads });
  } catch (error) {
    console.error("GET /api/sensa/leads error:", error);
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, notes, followUpDate, convertedAt } = body;

    if (!id) {
      return NextResponse.json({ error: "Lead ID is required" }, { status: 400 });
    }

    const data: Record<string, unknown> = {};
    if (status) data.status = status;
    if (notes !== undefined) data.notes = notes;
    if (followUpDate) data.followUpDate = new Date(followUpDate);
    if (convertedAt) data.convertedAt = new Date(convertedAt);

    // If converting, also update member type
    if (status === "converted") {
      const lead = await prisma.sensaLead.findUnique({ where: { id } });
      if (lead) {
        await prisma.sensaMember.update({
          where: { id: lead.memberId },
          data: { memberType: "standard" },
        });
      }
      data.convertedAt = new Date();
    }

    const lead = await prisma.sensaLead.update({
      where: { id },
      data,
      include: { member: true },
    });

    return NextResponse.json({ lead });
  } catch (error) {
    console.error("PUT /api/sensa/leads error:", error);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}
