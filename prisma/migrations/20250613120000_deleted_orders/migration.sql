-- CreateTable
CREATE TABLE "DeletedOrder" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "guestName" TEXT,
    "guestEmail" TEXT,
    "guestPhone" TEXT,
    "guestCompany" TEXT,
    "customerName" TEXT,
    "customerEmail" TEXT,
    "notes" TEXT,
    "totalAmount" DECIMAL(12,2),
    "items" JSONB NOT NULL,
    "orderCreatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedBy" TEXT,

    CONSTRAINT "DeletedOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DeletedOrder_orderNumber_idx" ON "DeletedOrder"("orderNumber");

-- CreateIndex
CREATE INDEX "DeletedOrder_deletedAt_idx" ON "DeletedOrder"("deletedAt");
