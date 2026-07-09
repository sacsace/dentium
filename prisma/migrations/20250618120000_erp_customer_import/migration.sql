-- AlterTable
ALTER TABLE "User" ADD COLUMN "erpCustomerNumber" TEXT;

-- CreateTable
CREATE TABLE "ErpCustomerImport" (
    "id" TEXT NOT NULL,
    "fileName" TEXT,
    "rowCount" INT NOT NULL DEFAULT 0,
    "createdCount" INT NOT NULL DEFAULT 0,
    "updatedCount" INT NOT NULL DEFAULT 0,
    "skippedCount" INT NOT NULL DEFAULT 0,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ErpCustomerImport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ErpCustomerRecord" (
    "id" TEXT NOT NULL,
    "erpCustomerNumber" TEXT NOT NULL,
    "phoneNormalized" TEXT NOT NULL,
    "phoneRaw" TEXT,
    "customerName" TEXT,
    "company" TEXT,
    "email" TEXT,
    "importId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ErpCustomerRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ErpCustomerRecord_phoneNormalized_key" ON "ErpCustomerRecord"("phoneNormalized");

-- CreateIndex
CREATE INDEX "ErpCustomerRecord_erpCustomerNumber_idx" ON "ErpCustomerRecord"("erpCustomerNumber");

-- AddForeignKey
ALTER TABLE "ErpCustomerRecord" ADD CONSTRAINT "ErpCustomerRecord_importId_fkey" FOREIGN KEY ("importId") REFERENCES "ErpCustomerImport"("id") ON DELETE SET NULL ON UPDATE CASCADE;
