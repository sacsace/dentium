-- CreateTable
CREATE TABLE "CompanyHistory" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CompanyHistory_isActive_sortOrder_year_idx" ON "CompanyHistory"("isActive", "sortOrder", "year");
