-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('SIMPLE', 'BUNDLE');

-- CreateEnum
CREATE TYPE "PromotionType" AS ENUM ('BOGO');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN "productType" "ProductType" NOT NULL DEFAULT 'SIMPLE',
ADD COLUMN "gstRate" DECIMAL(5,2) NOT NULL DEFAULT 18;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "taxAmount" DECIMAL(12,2),
ADD COLUMN "shippingAmount" DECIMAL(12,2),
ADD COLUMN "promotionDiscount" DECIMAL(12,2);

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN "variantId" TEXT,
ADD COLUMN "variantLabel" TEXT,
ADD COLUMN "gstRate" DECIMAL(5,2),
ADD COLUMN "taxAmount" DECIMAL(12,2);

-- AlterTable
ALTER TABLE "Coupon" ADD COLUMN "freeShipping" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "productIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "allowedUserIds" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT,
    "price" DECIMAL(12,2),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductBundleItem" (
    "id" TEXT NOT NULL,
    "bundleProductId" TEXT NOT NULL,
    "componentProductId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "optionGroup" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductBundleItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Promotion" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "PromotionType" NOT NULL DEFAULT 'BOGO',
    "buyProductId" TEXT NOT NULL,
    "getProductId" TEXT NOT NULL,
    "buyQuantity" INTEGER NOT NULL DEFAULT 1,
    "getQuantity" INTEGER NOT NULL DEFAULT 1,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "excludeCoupons" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductVariant_productId_isActive_idx" ON "ProductVariant"("productId", "isActive");

-- CreateIndex
CREATE INDEX "ProductBundleItem_bundleProductId_idx" ON "ProductBundleItem"("bundleProductId");

-- CreateIndex
CREATE INDEX "Promotion_isActive_startsAt_endsAt_idx" ON "Promotion"("isActive", "startsAt", "endsAt");

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductBundleItem" ADD CONSTRAINT "ProductBundleItem_bundleProductId_fkey" FOREIGN KEY ("bundleProductId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductBundleItem" ADD CONSTRAINT "ProductBundleItem_componentProductId_fkey" FOREIGN KEY ("componentProductId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_buyProductId_fkey" FOREIGN KEY ("buyProductId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_getProductId_fkey" FOREIGN KEY ("getProductId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
