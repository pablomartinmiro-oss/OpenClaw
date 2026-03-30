-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "station" DROP DEFAULT;

-- CreateTable
CREATE TABLE "SensaMember" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "memberType" TEXT NOT NULL DEFAULT 'none',
    "joinDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SensaMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SensaRevenue" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "courtBookings" INTEGER NOT NULL DEFAULT 0,
    "courtRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "newMemberships" INTEGER NOT NULL DEFAULT 0,
    "membershipRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "classesRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "otherRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SensaRevenue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SensaSession" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "court" TEXT,
    "amountPaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isFirst" BOOLEAN NOT NULL DEFAULT false,
    "playedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SensaSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SensaLead" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "firstVisit" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastVisit" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visitCount" INTEGER NOT NULL DEFAULT 1,
    "followUpDate" TIMESTAMP(3),
    "notes" TEXT,
    "convertedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SensaLead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SensaMember_memberType_idx" ON "SensaMember"("memberType");

-- CreateIndex
CREATE INDEX "SensaMember_createdAt_idx" ON "SensaMember"("createdAt");

-- CreateIndex
CREATE INDEX "SensaRevenue_date_idx" ON "SensaRevenue"("date");

-- CreateIndex
CREATE INDEX "SensaSession_memberId_idx" ON "SensaSession"("memberId");

-- CreateIndex
CREATE INDEX "SensaSession_playedAt_idx" ON "SensaSession"("playedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SensaLead_memberId_key" ON "SensaLead"("memberId");

-- CreateIndex
CREATE INDEX "SensaLead_status_idx" ON "SensaLead"("status");

-- CreateIndex
CREATE INDEX "SensaLead_lastVisit_idx" ON "SensaLead"("lastVisit");

-- AddForeignKey
ALTER TABLE "SensaSession" ADD CONSTRAINT "SensaSession_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "SensaMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SensaLead" ADD CONSTRAINT "SensaLead_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "SensaMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
