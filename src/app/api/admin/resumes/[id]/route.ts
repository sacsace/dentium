import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ResumeStatus } from "@prisma/client";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const resume = await prisma.resumeApplication.findUnique({
    where: { id },
    include: { attachments: true, job: { select: { id: true, title: true, slug: true } } },
  });
  if (!resume) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(resume);
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const { status, adminNotes } = await req.json();

  const data: {
    status?: ResumeStatus;
    adminNotes?: string | null;
    reviewedAt?: Date | null;
  } = {};

  if (status !== undefined) {
    if (!Object.values(ResumeStatus).includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    data.status = status;
    data.reviewedAt = status === "PENDING" ? null : new Date();
  }

  if (adminNotes !== undefined) {
    data.adminNotes = adminNotes?.trim() || null;
  }

  const resume = await prisma.resumeApplication.update({
    where: { id },
    data,
    include: { attachments: true, job: { select: { id: true, title: true, slug: true } } },
  });

  return NextResponse.json(resume);
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  await prisma.resumeApplication.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
