-- CreateEnum
CREATE TYPE "MembershipTier" AS ENUM ('ASSOCIATE', 'FULL');
CREATE TYPE "FullMemberApplicationStatus" AS ENUM ('NONE', 'PENDING', 'REJECTED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "membershipTier" "MembershipTier" NOT NULL DEFAULT 'ASSOCIATE';
ALTER TABLE "User" ADD COLUMN "licenseDocumentUrl" TEXT;
ALTER TABLE "User" ADD COLUMN "fullMemberStatus" "FullMemberApplicationStatus" NOT NULL DEFAULT 'NONE';
ALTER TABLE "User" ADD COLUMN "fullMemberRequestedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "fullMemberReviewNote" TEXT;
