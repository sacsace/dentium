import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, requireAdmin } from "@/lib/auth";
import { canAssignRole, canManageUser } from "@/lib/admin-users";
import { sendAccountApprovedEmail, sendFullMemberApprovedEmail } from "@/lib/transactional-mail";

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
    const { name, role, company, phone, isActive, password, membershipTier, fullMemberAction, fullMemberReviewNote } = body;

    const data: Record<string, unknown> = {};
    let approveFullMember = false;

    if (name !== undefined) data.name = name;
    if (company !== undefined) data.company = company || null;
    if (phone !== undefined) data.phone = phone || null;
    if (isActive !== undefined) data.isActive = Boolean(isActive);

    if (fullMemberAction === "approve") {
      data.membershipTier = "FULL";
      data.fullMemberStatus = "NONE";
      data.fullMemberReviewNote = null;
      approveFullMember = target.fullMemberStatus === "PENDING" || target.membershipTier !== "FULL";
    } else if (fullMemberAction === "reject") {
      data.fullMemberStatus = "REJECTED";
      data.fullMemberReviewNote =
        typeof fullMemberReviewNote === "string" && fullMemberReviewNote.trim()
          ? fullMemberReviewNote.trim()
          : "Application rejected";
    } else if (membershipTier !== undefined) {
      if (membershipTier !== "ASSOCIATE" && membershipTier !== "FULL") {
        return NextResponse.json({ error: "Invalid membership tier" }, { status: 400 });
      }
      data.membershipTier = membershipTier;
      if (membershipTier === "FULL") {
        data.fullMemberStatus = "NONE";
        approveFullMember = target.membershipTier !== "FULL";
      }
    }

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
    });

    if (isActive === true && !target.isActive && target.role === "USER") {
      try {
        await sendAccountApprovedEmail({ to: user.email, name: user.name });
      } catch {
        // Account activated even if email fails
      }
    }

    if (approveFullMember && user.membershipTier === "FULL") {
      try {
        await sendFullMemberApprovedEmail({ to: user.email, name: user.name });
      } catch {
        // Tier updated even if email fails
      }
    }

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
