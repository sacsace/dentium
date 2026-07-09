-- DropIndex
DROP INDEX IF EXISTS "ErpCustomerRecord_phoneNormalized_key";

-- AlterTable
ALTER TABLE "ErpCustomerRecord" ADD COLUMN IF NOT EXISTS "gstNo" TEXT;
ALTER TABLE "ErpCustomerRecord" ADD COLUMN IF NOT EXISTS "panNo" TEXT;
ALTER TABLE "ErpCustomerRecord" ADD COLUMN IF NOT EXISTS "state" TEXT;
ALTER TABLE "ErpCustomerRecord" ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE "ErpCustomerRecord" ADD COLUMN IF NOT EXISTS "others" TEXT;
ALTER TABLE "ErpCustomerRecord" ADD COLUMN IF NOT EXISTS "erpStatus" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ErpCustomerRecord_erpCustomerNumber_key" ON "ErpCustomerRecord"("erpCustomerNumber");
CREATE INDEX IF NOT EXISTS "ErpCustomerRecord_phoneNormalized_idx" ON "ErpCustomerRecord"("phoneNormalized");
