import { NextRequest, NextResponse } from "next/server";
import { createToken, setAuthCookie, verifyPassword } from "@/lib/auth";
import { resolveLoginIdentifier } from "@/lib/login-identifier";
import { getClientIp, rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import {
  assertSameOrigin,
  LOGIN_LOCK_MS,
  LOGIN_MAX_FAILURES,
  normalizeEmail,
} from "@/lib/security";

const GENERIC_AUTH_ERROR = "Invalid email/username or password";

export async function POST(req: NextRequest) {
  const originError = assertSameOrigin(req);
  if (originError) return originError;

  const ip = getClientIp(req);
  const limited = rateLimit(`login:${ip}`, 10, 15 * 60 * 1000);
  if (!limited.ok) return rateLimitResponse(limited.retryAfter);

  try {
    const body = await req.json();
    const emailRaw = typeof body.email === "string" ? body.email : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!emailRaw || !password) {
      return NextResponse.json({ error: "Email or username and password are required" }, { status: 400 });
    }

    const loginEmail = normalizeEmail(resolveLoginIdentifier(emailRaw));
    const dbUser = await prisma.user.findUnique({ where: { email: loginEmail } });

    if (dbUser?.lockedUntil && dbUser.lockedUntil.getTime() > Date.now()) {
      const minutes = Math.max(1, Math.ceil((dbUser.lockedUntil.getTime() - Date.now()) / 60000));
      return NextResponse.json(
        { error: `Account temporarily locked. Try again in about ${minutes} minute(s).` },
        { status: 423 }
      );
    }

    if (!dbUser) {
      return NextResponse.json({ error: GENERIC_AUTH_ERROR }, { status: 401 });
    }

    const valid = await verifyPassword(password, dbUser.password);
    if (!valid) {
      const failures = (dbUser.failedLoginCount ?? 0) + 1;
      const lockedUntil = failures >= LOGIN_MAX_FAILURES ? new Date(Date.now() + LOGIN_LOCK_MS) : null;
      await prisma.user.update({
        where: { id: dbUser.id },
        data: {
          failedLoginCount: failures,
          lockedUntil,
        },
      });
      return NextResponse.json({ error: GENERIC_AUTH_ERROR }, { status: 401 });
    }

    if (!dbUser.emailVerifiedAt && dbUser.role === "USER") {
      return NextResponse.json(
        {
          error: "Please verify your email before logging in. Check your inbox for the verification link.",
          code: "EMAIL_NOT_VERIFIED",
        },
        { status: 403 }
      );
    }

    if (!dbUser.isActive) {
      return NextResponse.json(
        { error: "Your account is pending admin approval. You will be notified by email once approved." },
        { status: 403 }
      );
    }

    if (dbUser.failedLoginCount > 0 || dbUser.lockedUntil) {
      await prisma.user.update({
        where: { id: dbUser.id },
        data: { failedLoginCount: 0, lockedUntil: null },
      });
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
