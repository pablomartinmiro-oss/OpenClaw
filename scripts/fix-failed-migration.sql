-- Run this against your Railway Postgres to resolve the failed migration.
-- Connect via: railway connect postgres
-- Or use the Railway dashboard SQL console.

-- Step 1: Remove the failed migration record
DELETE FROM "_prisma_migrations" 
WHERE "migration_name" = '20260403000000_platform_expansion';

-- Step 2: Drop any partially created tables/indexes from the failed attempt
-- (These may or may not exist depending on how far the migration got)
DROP TABLE IF EXISTS "Category" CASCADE;
DROP TABLE IF EXISTS "Location" CASCADE;
DROP TABLE IF EXISTS "ExperienceVariant" CASCADE;
DROP TABLE IF EXISTS "ProductTimeSlot" CASCADE;
DROP TABLE IF EXISTS "RoomType" CASCADE;
DROP TABLE IF EXISTS "RoomRateSeason" CASCADE;
DROP TABLE IF EXISTS "RoomRate" CASCADE;
DROP TABLE IF EXISTS "RoomBlock" CASCADE;
DROP TABLE IF EXISTS "Restaurant" CASCADE;
DROP TABLE IF EXISTS "RestaurantShift" CASCADE;
DROP TABLE IF EXISTS "RestaurantClosure" CASCADE;
DROP TABLE IF EXISTS "RestaurantBooking" CASCADE;
DROP TABLE IF EXISTS "RestaurantStaff" CASCADE;
DROP TABLE IF EXISTS "SpaCategory" CASCADE;
DROP TABLE IF EXISTS "SpaTreatment" CASCADE;
DROP TABLE IF EXISTS "SpaResource" CASCADE;
DROP TABLE IF EXISTS "SpaSlot" CASCADE;
DROP TABLE IF EXISTS "SpaScheduleTemplate" CASCADE;
DROP TABLE IF EXISTS "Client" CASCADE;
DROP TABLE IF EXISTS "ActivityBooking" CASCADE;
DROP TABLE IF EXISTS "BookingMonitor" CASCADE;
DROP TABLE IF EXISTS "DailyOrder" CASCADE;
DROP TABLE IF EXISTS "Invoice" CASCADE;
DROP TABLE IF EXISTS "InvoiceLine" CASCADE;
DROP TABLE IF EXISTS "Transaction" CASCADE;
DROP TABLE IF EXISTS "CostCenter" CASCADE;
DROP TABLE IF EXISTS "ExpenseCategory" CASCADE;
DROP TABLE IF EXISTS "Expense" CASCADE;
DROP TABLE IF EXISTS "ExpenseFile" CASCADE;
DROP TABLE IF EXISTS "RecurringExpense" CASCADE;
DROP TABLE IF EXISTS "Supplier" CASCADE;
DROP TABLE IF EXISTS "SupplierSettlement" CASCADE;
DROP TABLE IF EXISTS "SettlementLine" CASCADE;
DROP TABLE IF EXISTS "SettlementDocument" CASCADE;
DROP TABLE IF EXISTS "SettlementStatusLog" CASCADE;
DROP TABLE IF EXISTS "ReavExpedient" CASCADE;
DROP TABLE IF EXISTS "ReavCost" CASCADE;
DROP TABLE IF EXISTS "ReavDocument" CASCADE;
DROP TABLE IF EXISTS "CashRegister" CASCADE;
DROP TABLE IF EXISTS "CashSession" CASCADE;
DROP TABLE IF EXISTS "CashMovement" CASCADE;
DROP TABLE IF EXISTS "TpvSale" CASCADE;
DROP TABLE IF EXISTS "TpvSaleItem" CASCADE;
DROP TABLE IF EXISTS "DiscountCode" CASCADE;
DROP TABLE IF EXISTS "DiscountCodeUse" CASCADE;
DROP TABLE IF EXISTS "CompensationVoucher" CASCADE;
DROP TABLE IF EXISTS "SiteSetting" CASCADE;
DROP TABLE IF EXISTS "SlideshowItem" CASCADE;
DROP TABLE IF EXISTS "CmsMenuItem" CASCADE;
DROP TABLE IF EXISTS "StaticPage" CASCADE;
DROP TABLE IF EXISTS "PageBlock" CASCADE;
DROP TABLE IF EXISTS "ExternalPlatform" CASCADE;
DROP TABLE IF EXISTS "PlatformProduct" CASCADE;
DROP TABLE IF EXISTS "CouponRedemption" CASCADE;
DROP TABLE IF EXISTS "CouponEmailConfig" CASCADE;
DROP TABLE IF EXISTS "Review" CASCADE;
DROP TABLE IF EXISTS "LegoPack" CASCADE;
DROP TABLE IF EXISTS "LegoPackLine" CASCADE;

-- Step 3: Remove the supplierId column if it was added
ALTER TABLE "Product" DROP COLUMN IF EXISTS "supplierId";

-- After running this, redeploy. The migration will run cleanly.
