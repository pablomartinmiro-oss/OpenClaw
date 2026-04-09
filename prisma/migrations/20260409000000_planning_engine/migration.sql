-- Planning fields on Product
ALTER TABLE "Product" ADD COLUMN "discipline" TEXT;
ALTER TABLE "Product" ADD COLUMN "minAge" INTEGER;
ALTER TABLE "Product" ADD COLUMN "maxAge" INTEGER;
ALTER TABLE "Product" ADD COLUMN "maxParticipants" INTEGER;
ALTER TABLE "Product" ADD COLUMN "requiresGrouping" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Product" ADD COLUMN "planningMode" TEXT;
ALTER TABLE "Product" ADD COLUMN "defaultMeetingPointId" TEXT;

-- Participant
CREATE TABLE "Participant" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "birthDate" TIMESTAMP(3),
    "age" INTEGER,
    "ageBracket" TEXT,
    "discipline" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'es',
    "specialNeeds" TEXT,
    "relationship" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- OperationalUnit
CREATE TABLE "OperationalUnit" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "productId" TEXT,
    "activityDate" TIMESTAMP(3) NOT NULL,
    "planningMode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "groupCellId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "OperationalUnit_pkey" PRIMARY KEY ("id")
);

-- GroupCell
CREATE TABLE "GroupCell" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "activityDate" TIMESTAMP(3) NOT NULL,
    "station" TEXT NOT NULL,
    "timeSlotStart" TEXT NOT NULL,
    "timeSlotEnd" TEXT NOT NULL,
    "discipline" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "ageBracket" TEXT,
    "language" TEXT NOT NULL DEFAULT 'es',
    "maxParticipants" INTEGER NOT NULL DEFAULT 10,
    "instructorId" TEXT,
    "meetingPointId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "GroupCell_pkey" PRIMARY KEY ("id")
);

-- ClassCheckIn
CREATE TABLE "ClassCheckIn" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "groupCellId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "checkedAt" TIMESTAMP(3),
    "checkedBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ClassCheckIn_pkey" PRIMARY KEY ("id")
);

-- Incident
CREATE TABLE "Incident" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "groupCellId" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "participantId" TEXT,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'normal',
    "description" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "resolvedNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

-- FreeDayRequest
CREATE TABLE "FreeDayRequest" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "requestDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "FreeDayRequest_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX "Participant_tenantId_reservationId_idx" ON "Participant"("tenantId", "reservationId");

CREATE INDEX "OperationalUnit_tenantId_activityDate_status_idx" ON "OperationalUnit"("tenantId", "activityDate", "status");
CREATE INDEX "OperationalUnit_tenantId_reservationId_idx" ON "OperationalUnit"("tenantId", "reservationId");

CREATE INDEX "GroupCell_tenantId_activityDate_station_idx" ON "GroupCell"("tenantId", "activityDate", "station");
CREATE INDEX "GroupCell_tenantId_instructorId_activityDate_idx" ON "GroupCell"("tenantId", "instructorId", "activityDate");

CREATE UNIQUE INDEX "ClassCheckIn_tenantId_groupCellId_participantId_key" ON "ClassCheckIn"("tenantId", "groupCellId", "participantId");
CREATE INDEX "ClassCheckIn_tenantId_groupCellId_idx" ON "ClassCheckIn"("tenantId", "groupCellId");

CREATE INDEX "Incident_tenantId_groupCellId_idx" ON "Incident"("tenantId", "groupCellId");
CREATE INDEX "Incident_tenantId_instructorId_idx" ON "Incident"("tenantId", "instructorId");
CREATE INDEX "Incident_tenantId_resolved_idx" ON "Incident"("tenantId", "resolved");

CREATE UNIQUE INDEX "FreeDayRequest_tenantId_instructorId_requestDate_key" ON "FreeDayRequest"("tenantId", "instructorId", "requestDate");
CREATE INDEX "FreeDayRequest_tenantId_status_idx" ON "FreeDayRequest"("tenantId", "status");
CREATE INDEX "FreeDayRequest_tenantId_instructorId_idx" ON "FreeDayRequest"("tenantId", "instructorId");

-- Foreign Keys
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OperationalUnit" ADD CONSTRAINT "OperationalUnit_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OperationalUnit" ADD CONSTRAINT "OperationalUnit_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OperationalUnit" ADD CONSTRAINT "OperationalUnit_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OperationalUnit" ADD CONSTRAINT "OperationalUnit_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OperationalUnit" ADD CONSTRAINT "OperationalUnit_groupCellId_fkey" FOREIGN KEY ("groupCellId") REFERENCES "GroupCell"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "GroupCell" ADD CONSTRAINT "GroupCell_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GroupCell" ADD CONSTRAINT "GroupCell_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "GroupCell" ADD CONSTRAINT "GroupCell_meetingPointId_fkey" FOREIGN KEY ("meetingPointId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ClassCheckIn" ADD CONSTRAINT "ClassCheckIn_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClassCheckIn" ADD CONSTRAINT "ClassCheckIn_groupCellId_fkey" FOREIGN KEY ("groupCellId") REFERENCES "GroupCell"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClassCheckIn" ADD CONSTRAINT "ClassCheckIn_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Incident" ADD CONSTRAINT "Incident_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_groupCellId_fkey" FOREIGN KEY ("groupCellId") REFERENCES "GroupCell"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FreeDayRequest" ADD CONSTRAINT "FreeDayRequest_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FreeDayRequest" ADD CONSTRAINT "FreeDayRequest_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
