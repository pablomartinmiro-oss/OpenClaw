export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import {
  processUnpaidReminders,
  processPostPaymentFollowUp,
  processPreTripReminders,
  flagAtRiskQuotes,
} from "@/lib/quotes/follow-up";

const log = logger.child({ route: "/api/cron/quote-reminders" });

/**
 * PUBLIC GET endpoint for Railway cron — run daily at 09:00 Europe/Madrid.
 *
 * Processes ALL quote follow-up sequences:
 * 1. Unpaid reminders: reminder_1 (+24h), reminder_2 (+48h), discount (+72h),
 *    expiry_warning (2 days before), auto-expire (past validUntil)
 * 2. Post-payment: cross-sell (+24h after paid), review (+5h after checkOut)
 * 3. Pre-trip: 48h, 24h, day-of-arrival reminders
 * 4. At-risk flagging: 5+ days sent without payment → team notification
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const startTime = Date.now();

  try {
    // 1. Process unpaid quote reminder sequence
    const reminders = await processUnpaidReminders();

    // 2. Post-payment follow-ups (cross-sell + reviews)
    const postPayment = await processPostPaymentFollowUp();

    // 3. Pre-trip reminders for paid quotes
    const preTrip = await processPreTripReminders();

    // 4. Flag at-risk quotes (5+ days without payment)
    const atRisk = await flagAtRiskQuotes();

    const elapsed = Date.now() - startTime;

    const summary = {
      remindersSent: reminders.sent,
      quotesExpired: reminders.expired,
      crossSellSent: postPayment.crossSellSent,
      reviewsSent: postPayment.reviewsSent,
      preTripSent: preTrip.sent,
      atRiskFlagged: atRisk,
      errors: reminders.errors + postPayment.errors + preTrip.errors,
      elapsedMs: elapsed,
    };

    log.info(summary, "[CRON] Quote follow-up completed");

    return NextResponse.json(summary);
  } catch (error) {
    log.error({ error }, "[CRON] Quote follow-up failed");
    return NextResponse.json(
      { error: "Cron job failed" },
      { status: 500 }
    );
  }
}
