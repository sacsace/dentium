import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  createToken,
  clearAuthCookie,
  getSession,
  hashPassword,
  setAuthCookie,
  verifyPassword,
} from "@/lib/auth";
import { validateNewPassword } from "@/lib/password-reset";
import {
  createEmailVerificationToken,
  sendEmailVerificationEmail,
} from "@/lib/email-verification";
import { assertSameOrigin, isValidEmail, normalizeEmail } from "@/lib/security";
import { formatSmtpError } from "@/lib/mail";

const profileSelect = {
  id: true,
  email: true,
  name: true,
  firstName: true,
  lastName: true,
  company: true,
  phone: true,
  erpCustomerNumber: true,
  gstin: true,
  dciNumber: true,
  panNumber: true,
  state: true,
  city: true,
  pincode: true,
  role: true,
  membershipTier: true,
  licenseDocumentUrl: true,
  fullMemberStatus: true,
  fullMemberReviewNote: true,
  sessionVersion: true,
} as const;

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: profileSelect,
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}

export async function PATCH(req: NextRequest) {
  const originError = assertSameOrigin(req);
  if (originError) return originError;

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      firstName,
      lastName,
      email: rawEmail,
      phone,
      company,
      gstin,
      dciNumber,
      panNumber,
      state,
      city,
      pincode,
      licenseDocumentUrl,
      currentPassword,
      newPassword,
    } = body;

    const existing = await prisma.user.findUnique({ where: { id: session.id } });
    if (!existing) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const email =
      rawEmail !== undefined && typeof rawEmail === "string" ? normalizeEmail(rawEmail) : undefined;
    if (email !== undefined) {
      if (!isValidEmail(email)) {
        return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
      }
      if (email !== existing.email) {
        const taken = await prisma.user.findUnique({ where: { email } });
        if (taken) {
          return NextResponse.json({ error: "Email already in use" }, { status: 409 });
        }
      }
    }

    const data: Prisma.UserUpdateInput = {};
    let emailChanged = false;

    if (firstName !== undefined) data.firstName = firstName || undefined;
    if (lastName !== undefined) data.lastName = lastName || undefined;
    if (email !== undefined && email !== existing.email) {
      data.email = email;
      data.emailVerifiedAt = null;
      data.sessionVersion = { increment: 1 };
      emailChanged = true;
    }
    if (phone !== undefined) data.phone = phone || undefined;
    if (company !== undefined) data.company = company || undefined;
    if (gstin !== undefined) data.gstin = gstin || undefined;
    if (dciNumber !== undefined) data.dciNumber = dciNumber || undefined;
    if (panNumber !== undefined) data.panNumber = panNumber || undefined;
    if (state !== undefined) data.state = state || undefined;
    if (city !== undefined) data.city = city || undefined;
    if (pincode !== undefined) data.pincode = pincode || undefined;
    if (licenseDocumentUrl !== undefined) data.licenseDocumentUrl = licenseDocumentUrl || null;

    const nextFirst = firstName !== undefined ? firstName : existing.firstName;
    const nextLast = lastName !== undefined ? lastName : existing.lastName;
    const fullName = `${nextFirst || ""} ${nextLast || ""}`.trim();
    if (fullName) data.name = fullName;

    if (newPassword) {
      const passwordError = validateNewPassword(newPassword);
      if (passwordError) {
        return NextResponse.json({ error: passwordError }, { status: 400 });
      }
      if (!currentPassword) {
        return NextResponse.json({ error: "Current password is required" }, { status: 400 });
      }
      const valid = await verifyPassword(currentPassword, existing.password);
      if (!valid) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      }
      data.password = await hashPassword(newPassword);
      data.sessionVersion = { increment: 1 };
    }

    const user = await prisma.user.update({
      where: { id: session.id },
      data,
      select: profileSelect,
    });

    if (emailChanged) {
      try {
        const { token } = await createEmailVerificationToken(user.id);
        await sendEmailVerificationEmail({
          to: user.email,
          name: user.name,
          token,
        });
      } catch (error) {
        console.error("Re-verification email failed:", formatSmtpError(error));
      }
      await clearAuthCookie();
      return NextResponse.json({
        user,
        emailVerificationRequired: true,
        message: "Email updated. Please verify the new address before logging in again.",
      });
    }

    if (user.name !== session.name || user.email !== session.email || Boolean(newPassword)) {
      const token = await createToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as "USER" | "ADMIN" | "SUPER_ADMIN",
        membershipTier: user.membershipTier as "ASSOCIATE" | "FULL",
        sessionVersion: user.sessionVersion,
      });
      await setAuthCookie(token);
    }

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
