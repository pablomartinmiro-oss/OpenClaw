-- CreateTable
CREATE TABLE "Integration" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenExpiry" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InboxItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "externalId" TEXT,
    "subject" TEXT,
    "content" TEXT,
    "fromEmail" TEXT,
    "fromName" TEXT,
    "receivedAt" TIMESTAMP(3),
    "processedAt" TIMESTAMP(3),
    "aiSummary" TEXT,
    "requiresAction" BOOLEAN NOT NULL DEFAULT false,
    "actionType" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 3,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "snoozedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InboxItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChiefTask" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "source" TEXT,
    "sourceId" TEXT,
    "sourceContext" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 3,
    "status" TEXT NOT NULL DEFAULT 'todo',
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChiefTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Integration_userId_idx" ON "Integration"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Integration_userId_provider_key" ON "Integration"("userId", "provider");

-- CreateIndex
CREATE INDEX "InboxItem_userId_status_idx" ON "InboxItem"("userId", "status");

-- CreateIndex
CREATE INDEX "InboxItem_userId_requiresAction_idx" ON "InboxItem"("userId", "requiresAction");

-- CreateIndex
CREATE INDEX "InboxItem_externalId_idx" ON "InboxItem"("externalId");

-- CreateIndex
CREATE INDEX "ChiefTask_userId_status_idx" ON "ChiefTask"("userId", "status");

-- CreateIndex
CREATE INDEX "ChiefTask_userId_priority_idx" ON "ChiefTask"("userId", "priority");
