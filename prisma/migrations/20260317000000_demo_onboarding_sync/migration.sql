-- AlterTable: Add demo, onboarding, and sync progress fields to Tenant
ALTER TABLE "Tenant" ADD COLUMN "isDemo" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Tenant" ADD COLUMN "onboardingStep1" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Tenant" ADD COLUMN "onboardingStep2" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Tenant" ADD COLUMN "onboardingStep3" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Tenant" ADD COLUMN "onboardingDismissed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Tenant" ADD COLUMN "syncState" TEXT;
ALTER TABLE "Tenant" ADD COLUMN "syncProgressMsg" TEXT;
ALTER TABLE "Tenant" ADD COLUMN "lastSyncAt" TIMESTAMP(3);
ALTER TABLE "Tenant" ADD COLUMN "lastSyncError" TEXT;
