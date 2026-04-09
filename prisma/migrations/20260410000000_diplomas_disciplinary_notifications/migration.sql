-- Diploma
CREATE TABLE "Diploma" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "groupCellId" TEXT,
    "level" TEXT NOT NULL,
    "discipline" TEXT NOT NULL,
    "station" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "participantName" TEXT NOT NULL,
    "instructorName" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Diploma_pkey" PRIMARY KEY ("id")
);

-- DisciplinaryRecord
CREATE TABLE "DisciplinaryRecord" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "issuedBy" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "acknowledgedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DisciplinaryRecord_pkey" PRIMARY KEY ("id")
);

-- NotificationTemplate
CREATE TABLE "NotificationTemplate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "NotificationTemplate_pkey" PRIMARY KEY ("id")
);

-- NotificationLog
CREATE TABLE "NotificationLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "templateId" TEXT,
    "channel" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'sent',
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "error" TEXT,
    CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX "Diploma_tenantId_participantId_idx" ON "Diploma"("tenantId", "participantId");
CREATE INDEX "Diploma_tenantId_instructorId_idx" ON "Diploma"("tenantId", "instructorId");
CREATE INDEX "DisciplinaryRecord_tenantId_instructorId_idx" ON "DisciplinaryRecord"("tenantId", "instructorId");
CREATE UNIQUE INDEX "NotificationTemplate_tenantId_trigger_channel_key" ON "NotificationTemplate"("tenantId", "trigger", "channel");
CREATE INDEX "NotificationTemplate_tenantId_idx" ON "NotificationTemplate"("tenantId");
CREATE INDEX "NotificationLog_tenantId_sentAt_idx" ON "NotificationLog"("tenantId", "sentAt");

-- Foreign Keys
ALTER TABLE "Diploma" ADD CONSTRAINT "Diploma_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DisciplinaryRecord" ADD CONSTRAINT "DisciplinaryRecord_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DisciplinaryRecord" ADD CONSTRAINT "DisciplinaryRecord_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NotificationTemplate" ADD CONSTRAINT "NotificationTemplate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
