-- CreateTable
CREATE TABLE "Instructor" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tdLevel" TEXT NOT NULL,
    "certExpiry" TIMESTAMP(3),
    "certNumber" TEXT,
    "disciplines" JSONB NOT NULL DEFAULT '[]',
    "specialties" JSONB NOT NULL DEFAULT '[]',
    "languages" JSONB NOT NULL DEFAULT '[]',
    "maxLevel" TEXT,
    "hourlyRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "perStudentBonus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "contractType" TEXT NOT NULL DEFAULT 'fijo_discontinuo',
    "station" TEXT NOT NULL,
    "seasonStart" TIMESTAMP(3),
    "seasonEnd" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Instructor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstructorAvailability" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstructorAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstructorTimeEntry" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "clockIn" TIMESTAMP(3) NOT NULL,
    "clockOut" TIMESTAMP(3),
    "totalMinutes" INTEGER NOT NULL DEFAULT 0,
    "breakMinutes" INTEGER NOT NULL DEFAULT 0,
    "netMinutes" INTEGER NOT NULL DEFAULT 0,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "ipAddress" TEXT,
    "geoLat" DOUBLE PRECISION,
    "geoLon" DOUBLE PRECISION,
    "lockedAt" TIMESTAMP(3),
    "lockedBy" TEXT,
    "correctionOf" TEXT,
    "correctionReason" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstructorTimeEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstructorAssignment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "lessonType" TEXT NOT NULL,
    "studentCount" INTEGER NOT NULL DEFAULT 1,
    "scheduledStart" TEXT NOT NULL,
    "scheduledEnd" TEXT NOT NULL,
    "hourlyRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bonusPerStudent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "surcharge" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "surchargeReason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'assigned',
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstructorAssignment_pkey" PRIMARY KEY ("id")
);

-- Add instructorId to BookingMonitor
ALTER TABLE "BookingMonitor" ADD COLUMN "instructorId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Instructor_userId_key" ON "Instructor"("userId");
CREATE INDEX "Instructor_tenantId_isActive_idx" ON "Instructor"("tenantId", "isActive");
CREATE INDEX "Instructor_tenantId_station_idx" ON "Instructor"("tenantId", "station");
CREATE UNIQUE INDEX "Instructor_tenantId_userId_key" ON "Instructor"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "InstructorAvailability_tenantId_instructorId_idx" ON "InstructorAvailability"("tenantId", "instructorId");
CREATE UNIQUE INDEX "InstructorAvailability_tenantId_instructorId_dayOfWeek_key" ON "InstructorAvailability"("tenantId", "instructorId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "InstructorTimeEntry_tenantId_instructorId_date_idx" ON "InstructorTimeEntry"("tenantId", "instructorId", "date");
CREATE INDEX "InstructorTimeEntry_tenantId_date_idx" ON "InstructorTimeEntry"("tenantId", "date");

-- CreateIndex
CREATE INDEX "InstructorAssignment_tenantId_bookingId_idx" ON "InstructorAssignment"("tenantId", "bookingId");
CREATE INDEX "InstructorAssignment_tenantId_instructorId_status_idx" ON "InstructorAssignment"("tenantId", "instructorId", "status");
CREATE UNIQUE INDEX "InstructorAssignment_tenantId_instructorId_bookingId_key" ON "InstructorAssignment"("tenantId", "instructorId", "bookingId");

-- AddForeignKey
ALTER TABLE "Instructor" ADD CONSTRAINT "Instructor_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Instructor" ADD CONSTRAINT "Instructor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstructorAvailability" ADD CONSTRAINT "InstructorAvailability_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InstructorAvailability" ADD CONSTRAINT "InstructorAvailability_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstructorTimeEntry" ADD CONSTRAINT "InstructorTimeEntry_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InstructorTimeEntry" ADD CONSTRAINT "InstructorTimeEntry_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstructorAssignment" ADD CONSTRAINT "InstructorAssignment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InstructorAssignment" ADD CONSTRAINT "InstructorAssignment_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InstructorAssignment" ADD CONSTRAINT "InstructorAssignment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "ActivityBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey (BookingMonitor.instructorId)
ALTER TABLE "BookingMonitor" ADD CONSTRAINT "BookingMonitor_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
