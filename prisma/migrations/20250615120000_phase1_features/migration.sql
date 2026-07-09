-- CreateEnum
CREATE TYPE "PopupContentType" AS ENUM ('IMAGE', 'VIDEO', 'HTML');
CREATE TYPE "PopupDisplayTarget" AS ENUM ('ALL', 'MOBILE', 'DESKTOP');

-- AlterTable PopupBanner
ALTER TABLE "PopupBanner" ADD COLUMN "videoUrl" TEXT,
ADD COLUMN "contentType" "PopupContentType" NOT NULL DEFAULT 'IMAGE',
ADD COLUMN "displayTarget" "PopupDisplayTarget" NOT NULL DEFAULT 'ALL',
ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- AlterTable Order
ALTER TABLE "Order" ADD COLUMN "carrier" TEXT,
ADD COLUMN "trackingNumber" TEXT,
ADD COLUMN "shippedAt" TIMESTAMP(3);

-- AlterTable QuoteRequest
ALTER TABLE "QuoteRequest" ADD COLUMN "totalAmount" DECIMAL(12,2),
ADD COLUMN "quotedAt" TIMESTAMP(3);

-- AlterTable QuoteItem
ALTER TABLE "QuoteItem" ADD COLUMN "unitPrice" DECIMAL(12,2);
