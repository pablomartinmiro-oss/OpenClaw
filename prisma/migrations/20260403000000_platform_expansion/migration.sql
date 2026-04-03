-- Platform Expansion: 58 new models + Product.supplierId
-- Migration: 20260403000000_platform_expansion

-- Step 1: Add supplierId to Product
ALTER TABLE "Product" ADD COLUMN     "supplierId" TEXT;

-- Step 2: Create new tables
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "parentId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ExperienceVariant" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "priceModifier" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "priceType" TEXT NOT NULL DEFAULT 'fixed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExperienceVariant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductTimeSlot" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'fixed',
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 0,
    "dayOfWeek" INTEGER,
    "priceOverride" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductTimeSlot_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RoomType" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "images" JSONB NOT NULL DEFAULT '[]',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoomType_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RoomRateSeason" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoomRateSeason_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RoomRate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "roomTypeId" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "supplement" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoomRate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RoomBlock" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "roomTypeId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "unitCount" INTEGER NOT NULL DEFAULT 0,
    "reason" TEXT NOT NULL DEFAULT 'closure',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoomBlock_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Restaurant" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 0,
    "depositPerGuest" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "operatingDays" JSONB NOT NULL DEFAULT '[]',
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Restaurant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RestaurantShift" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "maxCapacity" INTEGER NOT NULL DEFAULT 0,
    "duration" INTEGER NOT NULL DEFAULT 90,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RestaurantShift_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RestaurantClosure" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RestaurantClosure_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RestaurantBooking" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "clientId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "guestCount" INTEGER NOT NULL,
    "specialRequests" TEXT,
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    "depositStatus" TEXT NOT NULL DEFAULT 'pending',
    "operationalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RestaurantBooking_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RestaurantStaff" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'staff',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RestaurantStaff_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SpaCategory" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpaCategory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SpaTreatment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "price" DOUBLE PRECISION NOT NULL,
    "images" JSONB NOT NULL DEFAULT '[]',
    "description" TEXT,
    "supplierCommission" DOUBLE PRECISION,
    "fiscalRegime" TEXT NOT NULL DEFAULT 'general',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpaTreatment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SpaResource" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpaResource_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SpaSlot" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "treatmentId" TEXT NOT NULL,
    "resourceId" TEXT,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "booked" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'available',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpaSlot_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SpaScheduleTemplate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "treatmentId" TEXT,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "resourceIds" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpaScheduleTemplate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "name" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3),
    "address" TEXT,
    "notes" TEXT,
    "cumulativeSpend" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lifetimeValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "conversionSource" TEXT,
    "acquiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ActivityBooking" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "activityDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "operationalNotes" TEXT,
    "arrivedClient" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivityBooking_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BookingMonitor" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingMonitor_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DailyOrder" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyOrder_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "clientId" TEXT,
    "reservationId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "issuedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "pdfUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InvoiceLine" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "lineTotal" DOUBLE PRECISION NOT NULL,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 21,
    "fiscalRegime" TEXT NOT NULL DEFAULT 'general',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvoiceLine_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "invoiceId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "method" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reference" TEXT,
    "receipt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CostCenter" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CostCenter_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ExpenseCategory" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpenseCategory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "categoryId" TEXT NOT NULL,
    "costCenterId" TEXT,
    "concept" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentMethod" TEXT NOT NULL DEFAULT 'transfer',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "supplierId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ExpenseFile" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "expenseId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExpenseFile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RecurringExpense" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "expenseId" TEXT NOT NULL,
    "pattern" TEXT NOT NULL,
    "nextDueDate" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecurringExpense_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "fiscalName" TEXT NOT NULL,
    "commercialName" TEXT,
    "nif" TEXT NOT NULL,
    "iban" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "commissionPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paymentMethod" TEXT NOT NULL DEFAULT 'transfer',
    "settlementFrequency" TEXT NOT NULL DEFAULT 'monthly',
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SupplierSettlement" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "grossAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "commissionAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pdfUrl" TEXT,
    "sentAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierSettlement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SettlementLine" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "settlementId" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "productId" TEXT,
    "serviceDate" TIMESTAMP(3) NOT NULL,
    "paxCount" INTEGER NOT NULL DEFAULT 1,
    "saleAmount" DOUBLE PRECISION NOT NULL,
    "commissionPercentage" DOUBLE PRECISION NOT NULL,
    "commissionAmount" DOUBLE PRECISION NOT NULL,
    "reservationId" TEXT,
    "invoiceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SettlementLine_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SettlementDocument" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "settlementId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SettlementDocument_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SettlementStatusLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "settlementId" TEXT NOT NULL,
    "previousStatus" TEXT NOT NULL,
    "newStatus" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "reason" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SettlementStatusLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ReavExpedient" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "operationType" TEXT NOT NULL DEFAULT 'standard',
    "costPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "marginPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "marginAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxableBase" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vat" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReavExpedient_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ReavCost" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "expedientId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReavCost_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ReavDocument" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "expedientId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReavDocument_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CashRegister" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CashRegister_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CashSession" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "registerId" TEXT NOT NULL,
    "openedById" TEXT NOT NULL,
    "openingAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "closingAmount" DOUBLE PRECISION,
    "totalCash" DOUBLE PRECISION,
    "totalCard" DOUBLE PRECISION,
    "totalBizum" DOUBLE PRECISION,
    "discrepancy" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'open',
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CashSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CashMovement" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CashMovement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TpvSale" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "discountApplied" DOUBLE PRECISION,
    "totalTax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paymentMethods" JSONB NOT NULL DEFAULT '{}',
    "clientId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TpvSale_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TpvSaleItem" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "productId" TEXT,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "lineTotal" DOUBLE PRECISION NOT NULL,
    "discountAmount" DOUBLE PRECISION,
    "fiscalRegime" TEXT NOT NULL DEFAULT 'general',
    "taxPerLine" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TpvSaleItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DiscountCode" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'percentage',
    "value" DOUBLE PRECISION NOT NULL,
    "expirationDate" TIMESTAMP(3),
    "maxUses" INTEGER NOT NULL DEFAULT 0,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscountCode_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DiscountCodeUse" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "codeId" TEXT NOT NULL,
    "originalAmount" DOUBLE PRECISION NOT NULL,
    "finalAmount" DOUBLE PRECISION NOT NULL,
    "discountAmount" DOUBLE PRECISION NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'online',
    "reservationId" TEXT,
    "saleId" TEXT,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscountCodeUse_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CompensationVoucher" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "cancellationId" TEXT,
    "type" TEXT NOT NULL DEFAULT 'monetary',
    "value" DOUBLE PRECISION NOT NULL,
    "expirationDate" TIMESTAMP(3),
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "linkedDiscountCodeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompensationVoucher_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SiteSetting" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SlideshowItem" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "caption" TEXT,
    "linkUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SlideshowItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CmsMenuItem" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "position" TEXT NOT NULL DEFAULT 'header',
    "parentId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CmsMenuItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StaticPage" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metaDescription" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaticPage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PageBlock" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" JSONB NOT NULL DEFAULT '{}',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageBlock_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ExternalPlatform" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'coupon',
    "commissionPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalPlatform_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PlatformProduct" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "externalId" TEXT,
    "externalUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformProduct_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CouponRedemption" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'received',
    "financialStatus" TEXT NOT NULL DEFAULT 'pending',
    "ocrExtraction" JSONB,
    "reservationId" TEXT,
    "redeemedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CouponRedemption_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CouponEmailConfig" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "eventTrigger" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CouponEmailConfig_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorEmail" TEXT,
    "title" TEXT,
    "body" TEXT NOT NULL,
    "stayDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reply" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LegoPack" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "categoryId" TEXT,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "images" JSONB NOT NULL DEFAULT '[]',
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegoPack_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LegoPackLine" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "packId" TEXT NOT NULL,
    "productId" TEXT,
    "roomTypeId" TEXT,
    "treatmentId" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "isOptional" BOOLEAN NOT NULL DEFAULT false,
    "isClientEditable" BOOLEAN NOT NULL DEFAULT false,
    "overridePrice" DOUBLE PRECISION,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegoPackLine_pkey" PRIMARY KEY ("id")
);

-- Step 3: Create indexes
CREATE INDEX "Category_tenantId_parentId_idx" ON "Category"("tenantId", "parentId");

CREATE UNIQUE INDEX "Category_tenantId_slug_key" ON "Category"("tenantId", "slug");

CREATE INDEX "Location_tenantId_idx" ON "Location"("tenantId");

CREATE UNIQUE INDEX "Location_tenantId_slug_key" ON "Location"("tenantId", "slug");

CREATE INDEX "ExperienceVariant_tenantId_productId_idx" ON "ExperienceVariant"("tenantId", "productId");

CREATE INDEX "ProductTimeSlot_tenantId_productId_idx" ON "ProductTimeSlot"("tenantId", "productId");

CREATE INDEX "RoomType_tenantId_active_idx" ON "RoomType"("tenantId", "active");

CREATE UNIQUE INDEX "RoomType_tenantId_slug_key" ON "RoomType"("tenantId", "slug");

CREATE INDEX "RoomRateSeason_tenantId_startDate_idx" ON "RoomRateSeason"("tenantId", "startDate");

CREATE INDEX "RoomRate_tenantId_roomTypeId_idx" ON "RoomRate"("tenantId", "roomTypeId");

CREATE UNIQUE INDEX "RoomRate_tenantId_roomTypeId_seasonId_dayOfWeek_key" ON "RoomRate"("tenantId", "roomTypeId", "seasonId", "dayOfWeek");

CREATE INDEX "RoomBlock_tenantId_date_idx" ON "RoomBlock"("tenantId", "date");

CREATE UNIQUE INDEX "RoomBlock_tenantId_roomTypeId_date_key" ON "RoomBlock"("tenantId", "roomTypeId", "date");

CREATE INDEX "Restaurant_tenantId_idx" ON "Restaurant"("tenantId");

CREATE UNIQUE INDEX "Restaurant_tenantId_slug_key" ON "Restaurant"("tenantId", "slug");

CREATE INDEX "RestaurantShift_tenantId_restaurantId_idx" ON "RestaurantShift"("tenantId", "restaurantId");

CREATE INDEX "RestaurantClosure_tenantId_date_idx" ON "RestaurantClosure"("tenantId", "date");

CREATE UNIQUE INDEX "RestaurantClosure_tenantId_restaurantId_date_key" ON "RestaurantClosure"("tenantId", "restaurantId", "date");

CREATE INDEX "RestaurantBooking_tenantId_date_idx" ON "RestaurantBooking"("tenantId", "date");

CREATE INDEX "RestaurantBooking_tenantId_restaurantId_date_idx" ON "RestaurantBooking"("tenantId", "restaurantId", "date");

CREATE INDEX "RestaurantStaff_tenantId_idx" ON "RestaurantStaff"("tenantId");

CREATE UNIQUE INDEX "RestaurantStaff_tenantId_restaurantId_userId_key" ON "RestaurantStaff"("tenantId", "restaurantId", "userId");

CREATE INDEX "SpaCategory_tenantId_idx" ON "SpaCategory"("tenantId");

CREATE UNIQUE INDEX "SpaCategory_tenantId_slug_key" ON "SpaCategory"("tenantId", "slug");

CREATE INDEX "SpaTreatment_tenantId_categoryId_idx" ON "SpaTreatment"("tenantId", "categoryId");

CREATE UNIQUE INDEX "SpaTreatment_tenantId_slug_key" ON "SpaTreatment"("tenantId", "slug");

CREATE INDEX "SpaResource_tenantId_type_idx" ON "SpaResource"("tenantId", "type");

CREATE INDEX "SpaSlot_tenantId_date_idx" ON "SpaSlot"("tenantId", "date");

CREATE UNIQUE INDEX "SpaSlot_tenantId_date_time_treatmentId_resourceId_key" ON "SpaSlot"("tenantId", "date", "time", "treatmentId", "resourceId");

CREATE INDEX "SpaScheduleTemplate_tenantId_dayOfWeek_idx" ON "SpaScheduleTemplate"("tenantId", "dayOfWeek");

CREATE INDEX "Client_tenantId_email_idx" ON "Client"("tenantId", "email");

CREATE INDEX "Client_tenantId_phone_idx" ON "Client"("tenantId", "phone");

CREATE INDEX "Client_tenantId_name_idx" ON "Client"("tenantId", "name");

CREATE INDEX "ActivityBooking_tenantId_activityDate_idx" ON "ActivityBooking"("tenantId", "activityDate");

CREATE INDEX "ActivityBooking_tenantId_reservationId_idx" ON "ActivityBooking"("tenantId", "reservationId");

CREATE INDEX "BookingMonitor_tenantId_idx" ON "BookingMonitor"("tenantId");

CREATE UNIQUE INDEX "BookingMonitor_tenantId_bookingId_userId_key" ON "BookingMonitor"("tenantId", "bookingId", "userId");

CREATE INDEX "DailyOrder_tenantId_date_idx" ON "DailyOrder"("tenantId", "date");

CREATE UNIQUE INDEX "DailyOrder_tenantId_date_key" ON "DailyOrder"("tenantId", "date");

CREATE INDEX "Invoice_tenantId_status_idx" ON "Invoice"("tenantId", "status");

CREATE INDEX "Invoice_tenantId_clientId_idx" ON "Invoice"("tenantId", "clientId");

CREATE UNIQUE INDEX "Invoice_tenantId_number_key" ON "Invoice"("tenantId", "number");

CREATE INDEX "InvoiceLine_tenantId_invoiceId_idx" ON "InvoiceLine"("tenantId", "invoiceId");

CREATE INDEX "Transaction_tenantId_date_idx" ON "Transaction"("tenantId", "date");

CREATE INDEX "Transaction_tenantId_status_idx" ON "Transaction"("tenantId", "status");

CREATE INDEX "CostCenter_tenantId_idx" ON "CostCenter"("tenantId");

CREATE UNIQUE INDEX "CostCenter_tenantId_code_key" ON "CostCenter"("tenantId", "code");

CREATE INDEX "ExpenseCategory_tenantId_idx" ON "ExpenseCategory"("tenantId");

CREATE UNIQUE INDEX "ExpenseCategory_tenantId_code_key" ON "ExpenseCategory"("tenantId", "code");

CREATE INDEX "Expense_tenantId_date_idx" ON "Expense"("tenantId", "date");

CREATE INDEX "Expense_tenantId_status_idx" ON "Expense"("tenantId", "status");

CREATE INDEX "ExpenseFile_tenantId_expenseId_idx" ON "ExpenseFile"("tenantId", "expenseId");

CREATE UNIQUE INDEX "RecurringExpense_expenseId_key" ON "RecurringExpense"("expenseId");

CREATE INDEX "RecurringExpense_tenantId_active_idx" ON "RecurringExpense"("tenantId", "active");

CREATE INDEX "Supplier_tenantId_status_idx" ON "Supplier"("tenantId", "status");

CREATE UNIQUE INDEX "Supplier_tenantId_nif_key" ON "Supplier"("tenantId", "nif");

CREATE INDEX "SupplierSettlement_tenantId_supplierId_idx" ON "SupplierSettlement"("tenantId", "supplierId");

CREATE INDEX "SupplierSettlement_tenantId_status_idx" ON "SupplierSettlement"("tenantId", "status");

CREATE UNIQUE INDEX "SupplierSettlement_tenantId_number_key" ON "SupplierSettlement"("tenantId", "number");

CREATE INDEX "SettlementLine_tenantId_settlementId_idx" ON "SettlementLine"("tenantId", "settlementId");

CREATE INDEX "SettlementDocument_tenantId_settlementId_idx" ON "SettlementDocument"("tenantId", "settlementId");

CREATE INDEX "SettlementStatusLog_tenantId_settlementId_idx" ON "SettlementStatusLog"("tenantId", "settlementId");

CREATE INDEX "ReavExpedient_tenantId_invoiceId_idx" ON "ReavExpedient"("tenantId", "invoiceId");

CREATE INDEX "ReavCost_tenantId_expedientId_idx" ON "ReavCost"("tenantId", "expedientId");

CREATE INDEX "ReavDocument_tenantId_expedientId_idx" ON "ReavDocument"("tenantId", "expedientId");

CREATE INDEX "CashRegister_tenantId_idx" ON "CashRegister"("tenantId");

CREATE INDEX "CashSession_tenantId_status_idx" ON "CashSession"("tenantId", "status");

CREATE INDEX "CashSession_tenantId_registerId_idx" ON "CashSession"("tenantId", "registerId");

CREATE INDEX "CashMovement_tenantId_sessionId_idx" ON "CashMovement"("tenantId", "sessionId");

CREATE INDEX "TpvSale_tenantId_date_idx" ON "TpvSale"("tenantId", "date");

CREATE INDEX "TpvSale_tenantId_sessionId_idx" ON "TpvSale"("tenantId", "sessionId");

CREATE UNIQUE INDEX "TpvSale_tenantId_ticketNumber_key" ON "TpvSale"("tenantId", "ticketNumber");

CREATE INDEX "TpvSaleItem_tenantId_saleId_idx" ON "TpvSaleItem"("tenantId", "saleId");

CREATE INDEX "DiscountCode_tenantId_isActive_idx" ON "DiscountCode"("tenantId", "isActive");

CREATE UNIQUE INDEX "DiscountCode_tenantId_code_key" ON "DiscountCode"("tenantId", "code");

CREATE INDEX "DiscountCodeUse_tenantId_codeId_idx" ON "DiscountCodeUse"("tenantId", "codeId");

CREATE INDEX "CompensationVoucher_tenantId_isUsed_idx" ON "CompensationVoucher"("tenantId", "isUsed");

CREATE UNIQUE INDEX "CompensationVoucher_tenantId_code_key" ON "CompensationVoucher"("tenantId", "code");

CREATE INDEX "SiteSetting_tenantId_idx" ON "SiteSetting"("tenantId");

CREATE UNIQUE INDEX "SiteSetting_tenantId_key_key" ON "SiteSetting"("tenantId", "key");

CREATE INDEX "SlideshowItem_tenantId_isActive_idx" ON "SlideshowItem"("tenantId", "isActive");

CREATE INDEX "CmsMenuItem_tenantId_position_idx" ON "CmsMenuItem"("tenantId", "position");

CREATE INDEX "StaticPage_tenantId_isPublished_idx" ON "StaticPage"("tenantId", "isPublished");

CREATE UNIQUE INDEX "StaticPage_tenantId_slug_key" ON "StaticPage"("tenantId", "slug");

CREATE INDEX "PageBlock_tenantId_pageId_idx" ON "PageBlock"("tenantId", "pageId");

CREATE INDEX "ExternalPlatform_tenantId_idx" ON "ExternalPlatform"("tenantId");

CREATE INDEX "PlatformProduct_tenantId_platformId_idx" ON "PlatformProduct"("tenantId", "platformId");

CREATE UNIQUE INDEX "PlatformProduct_tenantId_platformId_productId_key" ON "PlatformProduct"("tenantId", "platformId", "productId");

CREATE INDEX "CouponRedemption_tenantId_code_idx" ON "CouponRedemption"("tenantId", "code");

CREATE INDEX "CouponRedemption_tenantId_status_idx" ON "CouponRedemption"("tenantId", "status");

CREATE INDEX "CouponEmailConfig_tenantId_idx" ON "CouponEmailConfig"("tenantId");

CREATE UNIQUE INDEX "CouponEmailConfig_tenantId_templateId_eventTrigger_key" ON "CouponEmailConfig"("tenantId", "templateId", "eventTrigger");

CREATE INDEX "Review_tenantId_entityType_entityId_idx" ON "Review"("tenantId", "entityType", "entityId");

CREATE INDEX "Review_tenantId_status_idx" ON "Review"("tenantId", "status");

CREATE INDEX "LegoPack_tenantId_isActive_idx" ON "LegoPack"("tenantId", "isActive");

CREATE UNIQUE INDEX "LegoPack_tenantId_slug_key" ON "LegoPack"("tenantId", "slug");

CREATE INDEX "LegoPackLine_tenantId_packId_idx" ON "LegoPackLine"("tenantId", "packId");

-- Step 4: Add foreign key constraints
ALTER TABLE "Product" ADD CONSTRAINT "Product_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Category" ADD CONSTRAINT "Category_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Location" ADD CONSTRAINT "Location_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ExperienceVariant" ADD CONSTRAINT "ExperienceVariant_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ExperienceVariant" ADD CONSTRAINT "ExperienceVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProductTimeSlot" ADD CONSTRAINT "ProductTimeSlot_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProductTimeSlot" ADD CONSTRAINT "ProductTimeSlot_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RoomType" ADD CONSTRAINT "RoomType_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RoomRateSeason" ADD CONSTRAINT "RoomRateSeason_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RoomRate" ADD CONSTRAINT "RoomRate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RoomRate" ADD CONSTRAINT "RoomRate_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RoomRate" ADD CONSTRAINT "RoomRate_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "RoomRateSeason"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RoomBlock" ADD CONSTRAINT "RoomBlock_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RoomBlock" ADD CONSTRAINT "RoomBlock_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Restaurant" ADD CONSTRAINT "Restaurant_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RestaurantShift" ADD CONSTRAINT "RestaurantShift_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RestaurantShift" ADD CONSTRAINT "RestaurantShift_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RestaurantClosure" ADD CONSTRAINT "RestaurantClosure_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RestaurantClosure" ADD CONSTRAINT "RestaurantClosure_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RestaurantBooking" ADD CONSTRAINT "RestaurantBooking_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RestaurantBooking" ADD CONSTRAINT "RestaurantBooking_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RestaurantBooking" ADD CONSTRAINT "RestaurantBooking_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "RestaurantStaff" ADD CONSTRAINT "RestaurantStaff_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RestaurantStaff" ADD CONSTRAINT "RestaurantStaff_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RestaurantStaff" ADD CONSTRAINT "RestaurantStaff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SpaCategory" ADD CONSTRAINT "SpaCategory_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SpaTreatment" ADD CONSTRAINT "SpaTreatment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SpaTreatment" ADD CONSTRAINT "SpaTreatment_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "SpaCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SpaResource" ADD CONSTRAINT "SpaResource_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SpaSlot" ADD CONSTRAINT "SpaSlot_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SpaSlot" ADD CONSTRAINT "SpaSlot_treatmentId_fkey" FOREIGN KEY ("treatmentId") REFERENCES "SpaTreatment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SpaSlot" ADD CONSTRAINT "SpaSlot_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "SpaResource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "SpaScheduleTemplate" ADD CONSTRAINT "SpaScheduleTemplate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Client" ADD CONSTRAINT "Client_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ActivityBooking" ADD CONSTRAINT "ActivityBooking_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ActivityBooking" ADD CONSTRAINT "ActivityBooking_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BookingMonitor" ADD CONSTRAINT "BookingMonitor_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BookingMonitor" ADD CONSTRAINT "BookingMonitor_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "ActivityBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BookingMonitor" ADD CONSTRAINT "BookingMonitor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DailyOrder" ADD CONSTRAINT "DailyOrder_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "InvoiceLine" ADD CONSTRAINT "InvoiceLine_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "InvoiceLine" ADD CONSTRAINT "InvoiceLine_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CostCenter" ADD CONSTRAINT "CostCenter_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ExpenseCategory" ADD CONSTRAINT "ExpenseCategory_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Expense" ADD CONSTRAINT "Expense_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Expense" ADD CONSTRAINT "Expense_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ExpenseCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Expense" ADD CONSTRAINT "Expense_costCenterId_fkey" FOREIGN KEY ("costCenterId") REFERENCES "CostCenter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Expense" ADD CONSTRAINT "Expense_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ExpenseFile" ADD CONSTRAINT "ExpenseFile_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ExpenseFile" ADD CONSTRAINT "ExpenseFile_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RecurringExpense" ADD CONSTRAINT "RecurringExpense_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RecurringExpense" ADD CONSTRAINT "RecurringExpense_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SupplierSettlement" ADD CONSTRAINT "SupplierSettlement_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SupplierSettlement" ADD CONSTRAINT "SupplierSettlement_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SettlementLine" ADD CONSTRAINT "SettlementLine_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SettlementLine" ADD CONSTRAINT "SettlementLine_settlementId_fkey" FOREIGN KEY ("settlementId") REFERENCES "SupplierSettlement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SettlementDocument" ADD CONSTRAINT "SettlementDocument_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SettlementDocument" ADD CONSTRAINT "SettlementDocument_settlementId_fkey" FOREIGN KEY ("settlementId") REFERENCES "SupplierSettlement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SettlementStatusLog" ADD CONSTRAINT "SettlementStatusLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SettlementStatusLog" ADD CONSTRAINT "SettlementStatusLog_settlementId_fkey" FOREIGN KEY ("settlementId") REFERENCES "SupplierSettlement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ReavExpedient" ADD CONSTRAINT "ReavExpedient_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ReavExpedient" ADD CONSTRAINT "ReavExpedient_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ReavCost" ADD CONSTRAINT "ReavCost_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ReavCost" ADD CONSTRAINT "ReavCost_expedientId_fkey" FOREIGN KEY ("expedientId") REFERENCES "ReavExpedient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ReavDocument" ADD CONSTRAINT "ReavDocument_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ReavDocument" ADD CONSTRAINT "ReavDocument_expedientId_fkey" FOREIGN KEY ("expedientId") REFERENCES "ReavExpedient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CashRegister" ADD CONSTRAINT "CashRegister_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CashSession" ADD CONSTRAINT "CashSession_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CashSession" ADD CONSTRAINT "CashSession_registerId_fkey" FOREIGN KEY ("registerId") REFERENCES "CashRegister"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CashSession" ADD CONSTRAINT "CashSession_openedById_fkey" FOREIGN KEY ("openedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CashMovement" ADD CONSTRAINT "CashMovement_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CashMovement" ADD CONSTRAINT "CashMovement_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "CashSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TpvSale" ADD CONSTRAINT "TpvSale_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TpvSale" ADD CONSTRAINT "TpvSale_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "CashSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TpvSale" ADD CONSTRAINT "TpvSale_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "TpvSaleItem" ADD CONSTRAINT "TpvSaleItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TpvSaleItem" ADD CONSTRAINT "TpvSaleItem_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "TpvSale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DiscountCode" ADD CONSTRAINT "DiscountCode_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DiscountCodeUse" ADD CONSTRAINT "DiscountCodeUse_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DiscountCodeUse" ADD CONSTRAINT "DiscountCodeUse_codeId_fkey" FOREIGN KEY ("codeId") REFERENCES "DiscountCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CompensationVoucher" ADD CONSTRAINT "CompensationVoucher_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SiteSetting" ADD CONSTRAINT "SiteSetting_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SlideshowItem" ADD CONSTRAINT "SlideshowItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CmsMenuItem" ADD CONSTRAINT "CmsMenuItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CmsMenuItem" ADD CONSTRAINT "CmsMenuItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "CmsMenuItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "StaticPage" ADD CONSTRAINT "StaticPage_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PageBlock" ADD CONSTRAINT "PageBlock_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PageBlock" ADD CONSTRAINT "PageBlock_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "StaticPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ExternalPlatform" ADD CONSTRAINT "ExternalPlatform_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PlatformProduct" ADD CONSTRAINT "PlatformProduct_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PlatformProduct" ADD CONSTRAINT "PlatformProduct_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "ExternalPlatform"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PlatformProduct" ADD CONSTRAINT "PlatformProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CouponRedemption" ADD CONSTRAINT "CouponRedemption_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CouponEmailConfig" ADD CONSTRAINT "CouponEmailConfig_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Review" ADD CONSTRAINT "Review_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LegoPack" ADD CONSTRAINT "LegoPack_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LegoPackLine" ADD CONSTRAINT "LegoPackLine_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LegoPackLine" ADD CONSTRAINT "LegoPackLine_packId_fkey" FOREIGN KEY ("packId") REFERENCES "LegoPack"("id") ON DELETE CASCADE ON UPDATE CASCADE;
