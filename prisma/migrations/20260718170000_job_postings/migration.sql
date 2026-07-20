ALTER TYPE "ResumeAttachmentType" ADD VALUE IF NOT EXISTS 'RESUME';

CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP');

CREATE TABLE "JobPosting" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "location" TEXT,
    "employmentType" "EmploymentType" NOT NULL DEFAULT 'FULL_TIME',
    "summary" TEXT,
    "description" TEXT NOT NULL,
    "requirements" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobPosting_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ResumeApplication" ADD COLUMN "jobId" TEXT;

CREATE UNIQUE INDEX "JobPosting_slug_key" ON "JobPosting"("slug");
CREATE INDEX "JobPosting_isActive_sortOrder_idx" ON "JobPosting"("isActive", "sortOrder");
CREATE INDEX "JobPosting_department_idx" ON "JobPosting"("department");
CREATE INDEX "ResumeApplication_jobId_idx" ON "ResumeApplication"("jobId");

ALTER TABLE "ResumeApplication"
ADD CONSTRAINT "ResumeApplication_jobId_fkey"
FOREIGN KEY ("jobId") REFERENCES "JobPosting"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "JobPosting" (
    "id", "title", "slug", "department", "location", "employmentType",
    "summary", "description", "requirements", "isActive", "sortOrder",
    "publishedAt", "updatedAt"
) VALUES
(
    'default-job-sales-executive',
    'Sales Executive',
    'sales-executive',
    'SALES',
    'Multiple locations, India',
    'FULL_TIME',
    'Build strong relationships with dental professionals and grow Dentium products in your region.',
    'Develop regional sales opportunities, visit clinics and hospitals, demonstrate Dentium solutions, maintain customer relationships, and achieve agreed sales targets.',
    'Graduate in any discipline\nStrong communication and relationship-building skills\nDental or medical device sales experience is preferred\nWillingness to travel within the assigned region',
    true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
    'default-job-clinical-specialist',
    'Clinical Product Specialist',
    'clinical-product-specialist',
    'MARKETING',
    'Gurugram, Haryana',
    'FULL_TIME',
    'Support dental professionals through product demonstrations, clinical education, and technical guidance.',
    'Conduct product demonstrations and workshops, support clinical education programs, assist the sales team with technical knowledge, and collect customer feedback.',
    'Degree in Dentistry, Life Sciences, or a related discipline\nKnowledge of implant dentistry is preferred\nConfident presentation and training skills\nAbility to travel for workshops and events',
    true, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
    'default-job-logistics-coordinator',
    'Logistics Coordinator',
    'logistics-coordinator',
    'LOGISTICS',
    'Gurugram, Haryana',
    'FULL_TIME',
    'Coordinate inventory, dispatch, and delivery operations to provide reliable service to customers.',
    'Coordinate order dispatch, inventory movement, courier partners, delivery tracking, and internal documentation while maintaining accurate records.',
    'Graduate with strong organisational skills\nExperience in logistics, warehouse, or supply-chain operations\nComfortable with spreadsheets and ERP systems\nAttention to detail and clear communication',
    true, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);
