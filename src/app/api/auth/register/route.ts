import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { lookupErpCustomerByPhone } from "@/lib/bulk-erp-customer-import";
import { normalizePhoneForLookup } from "@/lib/phone";
import { validateNewPassword } from "@/lib/password-reset";
import {
  createEmailVerificationToken,
  sendEmailVerificationEmail,
} from "@/lib/email-verification";
import { formatSmtpError } from "@/lib/mail";
import { getClientIp, rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { assertSameOrigin, isValidEmail, normalizeEmail } from "@/lib/security";

export async function POST(req: NextRequest) {
  const originError = assertSameOrigin(req);
  if (originError) return originError;

  const ip = getClientIp(req);
  const limited = rateLimit(`register:${ip}`, 5, 60 * 60 * 1000);
  if (!limited.ok) return rateLimitResponse(limited.retryAfter);

  try {
    const body = await req.json();
    const {
      name, firstName, lastName, email: rawEmail, password, phone,
      gstin, dciNumber, panNumber, state, city, pincode,
    } = body;

    const email = typeof rawEmail === "string" ? normalizeEmail(rawEmail) : "";
    if (!email || !password || (!name && !firstName)) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }
    if (!phone || !normalizePhoneForLookup(phone)) {
      return NextResponse.json({ error: "A valid phone number is required" }, { status: 400 });
    }

    const passwordError = validateNewPassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const erpRecord = await lookupErpCustomerByPhone(phone);
    const fullName = (name || `${firstName || ""} ${lastName || ""}`.trim()).slice(0, 120);
    const hashed = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name: fullName,
        firstName: typeof firstName === "string" ? firstName.slice(0, 80) : null,
        lastName: typeof lastName === "string" ? lastName.slice(0, 80) : null,
        email,
        password: hashed,
        phone: String(phone).slice(0, 40),
        erpCustomerNumber: erpRecord?.erpCustomerNumber ?? null,
        gstin: typeof gstin === "string" ? gstin.slice(0, 40) : null,
        dciNumber: typeof dciNumber === "string" ? dciNumber.slice(0, 40) : null,
        panNumber: typeof panNumber === "string" ? panNumber.slice(0, 40) : null,
        state: typeof state === "string" ? state.slice(0, 80) : null,
        city: typeof city === "string" ? city.slice(0, 80) : null,
        pincode: typeof pincode === "string" ? pincode.slice(0, 20) : null,
        role: "USER",
        isActive: false,
        emailVerifiedAt: null,
        membershipTier: "ASSOCIATE",
      },
    });

    let verificationSent = false;
    let mailWarning: string | null = null;
    try {
      const { token } = await createEmailVerificationToken(user.id);
      await sendEmailVerificationEmail({ to: email, name: fullName, token });
      verificationSent = true;
    } catch (error) {
      mailWarning = formatSmtpError(error);
      console.error("Verification email failed:", error);
    }

    return NextResponse.json({
      success: true,
      pendingEmailVerification: true,
      pendingApproval: true,
      verificationSent,
      erpCustomerNumber: erpRecord?.erpCustomerNumber ?? null,
      message: verificationSent
        ? "Registration submitted. Please verify your email, then wait for admin approval before logging in."
        : `Registration submitted, but the verification email could not be sent${mailWarning ? `: ${mailWarning}` : ""}. Contact support or ask an admin to resend verification.`,
    });
  } catch (error) {
    console.error("Registration failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
