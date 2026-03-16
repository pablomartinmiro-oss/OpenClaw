-- GHL Cache Tables + Sync Infrastructure

-- CachedContact: mirrors GHL contacts for fast local reads
CREATE TABLE "CachedContact" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "tags" JSONB,
    "customFields" JSONB,
    "source" TEXT,
    "dateAdded" TIMESTAMP(3),
    "lastActivity" TIMESTAMP(3),
    "dnd" BOOLEAN NOT NULL DEFAULT false,
    "raw" JSONB,
    "cachedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CachedContact_pkey" PRIMARY KEY ("id")
);

-- CachedConversation: mirrors GHL conversations
CREATE TABLE "CachedConversation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "lastMessageBody" TEXT,
    "lastMessageDate" TIMESTAMP(3),
    "lastMessageType" TEXT,
    "unreadCount" INTEGER NOT NULL DEFAULT 0,
    "raw" JSONB,
    "cachedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CachedConversation_pkey" PRIMARY KEY ("id")
);

-- CachedOpportunity: mirrors GHL opportunities
CREATE TABLE "CachedOpportunity" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "pipelineId" TEXT NOT NULL,
    "pipelineStageId" TEXT NOT NULL,
    "name" TEXT,
    "contactId" TEXT,
    "contactName" TEXT,
    "monetaryValue" DOUBLE PRECISION,
    "status" TEXT,
    "assignedTo" TEXT,
    "lastActivity" TIMESTAMP(3),
    "raw" JSONB,
    "cachedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CachedOpportunity_pkey" PRIMARY KEY ("id")
);

-- CachedPipeline: mirrors GHL pipelines with stages
CREATE TABLE "CachedPipeline" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stages" JSONB NOT NULL,
    "raw" JSONB,
    "cachedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CachedPipeline_pkey" PRIMARY KEY ("id")
);

-- SyncQueue: failed API calls queued for retry
CREATE TABLE "SyncQueue" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 5,
    "lastError" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextRetryAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SyncQueue_pkey" PRIMARY KEY ("id")
);

-- SyncStatus: per-tenant sync metadata
CREATE TABLE "SyncStatus" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "lastFullSync" TIMESTAMP(3),
    "lastIncrSync" TIMESTAMP(3),
    "contactCount" INTEGER NOT NULL DEFAULT 0,
    "conversationCount" INTEGER NOT NULL DEFAULT 0,
    "opportunityCount" INTEGER NOT NULL DEFAULT 0,
    "pipelineCount" INTEGER NOT NULL DEFAULT 0,
    "syncInProgress" BOOLEAN NOT NULL DEFAULT false,
    "lastError" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SyncStatus_pkey" PRIMARY KEY ("id")
);

-- Indexes for CachedContact
CREATE INDEX "CachedContact_tenantId_idx" ON "CachedContact"("tenantId");
CREATE INDEX "CachedContact_tenantId_name_idx" ON "CachedContact"("tenantId", "name");
CREATE INDEX "CachedContact_tenantId_email_idx" ON "CachedContact"("tenantId", "email");
CREATE INDEX "CachedContact_tenantId_phone_idx" ON "CachedContact"("tenantId", "phone");

-- Indexes for CachedConversation
CREATE INDEX "CachedConversation_tenantId_idx" ON "CachedConversation"("tenantId");
CREATE INDEX "CachedConversation_tenantId_lastMessageDate_idx" ON "CachedConversation"("tenantId", "lastMessageDate");

-- Indexes for CachedOpportunity
CREATE INDEX "CachedOpportunity_tenantId_pipelineId_idx" ON "CachedOpportunity"("tenantId", "pipelineId");
CREATE INDEX "CachedOpportunity_tenantId_pipelineStageId_idx" ON "CachedOpportunity"("tenantId", "pipelineStageId");

-- Indexes for CachedPipeline
CREATE INDEX "CachedPipeline_tenantId_idx" ON "CachedPipeline"("tenantId");

-- Indexes for SyncQueue
CREATE INDEX "SyncQueue_tenantId_status_idx" ON "SyncQueue"("tenantId", "status");
CREATE INDEX "SyncQueue_status_nextRetryAt_idx" ON "SyncQueue"("status", "nextRetryAt");

-- Indexes for SyncStatus
CREATE UNIQUE INDEX "SyncStatus_tenantId_key" ON "SyncStatus"("tenantId");
CREATE INDEX "SyncStatus_tenantId_idx" ON "SyncStatus"("tenantId");

-- Foreign keys
ALTER TABLE "CachedContact" ADD CONSTRAINT "CachedContact_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CachedConversation" ADD CONSTRAINT "CachedConversation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CachedOpportunity" ADD CONSTRAINT "CachedOpportunity_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CachedPipeline" ADD CONSTRAINT "CachedPipeline_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SyncStatus" ADD CONSTRAINT "SyncStatus_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
