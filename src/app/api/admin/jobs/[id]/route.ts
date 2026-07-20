import { NextRequest, NextResponse } from "next/server";
import { EmploymentType } from "@prisma/client";
import slugify from "slugify";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: RouteContext) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const current = await prisma.jobPosting.findUnique({ where: { id } });
    if (!current) return NextResponse.json({ error: "Job posting not found." }, { status: 404 });

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

    const requestedSlug =
      slugify(body.slug || current.slug || title, { lower: true, strict: true }) || current.slug;
    const slugOwner = await prisma.jobPosting.findFirst({
      where: { slug: requestedSlug, id: { not: id } },
      select: { id: true },
    });
    if (slugOwner) {
      return NextResponse.json({ error: "This job URL slug is already in use." }, { status: 409 });
    }

    const isActive = Boolean(body.isActive);
    const job = await prisma.jobPosting.update({
      where: { id },
      data: {
        title,
        slug: requestedSlug,
        department,
        location: body.location?.trim() || null,
        employmentType: Object.values(EmploymentType).includes(body.employmentType)
          ? body.employmentType
          : current.employmentType,
        summary: body.summary?.trim() || null,
        description,
        requirements: body.requirements?.trim() || null,
        isActive,
        publishedAt: isActive ? current.publishedAt || new Date() : null,
      },
      include: { _count: { select: { applications: true } } },
    });

    return NextResponse.json(job);
  } catch {
    return NextResponse.json({ error: "Failed to update job posting." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.jobPosting.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: "Job posting not found." }, { status: 404 });

  await prisma.jobPosting.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
