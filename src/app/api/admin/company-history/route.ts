import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await prisma.companyHistory.findMany({
    orderBy: [{ sortOrder: "asc" }, { year: "asc" }],
  });

  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();
  const year = Number(data.year);

  if (!Number.isInteger(year) || year < 1900 || year > 2100) {
    return NextResponse.json({ error: "Valid year is required" }, { status: 400 });
  }

  if (!data.title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const item = await prisma.companyHistory.create({
    data: {
      year,
      title: data.title.trim(),
      description: data.description?.trim() || null,
      isActive: data.isActive ?? true,
      sortOrder: Number(data.sortOrder) || 0,
    },
  });

  return NextResponse.json(item);
}
