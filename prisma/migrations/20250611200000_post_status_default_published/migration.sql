-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "status" SET DEFAULT 'PUBLISHED';

-- Map legacy archived posts to inactive
UPDATE "Post" SET "status" = 'DRAFT' WHERE "status" = 'ARCHIVED';
