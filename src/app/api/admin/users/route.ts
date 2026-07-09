import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, requireAdmin } from "@/lib/auth";
import { canAssignRole, listUsersWhere } from "@/lib/admin-users";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const users = await prisma.user.findMany({
    where: listUsersWhere(session),
    select: {
      id: true,
      email: true,
      name: true,
      company: true,
      phone: true,
      erpCustomerNumber: true,
      role: true,
      isActive: true,
      membershipTier: true,
      licenseDocumentUrl: true,
      fullMemberStatus: true,
      fullMemberRequestedAt: true,
      fullMemberReviewNote: true,
      gstin: true,
      panNumber: true,
      state: true,
      city: true,
      pincode: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ users, viewerRole: session.role });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { name, email, password, role = "USER", company, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    if (!canAssignRole(session, role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 403 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: await hashPassword(password),
        role,
        company: company || undefined,
        phone: phone || undefined,
        isActive: true,
      },
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

    return NextResponse.json(user, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
