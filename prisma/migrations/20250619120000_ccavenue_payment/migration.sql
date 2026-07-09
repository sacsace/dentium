-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('NOT_REQUIRED', 'PENDING', 'SUCCESS', 'FAILED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'NOT_REQUIRED';
ALTER TABLE "Order" ADD COLUMN "ccavenueTrackingId" TEXT;
ALTER TABLE "Order" ADD COLUMN "paidAt" TIMESTAMP(3);
