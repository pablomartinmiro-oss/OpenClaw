import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { logger } from "@/lib/logger";
import { calculatePrice } from "@/lib/pricing/calculator";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tenantId } = session.user;
  const log = logger.child({ tenantId, path: "/api/pricing" });

  try {
    const body = await request.json();
    const { station, activityDate, items } = body;

    if (!station || !activityDate || !items?.length) {
      return NextResponse.json(
        { error: "Missing required fields: station, activityDate, items" },
        { status: 400 }
      );
    }

    const result = await calculatePrice({
      tenantId,
      station,
      activityDate: new Date(activityDate),
      items,
    });

    log.info({ station, season: result.season, total: result.total }, "Price calculated");
    return NextResponse.json(result);
  } catch (error) {
    log.error({ error }, "Failed to calculate price");
    return NextResponse.json(
      { error: "Failed to calculate price" },
      { status: 500 }
    );
  }
}
