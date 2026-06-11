import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, requireAdmin } from "@/lib/auth";
import { canAssignRole, canManageUser } from "@/lib/admin-users";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!canManageUser(session, target)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, role, company, phone, isActive, password } = body;

    const data: Record<string, unknown> = {};

    if (name !== undefined) data.name = name;
    if (company !== undefined) data.company = company || null;
    if (phone !== undefined) data.phone = phone || null;
    if (isActive !== undefined) data.isActive = Boolean(isActive);

    if (role !== undefined) {
      if (target.role === "SUPER_ADMIN") {
        return NextResponse.json({ error: "Super admin role cannot be changed" }, { status: 403 });
      }
      if (!canAssignRole(session, role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 403 });
      }
      data.role = role;
    }

    if (password) {
      data.password = await hashPassword(password);
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        company: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  if (session.id === id) {
    return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (!canManageUser(session, target)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (target.role === "SUPER_ADMIN") {
    return NextResponse.json({ error: "Super admin account cannot be deleted" }, { status: 403 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
