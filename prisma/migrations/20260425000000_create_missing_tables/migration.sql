-- CreateTable
CREATE TABLE "LodgeStay" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "roomTypeId" TEXT,
    "guestName" TEXT NOT NULL,
    "guestEmail" TEXT,
    "guestPhone" TEXT,
    "checkIn" TIMESTAMP(3) NOT NULL,
    "checkOut" TIMESTAMP(3) NOT NULL,
    "adults" INTEGER NOT NULL DEFAULT 1,
    "children" INTEGER NOT NULL DEFAULT 0,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'reservada',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LodgeStay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyMenu" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "firstCourse" TEXT NOT NULL,
    "secondCourse" TEXT NOT NULL,
    "dessert" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyMenu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RestaurantReservation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "guestCount" INTEGER NOT NULL,
    "guestName" TEXT NOT NULL,
    "guestPhone" TEXT,
    "guestEmail" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'confirmada',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RestaurantReservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollRecord" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "baseSalary" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalExtras" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "paidAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayrollRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollExtra" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "payrollId" TEXT NOT NULL,
    "concept" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'bonus',
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PayrollExtra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentalInventory" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "stationSlug" TEXT NOT NULL,
    "equipmentType" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "qualityTier" TEXT NOT NULL,
    "totalQuantity" INTEGER NOT NULL DEFAULT 0,
    "availableQuantity" INTEGER NOT NULL DEFAULT 0,
    "minStockAlert" INTEGER NOT NULL DEFAULT 5,
    "condition" TEXT NOT NULL DEFAULT 'bueno',
    "lastMaintenanceAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RentalInventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentalOrder" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "reservationId" TEXT,
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT,
    "clientPhone" TEXT,
    "stationSlug" TEXT NOT NULL,
    "pickupDate" TIMESTAMP(3) NOT NULL,
    "returnDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RESERVED',
    "preparedAt" TIMESTAMP(3),
    "preparedBy" TEXT,
    "pickedUpAt" TIMESTAMP(3),
    "pickedUpBy" TEXT,
    "returnedAt" TIMESTAMP(3),
    "returnedBy" TEXT,
    "inspectedAt" TIMESTAMP(3),
    "inspectedBy" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "totalPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "depositCents" INTEGER NOT NULL DEFAULT 0,
    "depositReturned" BOOLEAN NOT NULL DEFAULT false,
    "signatureUrl" TEXT,
    "damageNotes" TEXT,
    "notes" TEXT,
    "internalNotes" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RentalOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentalOrderItem" (
    "id" TEXT NOT NULL,
    "rentalOrderId" TEXT NOT NULL,
    "participantName" TEXT NOT NULL,
    "equipmentType" TEXT NOT NULL,
    "size" TEXT,
    "qualityTier" TEXT NOT NULL,
    "dinSetting" DOUBLE PRECISION,
    "itemStatus" TEXT NOT NULL DEFAULT 'RESERVED',
    "conditionOnReturn" TEXT,
    "damageNotes" TEXT,
    "unitPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "serialNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RentalOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerSizingProfile" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientPhone" TEXT,
    "height" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "shoeSize" TEXT,
    "age" INTEGER,
    "abilityLevel" TEXT,
    "bootSoleLength" DOUBLE PRECISION,
    "preferredDinSetting" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerSizingProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LodgeStay_tenantId_checkIn_idx" ON "LodgeStay"("tenantId", "checkIn");

-- CreateIndex
CREATE INDEX "LodgeStay_tenantId_status_idx" ON "LodgeStay"("tenantId", "status");

-- CreateIndex
CREATE INDEX "DailyMenu_tenantId_date_idx" ON "DailyMenu"("tenantId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyMenu_tenantId_date_key" ON "DailyMenu"("tenantId", "date");

-- CreateIndex
CREATE INDEX "RestaurantReservation_tenantId_date_idx" ON "RestaurantReservation"("tenantId", "date");

-- CreateIndex
CREATE INDEX "PayrollRecord_tenantId_year_month_idx" ON "PayrollRecord"("tenantId", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollRecord_tenantId_userId_year_month_key" ON "PayrollRecord"("tenantId", "userId", "year", "month");

-- CreateIndex
CREATE INDEX "PayrollExtra_tenantId_payrollId_idx" ON "PayrollExtra"("tenantId", "payrollId");

-- CreateIndex
CREATE INDEX "RentalInventory_tenantId_stationSlug_idx" ON "RentalInventory"("tenantId", "stationSlug");

-- CreateIndex
CREATE INDEX "RentalInventory_tenantId_equipmentType_idx" ON "RentalInventory"("tenantId", "equipmentType");

-- CreateIndex
CREATE INDEX "RentalInventory_tenantId_condition_idx" ON "RentalInventory"("tenantId", "condition");

-- CreateIndex
CREATE UNIQUE INDEX "RentalInventory_tenantId_stationSlug_equipmentType_size_qua_key" ON "RentalInventory"("tenantId", "stationSlug", "equipmentType", "size", "qualityTier");

-- CreateIndex
CREATE INDEX "RentalOrder_tenantId_status_idx" ON "RentalOrder"("tenantId", "status");

-- CreateIndex
CREATE INDEX "RentalOrder_tenantId_pickupDate_idx" ON "RentalOrder"("tenantId", "pickupDate");

-- CreateIndex
CREATE INDEX "RentalOrder_tenantId_returnDate_idx" ON "RentalOrder"("tenantId", "returnDate");

-- CreateIndex
CREATE INDEX "RentalOrder_tenantId_stationSlug_idx" ON "RentalOrder"("tenantId", "stationSlug");

-- CreateIndex
CREATE INDEX "RentalOrder_tenantId_reservationId_idx" ON "RentalOrder"("tenantId", "reservationId");

-- CreateIndex
CREATE INDEX "RentalOrderItem_rentalOrderId_idx" ON "RentalOrderItem"("rentalOrderId");

-- CreateIndex
CREATE INDEX "RentalOrderItem_rentalOrderId_equipmentType_idx" ON "RentalOrderItem"("rentalOrderId", "equipmentType");

-- CreateIndex
CREATE INDEX "CustomerSizingProfile_tenantId_clientName_idx" ON "CustomerSizingProfile"("tenantId", "clientName");

-- CreateIndex
CREATE INDEX "CustomerSizingProfile_tenantId_clientPhone_idx" ON "CustomerSizingProfile"("tenantId", "clientPhone");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerSizingProfile_tenantId_clientEmail_key" ON "CustomerSizingProfile"("tenantId", "clientEmail");

-- AddForeignKey
ALTER TABLE "LodgeStay" ADD CONSTRAINT "LodgeStay_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LodgeStay" ADD CONSTRAINT "LodgeStay_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyMenu" ADD CONSTRAINT "DailyMenu_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantReservation" ADD CONSTRAINT "RestaurantReservation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollRecord" ADD CONSTRAINT "PayrollRecord_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollRecord" ADD CONSTRAINT "PayrollRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollExtra" ADD CONSTRAINT "PayrollExtra_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollExtra" ADD CONSTRAINT "PayrollExtra_payrollId_fkey" FOREIGN KEY ("payrollId") REFERENCES "PayrollRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalInventory" ADD CONSTRAINT "RentalInventory_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalOrder" ADD CONSTRAINT "RentalOrder_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalOrder" ADD CONSTRAINT "RentalOrder_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalOrderItem" ADD CONSTRAINT "RentalOrderItem_rentalOrderId_fkey" FOREIGN KEY ("rentalOrderId") REFERENCES "RentalOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerSizingProfile" ADD CONSTRAINT "CustomerSizingProfile_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

