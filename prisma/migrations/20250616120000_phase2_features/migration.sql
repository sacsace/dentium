-- CreateEnum
CREATE TYPE "CouponEmailSegment" AS ENUM ('ALL_USERS', 'ACTIVE_USERS', 'SPECIFIC_USERS');

-- CreateEnum
CREATE TYPE "CouponEmailCampaignStatus" AS ENUM ('SCHEDULED', 'SENDING', 'SENT', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReturnRequestType" AS ENUM ('RETURN', 'EXCHANGE');

-- CreateEnum
CREATE TYPE "ReturnRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "LedgerRequestStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'REJECTED');

-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN "whatsappNumber" TEXT,
ADD COLUMN "whatsappMessage" TEXT,
ADD COLUMN "searchSuggestions" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "blogNotifyOnPublish" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "CouponEmailCampaign" (
    "id" TEXT NOT NULL,
    "couponId" TEXT NOT NULL,
    "segment" "CouponEmailSegment" NOT NULL DEFAULT 'ALL_USERS',
    "userIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "subject" TEXT NOT NULL,
    "message" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "status" "CouponEmailCampaignStatus" NOT NULL DEFAULT 'SCHEDULED',
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CouponEmailCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReturnRequest" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "userId" TEXT,
    "type" "ReturnRequestType" NOT NULL,
    "reason" TEXT NOT NULL,
    "itemNotes" TEXT,
    "status" "ReturnRequestStatus" NOT NULL DEFAULT 'PENDING',
    "adminNotes" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReturnRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LedgerRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "periodFrom" TIMESTAMP(3) NOT NULL,
    "periodTo" TIMESTAMP(3) NOT NULL,
    "gstin" TEXT,
    "notes" TEXT,
    "status" "LedgerRequestStatus" NOT NULL DEFAULT 'PENDING',
    "adminNotes" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LedgerRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CouponEmailCampaign_status_scheduledAt_idx" ON "CouponEmailCampaign"("status", "scheduledAt");

-- CreateIndex
CREATE INDEX "ReturnRequest_status_idx" ON "ReturnRequest"("status");

-- CreateIndex
CREATE INDEX "ReturnRequest_userId_idx" ON "ReturnRequest"("userId");

-- CreateIndex
CREATE INDEX "LedgerRequest_status_idx" ON "LedgerRequest"("status");

-- CreateIndex
CREATE INDEX "LedgerRequest_userId_idx" ON "LedgerRequest"("userId");

-- AddForeignKey
ALTER TABLE "CouponEmailCampaign" ADD CONSTRAINT "CouponEmailCampaign_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnRequest" ADD CONSTRAINT "ReturnRequest_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnRequest" ADD CONSTRAINT "ReturnRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerRequest" ADD CONSTRAINT "LedgerRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
