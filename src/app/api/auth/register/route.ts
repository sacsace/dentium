import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createToken, setAuthCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name, firstName, lastName, email, password, phone,
      gstin, dciNumber, panNumber, state, city, pincode,
    } = body;

    if (!email || !password || (!name && !firstName)) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const fullName = name || `${firstName || ""} ${lastName || ""}`.trim();
    const hashed = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name: fullName,
        firstName,
        lastName,
        email,
        password: hashed,
        phone,
        gstin,
        dciNumber,
        panNumber,
        state,
        city,
        pincode,
        role: "USER",
      },
    });

    const sessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "USER",
    };

    const token = await createToken(sessionUser);
    await setAuthCookie(token);

    return NextResponse.json({ user: sessionUser });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
