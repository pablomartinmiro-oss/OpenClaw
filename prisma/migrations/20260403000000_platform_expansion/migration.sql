-- Platform Expansion: 58 new models + Product.supplierId
-- Migration: 20260403000000_platform_expansion

ALTER TABLE "Product" ADD COLUMN "supplierId" TEXT;

-- CreateIndex
CREATE INDEX "Category_tenantId_parentId_idx" ON "Category"("tenantId", "parentId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_tenantId_slug_key" ON "Category"("tenantId", "slug");

-- CreateIndex
CREATE INDEX "Location_tenantId_idx" ON "Location"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Location_tenantId_slug_key" ON "Location"("tenantId", "slug");

-- CreateIndex
CREATE INDEX "ExperienceVariant_tenantId_productId_idx" ON "ExperienceVariant"("tenantId", "productId");

-- CreateIndex
CREATE INDEX "ProductTimeSlot_tenantId_productId_idx" ON "ProductTimeSlot"("tenantId", "productId");

-- CreateIndex
CREATE INDEX "RoomType_tenantId_active_idx" ON "RoomType"("tenantId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "RoomType_tenantId_slug_key" ON "RoomType"("tenantId", "slug");

-- CreateIndex
CREATE INDEX "RoomRateSeason_tenantId_startDate_idx" ON "RoomRateSeason"("tenantId", "startDate");

-- CreateIndex
CREATE INDEX "RoomRate_tenantId_roomTypeId_idx" ON "RoomRate"("tenantId", "roomTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "RoomRate_tenantId_roomTypeId_seasonId_dayOfWeek_key" ON "RoomRate"("tenantId", "roomTypeId", "seasonId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "RoomBlock_tenantId_date_idx" ON "RoomBlock"("tenantId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "RoomBlock_tenantId_roomTypeId_date_key" ON "RoomBlock"("tenantId", "roomTypeId", "date");

-- CreateIndex
CREATE INDEX "Restaurant_tenantId_idx" ON "Restaurant"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Restaurant_tenantId_slug_key" ON "Restaurant"("tenantId", "slug");

-- CreateIndex
CREATE INDEX "RestaurantShift_tenantId_restaurantId_idx" ON "RestaurantShift"("tenantId", "restaurantId");

-- CreateIndex
CREATE INDEX "RestaurantClosure_tenantId_date_idx" ON "RestaurantClosure"("tenantId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "RestaurantClosure_tenantId_restaurantId_date_key" ON "RestaurantClosure"("tenantId", "restaurantId", "date");

-- CreateIndex
CREATE INDEX "RestaurantBooking_tenantId_date_idx" ON "RestaurantBooking"("tenantId", "date");

-- CreateIndex
CREATE INDEX "RestaurantBooking_tenantId_restaurantId_date_idx" ON "RestaurantBooking"("tenantId", "restaurantId", "date");

-- CreateIndex
CREATE INDEX "RestaurantStaff_tenantId_idx" ON "RestaurantStaff"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "RestaurantStaff_tenantId_restaurantId_userId_key" ON "RestaurantStaff"("tenantId", "restaurantId", "userId");

-- CreateIndex
CREATE INDEX "SpaCategory_tenantId_idx" ON "SpaCategory"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "SpaCategory_tenantId_slug_key" ON "SpaCategory"("tenantId", "slug");

-- CreateIndex
CREATE INDEX "SpaTreatment_tenantId_categoryId_idx" ON "SpaTreatment"("tenantId", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "SpaTreatment_tenantId_slug_key" ON "SpaTreatment"("tenantId", "slug");

-- CreateIndex
CREATE INDEX "SpaResource_tenantId_type_idx" ON "SpaResource"("tenantId", "type");

-- CreateIndex
CREATE INDEX "SpaSlot_tenantId_date_idx" ON "SpaSlot"("tenantId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "SpaSlot_tenantId_date_time_treatmentId_resourceId_key" ON "SpaSlot"("tenantId", "date", "time", "treatmentId", "resourceId");

-- CreateIndex
CREATE INDEX "SpaScheduleTemplate_tenantId_dayOfWeek_idx" ON "SpaScheduleTemplate"("tenantId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "Client_tenantId_email_idx" ON "Client"("tenantId", "email");

-- CreateIndex
CREATE INDEX "Client_tenantId_phone_idx" ON "Client"("tenantId", "phone");

-- CreateIndex
CREATE INDEX "Client_tenantId_name_idx" ON "Client"("tenantId", "name");

-- CreateIndex
CREATE INDEX "ActivityBooking_tenantId_activityDate_idx" ON "ActivityBooking"("tenantId", "activityDate");

-- CreateIndex
CREATE INDEX "ActivityBooking_tenantId_reservationId_idx" ON "ActivityBooking"("tenantId", "reservationId");

-- CreateIndex
CREATE INDEX "BookingMonitor_tenantId_idx" ON "BookingMonitor"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "BookingMonitor_tenantId_bookingId_userId_key" ON "BookingMonitor"("tenantId", "bookingId", "userId");

-- CreateIndex
CREATE INDEX "DailyOrder_tenantId_date_idx" ON "DailyOrder"("tenantId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyOrder_tenantId_date_key" ON "DailyOrder"("tenantId", "date");

-- CreateIndex
CREATE INDEX "Invoice_tenantId_status_idx" ON "Invoice"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Invoice_tenantId_clientId_idx" ON "Invoice"("tenantId", "clientId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_tenantId_number_key" ON "Invoice"("tenantId", "number");

-- CreateIndex
CREATE INDEX "InvoiceLine_tenantId_invoiceId_idx" ON "InvoiceLine"("tenantId", "invoiceId");

-- CreateIndex
CREATE INDEX "Transaction_tenantId_date_idx" ON "Transaction"("tenantId", "date");

-- CreateIndex
CREATE INDEX "Transaction_tenantId_status_idx" ON "Transaction"("tenantId", "status");

-- CreateIndex
CREATE INDEX "CostCenter_tenantId_idx" ON "CostCenter"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "CostCenter_tenantId_code_key" ON "CostCenter"("tenantId", "code");

-- CreateIndex
CREATE INDEX "ExpenseCategory_tenantId_idx" ON "ExpenseCategory"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "ExpenseCategory_tenantId_code_key" ON "ExpenseCategory"("tenantId", "code");

-- CreateIndex
CREATE INDEX "Expense_tenantId_date_idx" ON "Expense"("tenantId", "date");

-- CreateIndex
CREATE INDEX "Expense_tenantId_status_idx" ON "Expense"("tenantId", "status");

-- CreateIndex
CREATE INDEX "ExpenseFile_tenantId_expenseId_idx" ON "ExpenseFile"("tenantId", "expenseId");

-- CreateIndex
CREATE UNIQUE INDEX "RecurringExpense_expenseId_key" ON "RecurringExpense"("expenseId");

-- CreateIndex
CREATE INDEX "RecurringExpense_tenantId_active_idx" ON "RecurringExpense"("tenantId", "active");

-- CreateIndex
CREATE INDEX "Supplier_tenantId_status_idx" ON "Supplier"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_tenantId_nif_key" ON "Supplier"("tenantId", "nif");

-- CreateIndex
CREATE INDEX "SupplierSettlement_tenantId_supplierId_idx" ON "SupplierSettlement"("tenantId", "supplierId");

-- CreateIndex
CREATE INDEX "SupplierSettlement_tenantId_status_idx" ON "SupplierSettlement"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "SupplierSettlement_tenantId_number_key" ON "SupplierSettlement"("tenantId", "number");

-- CreateIndex
CREATE INDEX "SettlementLine_tenantId_settlementId_idx" ON "SettlementLine"("tenantId", "settlementId");

-- CreateIndex
CREATE INDEX "SettlementDocument_tenantId_settlementId_idx" ON "SettlementDocument"("tenantId", "settlementId");

-- CreateIndex
CREATE INDEX "SettlementStatusLog_tenantId_settlementId_idx" ON "SettlementStatusLog"("tenantId", "settlementId");

-- CreateIndex
CREATE INDEX "ReavExpedient_tenantId_invoiceId_idx" ON "ReavExpedient"("tenantId", "invoiceId");

-- CreateIndex
CREATE INDEX "ReavCost_tenantId_expedientId_idx" ON "ReavCost"("tenantId", "expedientId");

-- CreateIndex
CREATE INDEX "ReavDocument_tenantId_expedientId_idx" ON "ReavDocument"("tenantId", "expedientId");

-- CreateIndex
CREATE INDEX "CashRegister_tenantId_idx" ON "CashRegister"("tenantId");

-- CreateIndex
CREATE INDEX "CashSession_tenantId_status_idx" ON "CashSession"("tenantId", "status");

-- CreateIndex
CREATE INDEX "CashSession_tenantId_registerId_idx" ON "CashSession"("tenantId", "registerId");

-- CreateIndex
CREATE INDEX "CashMovement_tenantId_sessionId_idx" ON "CashMovement"("tenantId", "sessionId");

-- CreateIndex
CREATE INDEX "TpvSale_tenantId_date_idx" ON "TpvSale"("tenantId", "date");

-- CreateIndex
CREATE INDEX "TpvSale_tenantId_sessionId_idx" ON "TpvSale"("tenantId", "sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "TpvSale_tenantId_ticketNumber_key" ON "TpvSale"("tenantId", "ticketNumber");

-- CreateIndex
CREATE INDEX "TpvSaleItem_tenantId_saleId_idx" ON "TpvSaleItem"("tenantId", "saleId");

-- CreateIndex
CREATE INDEX "DiscountCode_tenantId_isActive_idx" ON "DiscountCode"("tenantId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "DiscountCode_tenantId_code_key" ON "DiscountCode"("tenantId", "code");

-- CreateIndex
CREATE INDEX "DiscountCodeUse_tenantId_codeId_idx" ON "DiscountCodeUse"("tenantId", "codeId");

-- CreateIndex
CREATE INDEX "CompensationVoucher_tenantId_isUsed_idx" ON "CompensationVoucher"("tenantId", "isUsed");

-- CreateIndex
CREATE UNIQUE INDEX "CompensationVoucher_tenantId_code_key" ON "CompensationVoucher"("tenantId", "code");

-- CreateIndex
CREATE INDEX "SiteSetting_tenantId_idx" ON "SiteSetting"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "SiteSetting_tenantId_key_key" ON "SiteSetting"("tenantId", "key");

-- CreateIndex
CREATE INDEX "SlideshowItem_tenantId_isActive_idx" ON "SlideshowItem"("tenantId", "isActive");

-- CreateIndex
CREATE INDEX "CmsMenuItem_tenantId_position_idx" ON "CmsMenuItem"("tenantId", "position");

-- CreateIndex
CREATE INDEX "StaticPage_tenantId_isPublished_idx" ON "StaticPage"("tenantId", "isPublished");

-- CreateIndex
CREATE UNIQUE INDEX "StaticPage_tenantId_slug_key" ON "StaticPage"("tenantId", "slug");

-- CreateIndex
CREATE INDEX "PageBlock_tenantId_pageId_idx" ON "PageBlock"("tenantId", "pageId");

-- CreateIndex
CREATE INDEX "ExternalPlatform_tenantId_idx" ON "ExternalPlatform"("tenantId");

-- CreateIndex
CREATE INDEX "PlatformProduct_tenantId_platformId_idx" ON "PlatformProduct"("tenantId", "platformId");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformProduct_tenantId_platformId_productId_key" ON "PlatformProduct"("tenantId", "platformId", "productId");

-- CreateIndex
CREATE INDEX "CouponRedemption_tenantId_code_idx" ON "CouponRedemption"("tenantId", "code");

-- CreateIndex
CREATE INDEX "CouponRedemption_tenantId_status_idx" ON "CouponRedemption"("tenantId", "status");

-- CreateIndex
CREATE INDEX "CouponEmailConfig_tenantId_idx" ON "CouponEmailConfig"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "CouponEmailConfig_tenantId_templateId_eventTrigger_key" ON "CouponEmailConfig"("tenantId", "templateId", "eventTrigger");

-- CreateIndex
CREATE INDEX "Review_tenantId_entityType_entityId_idx" ON "Review"("tenantId", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "Review_tenantId_status_idx" ON "Review"("tenantId", "status");

-- CreateIndex
CREATE INDEX "LegoPack_tenantId_isActive_idx" ON "LegoPack"("tenantId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "LegoPack_tenantId_slug_key" ON "LegoPack"("tenantId", "slug");

-- CreateIndex
CREATE INDEX "LegoPackLine_tenantId_packId_idx" ON "LegoPackLine"("tenantId", "packId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExperienceVariant" ADD CONSTRAINT "ExperienceVariant_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExperienceVariant" ADD CONSTRAINT "ExperienceVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductTimeSlot" ADD CONSTRAINT "ProductTimeSlot_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductTimeSlot" ADD CONSTRAINT "ProductTimeSlot_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomType" ADD CONSTRAINT "RoomType_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomRateSeason" ADD CONSTRAINT "RoomRateSeason_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomRate" ADD CONSTRAINT "RoomRate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomRate" ADD CONSTRAINT "RoomRate_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomRate" ADD CONSTRAINT "RoomRate_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "RoomRateSeason"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomBlock" ADD CONSTRAINT "RoomBlock_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomBlock" ADD CONSTRAINT "RoomBlock_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Restaurant" ADD CONSTRAINT "Restaurant_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantShift" ADD CONSTRAINT "RestaurantShift_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantShift" ADD CONSTRAINT "RestaurantShift_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantClosure" ADD CONSTRAINT "RestaurantClosure_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantClosure" ADD CONSTRAINT "RestaurantClosure_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantBooking" ADD CONSTRAINT "RestaurantBooking_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantBooking" ADD CONSTRAINT "RestaurantBooking_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantBooking" ADD CONSTRAINT "RestaurantBooking_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantStaff" ADD CONSTRAINT "RestaurantStaff_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantStaff" ADD CONSTRAINT "RestaurantStaff_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantStaff" ADD CONSTRAINT "RestaurantStaff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpaCategory" ADD CONSTRAINT "SpaCategory_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpaTreatment" ADD CONSTRAINT "SpaTreatment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpaTreatment" ADD CONSTRAINT "SpaTreatment_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "SpaCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpaResource" ADD CONSTRAINT "SpaResource_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpaSlot" ADD CONSTRAINT "SpaSlot_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpaSlot" ADD CONSTRAINT "SpaSlot_treatmentId_fkey" FOREIGN KEY ("treatmentId") REFERENCES "SpaTreatment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpaSlot" ADD CONSTRAINT "SpaSlot_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "SpaResource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpaScheduleTemplate" ADD CONSTRAINT "SpaScheduleTemplate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityBooking" ADD CONSTRAINT "ActivityBooking_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityBooking" ADD CONSTRAINT "ActivityBooking_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingMonitor" ADD CONSTRAINT "BookingMonitor_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingMonitor" ADD CONSTRAINT "BookingMonitor_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "ActivityBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingMonitor" ADD CONSTRAINT "BookingMonitor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyOrder" ADD CONSTRAINT "DailyOrder_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceLine" ADD CONSTRAINT "InvoiceLine_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceLine" ADD CONSTRAINT "InvoiceLine_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostCenter" ADD CONSTRAINT "CostCenter_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseCategory" ADD CONSTRAINT "ExpenseCategory_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ExpenseCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_costCenterId_fkey" FOREIGN KEY ("costCenterId") REFERENCES "CostCenter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseFile" ADD CONSTRAINT "ExpenseFile_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseFile" ADD CONSTRAINT "ExpenseFile_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringExpense" ADD CONSTRAINT "RecurringExpense_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringExpense" ADD CONSTRAINT "RecurringExpense_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierSettlement" ADD CONSTRAINT "SupplierSettlement_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierSettlement" ADD CONSTRAINT "SupplierSettlement_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SettlementLine" ADD CONSTRAINT "SettlementLine_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SettlementLine" ADD CONSTRAINT "SettlementLine_settlementId_fkey" FOREIGN KEY ("settlementId") REFERENCES "SupplierSettlement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SettlementDocument" ADD CONSTRAINT "SettlementDocument_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SettlementDocument" ADD CONSTRAINT "SettlementDocument_settlementId_fkey" FOREIGN KEY ("settlementId") REFERENCES "SupplierSettlement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SettlementStatusLog" ADD CONSTRAINT "SettlementStatusLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SettlementStatusLog" ADD CONSTRAINT "SettlementStatusLog_settlementId_fkey" FOREIGN KEY ("settlementId") REFERENCES "SupplierSettlement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReavExpedient" ADD CONSTRAINT "ReavExpedient_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReavExpedient" ADD CONSTRAINT "ReavExpedient_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReavCost" ADD CONSTRAINT "ReavCost_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReavCost" ADD CONSTRAINT "ReavCost_expedientId_fkey" FOREIGN KEY ("expedientId") REFERENCES "ReavExpedient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReavDocument" ADD CONSTRAINT "ReavDocument_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReavDocument" ADD CONSTRAINT "ReavDocument_expedientId_fkey" FOREIGN KEY ("expedientId") REFERENCES "ReavExpedient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashRegister" ADD CONSTRAINT "CashRegister_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashSession" ADD CONSTRAINT "CashSession_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashSession" ADD CONSTRAINT "CashSession_registerId_fkey" FOREIGN KEY ("registerId") REFERENCES "CashRegister"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashSession" ADD CONSTRAINT "CashSession_openedById_fkey" FOREIGN KEY ("openedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashMovement" ADD CONSTRAINT "CashMovement_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashMovement" ADD CONSTRAINT "CashMovement_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "CashSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TpvSale" ADD CONSTRAINT "TpvSale_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TpvSale" ADD CONSTRAINT "TpvSale_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "CashSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TpvSale" ADD CONSTRAINT "TpvSale_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TpvSaleItem" ADD CONSTRAINT "TpvSaleItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TpvSaleItem" ADD CONSTRAINT "TpvSaleItem_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "TpvSale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountCode" ADD CONSTRAINT "DiscountCode_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountCodeUse" ADD CONSTRAINT "DiscountCodeUse_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountCodeUse" ADD CONSTRAINT "DiscountCodeUse_codeId_fkey" FOREIGN KEY ("codeId") REFERENCES "DiscountCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompensationVoucher" ADD CONSTRAINT "CompensationVoucher_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteSetting" ADD CONSTRAINT "SiteSetting_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SlideshowItem" ADD CONSTRAINT "SlideshowItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CmsMenuItem" ADD CONSTRAINT "CmsMenuItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CmsMenuItem" ADD CONSTRAINT "CmsMenuItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "CmsMenuItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaticPage" ADD CONSTRAINT "StaticPage_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageBlock" ADD CONSTRAINT "PageBlock_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageBlock" ADD CONSTRAINT "PageBlock_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "StaticPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalPlatform" ADD CONSTRAINT "ExternalPlatform_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformProduct" ADD CONSTRAINT "PlatformProduct_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformProduct" ADD CONSTRAINT "PlatformProduct_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "ExternalPlatform"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformProduct" ADD CONSTRAINT "PlatformProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponRedemption" ADD CONSTRAINT "CouponRedemption_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponEmailConfig" ADD CONSTRAINT "CouponEmailConfig_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegoPack" ADD CONSTRAINT "LegoPack_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegoPackLine" ADD CONSTRAINT "LegoPackLine_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegoPackLine" ADD CONSTRAINT "LegoPackLine_packId_fkey" FOREIGN KEY ("packId") REFERENCES "LegoPack"("id") ON DELETE CASCADE ON UPDATE CASCADE;
