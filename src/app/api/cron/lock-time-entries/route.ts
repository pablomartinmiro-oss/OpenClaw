export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { rateLimit, getClientIP } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const rl = await rateLimit(getClientIP(req), "cron");
  if (rl) return rl;

  // Verify cron secret if configured
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const log = logger.child({ path: "/api/cron/lock-time-entries" });

  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 1); // 24h ago

    const result = await prisma.instructorTimeEntry.updateMany({
      where: {
        lockedAt: null,
        clockOut: { not: null },
        date: { lt: cutoff },
      },
      data: {
        lockedAt: new Date(),
        lockedBy: "system",
      },
    });

    // Also flag open entries (forgot to clock out) older than 24h
    const openEntries = await prisma.instructorTimeEntry.findMany({
      where: {
        lockedAt: null,
        clockOut: null,
        date: { lt: cutoff },
      },
      select: { id: true, instructorId: true, date: true },
    });

    if (openEntries.length > 0) {
      log.warn(
        { count: openEntries.length },
        "Open time entries found older than 24h (forgot to clock out)"
      );
    }

    log.info({ locked: result.count, openWarnings: openEntries.length }, "Auto-lock completed");
    return NextResponse.json({
      locked: result.count,
      openWarnings: openEntries.length,
    });
  } catch (error) {
    log.error(error, "Auto-lock cron failed");
    return NextResponse.json({ error: "Auto-lock failed" }, { status: 500 });
  }
}
