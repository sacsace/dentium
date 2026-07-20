import { NextRequest, NextResponse } from "next/server";
import { createToken, setAuthCookie, verifyPassword } from "@/lib/auth";
import { resolveLoginIdentifier } from "@/lib/login-identifier";
import { getClientIp, rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limited = rateLimit(`login:${ip}`, 10, 15 * 60 * 1000);
  if (!limited.ok) return rateLimitResponse(limited.retryAfter);

  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email or username and password are required" }, { status: 400 });
    }

    const loginEmail = resolveLoginIdentifier(email);
    const dbUser = await prisma.user.findUnique({ where: { email: loginEmail } });

    if (dbUser) {
      const valid = await verifyPassword(password, dbUser.password);
      if (valid && !dbUser.isActive) {
        return NextResponse.json(
          { error: "Your account is pending admin approval. You will be notified by email once approved." },
          { status: 403 }
        );
      }
    }

    if (!dbUser || !dbUser.isActive) {
      return NextResponse.json({ error: "Invalid email/username or password" }, { status: 401 });
    }

    const valid = await verifyPassword(password, dbUser.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email/username or password" }, { status: 401 });
    }

    const user = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role as "USER" | "ADMIN" | "SUPER_ADMIN",
      membershipTier: dbUser.membershipTier as "ASSOCIATE" | "FULL",
      sessionVersion: dbUser.sessionVersion,
    };

    const token = await createToken(user);
    await setAuthCookie(token);

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
