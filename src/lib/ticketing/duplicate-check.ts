import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

interface DuplicateResult {
  hardDuplicate: boolean;
  softDuplicate: boolean;
  existingRedemption?: {
    id: string;
    code: string;
    email: string | null;
    phone: string | null;
    status: string;
    createdAt: Date;
  };
}

/**
 * Check for duplicate coupon redemptions.
 * - hardDuplicate: exact code match for this tenant
 * - softDuplicate: same email on same day, or same phone with same product
 */
export async function checkDuplicates(
  tenantId: string,
  code: string,
  email?: string,
  phone?: string
): Promise<DuplicateResult> {
  const log = logger.child({ tenantId, service: "duplicate-check" });

  try {
    // Hard duplicate: exact code match
    const exactMatch = await prisma.couponRedemption.findFirst({
      where: { tenantId, code: { equals: code, mode: "insensitive" } },
      select: { id: true, code: true, email: true, phone: true, status: true, createdAt: true },
    });

    if (exactMatch) {
      log.info({ code, matchId: exactMatch.id }, "Hard duplicate found");
      return {
        hardDuplicate: true,
        softDuplicate: false,
        existingRedemption: exactMatch,
      };
    }

    // Soft duplicate: same email today or same phone today
    if (email || phone) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const orConditions = [];
      if (email) {
        orConditions.push({
          email: { equals: email, mode: "insensitive" as const },
          createdAt: { gte: todayStart, lte: todayEnd },
        });
      }
      if (phone) {
        orConditions.push({
          phone: { equals: phone },
          createdAt: { gte: todayStart, lte: todayEnd },
        });
      }

      const softMatch = await prisma.couponRedemption.findFirst({
        where: { tenantId, OR: orConditions },
        select: { id: true, code: true, email: true, phone: true, status: true, createdAt: true },
      });

      if (softMatch) {
        log.info({ code, softMatchId: softMatch.id }, "Soft duplicate found");
        return {
          hardDuplicate: false,
          softDuplicate: true,
          existingRedemption: softMatch,
        };
      }
    }

    return { hardDuplicate: false, softDuplicate: false };
  } catch (error) {
    log.error({ err: error }, "Duplicate check failed");
    return { hardDuplicate: false, softDuplicate: false };
  }
}
