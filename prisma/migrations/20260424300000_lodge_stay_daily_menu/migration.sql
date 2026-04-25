-- LodgeStay: simple stay records for lodge/cabin/apartment bookings
CREATE TABLE "LodgeStay" (
  "id"          TEXT NOT NULL,
  "tenantId"    TEXT NOT NULL,
  "roomTypeId"  TEXT,
  "guestName"   TEXT NOT NULL,
  "guestEmail"  TEXT,
  "guestPhone"  TEXT,
  "checkIn"     TIMESTAMP(3) NOT NULL,
  "checkOut"    TIMESTAMP(3) NOT NULL,
  "adults"      INTEGER NOT NULL DEFAULT 1,
  "children"    INTEGER NOT NULL DEFAULT 0,
  "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "status"      TEXT NOT NULL DEFAULT 'reservada',
  "notes"       TEXT,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LodgeStay_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LodgeStay_tenantId_checkIn_idx" ON "LodgeStay"("tenantId", "checkIn");
CREATE INDEX "LodgeStay_tenantId_status_idx" ON "LodgeStay"("tenantId", "status");

ALTER TABLE "LodgeStay" ADD CONSTRAINT "LodgeStay_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LodgeStay" ADD CONSTRAINT "LodgeStay_roomTypeId_fkey"
  FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- DailyMenu: restaurant menu of the day
CREATE TABLE "DailyMenu" (
  "id"           TEXT NOT NULL,
  "tenantId"     TEXT NOT NULL,
  "date"         TIMESTAMP(3) NOT NULL,
  "firstCourse"  TEXT NOT NULL,
  "secondCourse" TEXT NOT NULL,
  "dessert"      TEXT NOT NULL,
  "price"        DOUBLE PRECISION NOT NULL DEFAULT 0,
  "active"       BOOLEAN NOT NULL DEFAULT true,
  "notes"        TEXT,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DailyMenu_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DailyMenu_tenantId_date_key" ON "DailyMenu"("tenantId", "date");
CREATE INDEX "DailyMenu_tenantId_date_idx" ON "DailyMenu"("tenantId", "date");

ALTER TABLE "DailyMenu" ADD CONSTRAINT "DailyMenu_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RestaurantReservation: simple counter (no per-table) for restaurant bookings
CREATE TABLE "RestaurantReservation" (
  "id"         TEXT NOT NULL,
  "tenantId"   TEXT NOT NULL,
  "date"       TIMESTAMP(3) NOT NULL,
  "time"       TEXT NOT NULL,
  "guestCount" INTEGER NOT NULL,
  "guestName"  TEXT NOT NULL,
  "guestPhone" TEXT,
  "guestEmail" TEXT,
  "notes"      TEXT,
  "status"     TEXT NOT NULL DEFAULT 'confirmada',
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"  TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RestaurantReservation_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "RestaurantReservation_tenantId_date_idx" ON "RestaurantReservation"("tenantId", "date");

ALTER TABLE "RestaurantReservation" ADD CONSTRAINT "RestaurantReservation_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
