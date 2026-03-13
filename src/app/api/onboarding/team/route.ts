import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tenantId } = session.user;

  const users = await prisma.user.findMany({
    where: { tenantId, isActive: true },
    include: { role: true },
    orderBy: { createdAt: "asc" },
  });

  const members = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    roleName: u.role.name,
  }));

  return NextResponse.json({ members });
}
