import { NextRequest, NextResponse } from "next/server";
import { consumeEmailVerificationToken } from "@/lib/email-verification";
import { getClientIp, rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { assertSameOrigin } from "@/lib/security";

export async function POST(req: NextRequest) {
  const originError = assertSameOrigin(req);
  if (originError) return originError;

  const ip = getClientIp(req);
  const limited = rateLimit(`verify-email:${ip}`, 20, 60 * 60 * 1000);
  if (!limited.ok) return rateLimitResponse(limited.retryAfter);

  try {
    const body = await req.json();
    const token = typeof body.token === "string" ? body.token.trim() : "";
    if (!token) {
      return NextResponse.json({ error: "Verification token is required" }, { status: 400 });
    }

    const user = await consumeEmailVerificationToken(token);
    if (!user) {
      return NextResponse.json(
        { error: "This verification link is invalid or has expired." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Email verified. An administrator will approve your account before you can log in.",
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
