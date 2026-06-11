import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createToken,
  getSession,
  hashPassword,
  setAuthCookie,
  verifyPassword,
} from "@/lib/auth";

const profileSelect = {
  id: true,
  email: true,
  name: true,
  firstName: true,
  lastName: true,
  company: true,
  phone: true,
  gstin: true,
  dciNumber: true,
  panNumber: true,
  state: true,
  city: true,
  pincode: true,
  role: true,
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
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      gstin,
      dciNumber,
      panNumber,
      state,
      city,
      pincode,
      currentPassword,
      newPassword,
    } = body;

    const existing = await prisma.user.findUnique({ where: { id: session.id } });
    if (!existing) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (email && email !== existing.email) {
      const taken = await prisma.user.findUnique({ where: { email } });
      if (taken) {
        return NextResponse.json({ error: "Email already in use" }, { status: 409 });
      }
    }

    const data: Record<string, string | undefined> = {};

    if (firstName !== undefined) data.firstName = firstName || undefined;
    if (lastName !== undefined) data.lastName = lastName || undefined;
    if (email !== undefined) data.email = email;
    if (phone !== undefined) data.phone = phone || undefined;
    if (company !== undefined) data.company = company || undefined;
    if (gstin !== undefined) data.gstin = gstin || undefined;
    if (dciNumber !== undefined) data.dciNumber = dciNumber || undefined;
    if (panNumber !== undefined) data.panNumber = panNumber || undefined;
    if (state !== undefined) data.state = state || undefined;
    if (city !== undefined) data.city = city || undefined;
    if (pincode !== undefined) data.pincode = pincode || undefined;

    const nextFirst = firstName !== undefined ? firstName : existing.firstName;
    const nextLast = lastName !== undefined ? lastName : existing.lastName;
    const fullName = `${nextFirst || ""} ${nextLast || ""}`.trim();
    if (fullName) data.name = fullName;

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Current password is required" }, { status: 400 });
      }
      const valid = await verifyPassword(currentPassword, existing.password);
      if (!valid) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      }
      data.password = await hashPassword(newPassword);
    }

    const user = await prisma.user.update({
      where: { id: session.id },
      data,
      select: profileSelect,
    });

    if (user.name !== session.name || user.email !== session.email) {
      const token = await createToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as "USER" | "ADMIN" | "SUPER_ADMIN",
      });
      await setAuthCookie(token);
    }

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
