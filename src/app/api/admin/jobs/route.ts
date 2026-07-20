import { NextRequest, NextResponse } from "next/server";
import { EmploymentType } from "@prisma/client";
import slugify from "slugify";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const jobs = await prisma.jobPosting.findMany({
    include: { _count: { select: { applications: true } } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(jobs);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const department = typeof body.department === "string" ? body.department.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";

    if (!title || !department || !description) {
      return NextResponse.json(
        { error: "Title, department, and description are required." },
        { status: 400 }
      );
    }

    const employmentType = Object.values(EmploymentType).includes(body.employmentType)
      ? body.employmentType
      : EmploymentType.FULL_TIME;
    const baseSlug = slugify(body.slug || title, { lower: true, strict: true }) || `job-${Date.now()}`;
    const existingSlug = await prisma.jobPosting.findUnique({ where: { slug: baseSlug } });
    const slug = existingSlug ? `${baseSlug}-${Date.now().toString(36)}` : baseSlug;
    const maxOrder = await prisma.jobPosting.aggregate({ _max: { sortOrder: true } });

    const job = await prisma.jobPosting.create({
      data: {
        title,
        slug,
        department,
        location: body.location?.trim() || null,
        employmentType,
        summary: body.summary?.trim() || null,
        description,
        requirements: body.requirements?.trim() || null,
        isActive: body.isActive ?? true,
        sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
        publishedAt: body.isActive === false ? null : new Date(),
      },
      include: { _count: { select: { applications: true } } },
    });

    return NextResponse.json(job, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create job posting." }, { status: 500 });
  }
}
