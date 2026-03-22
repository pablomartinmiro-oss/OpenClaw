-- AlterTable
ALTER TABLE "Quote" ADD COLUMN "lastReminderStep" TEXT;
ALTER TABLE "Quote" ADD COLUMN "crossSellSentAt" TIMESTAMP(3);
ALTER TABLE "Quote" ADD COLUMN "reviewSentAt" TIMESTAMP(3);
ALTER TABLE "Quote" ADD COLUMN "preTripStep" TEXT;
