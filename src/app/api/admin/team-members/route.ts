import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

function parseFocal(value: unknown, fallback: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(100, Math.max(0, n));
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await prisma.teamMember.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();

  if (!data.name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  if (!data.role?.trim()) {
    return NextResponse.json({ error: "Role is required" }, { status: 400 });
  }

  if (!data.photoUrl?.trim()) {
    return NextResponse.json({ error: "Photo is required" }, { status: 400 });
  }

  const item = await prisma.teamMember.create({
    data: {
      name: data.name.trim(),
      role: data.role.trim(),
      department: data.department?.trim() || null,
      bio: data.bio?.trim() || null,
      photoUrl: data.photoUrl.trim(),
      photoFocalX: parseFocal(data.photoFocalX, 50),
      photoFocalY: parseFocal(data.photoFocalY, 38),
      isActive: data.isActive ?? true,
      sortOrder: Number(data.sortOrder) || 0,
    },
  });

  return NextResponse.json(item);
}
