-- CreateTable
CREATE TABLE "DownloadResource" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL DEFAULT 'PDF',
    "fileSizeBytes" INTEGER,
    "requiresLogin" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DownloadResource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DownloadResource_isActive_sortOrder_idx" ON "DownloadResource"("isActive", "sortOrder");
