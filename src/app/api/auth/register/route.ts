import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { lookupErpCustomerByPhone } from "@/lib/bulk-erp-customer-import";
import { normalizePhoneForLookup } from "@/lib/phone";

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

    if (!phone || !normalizePhoneForLookup(phone)) {
      return NextResponse.json({ error: "A valid phone number is required" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const erpRecord = await lookupErpCustomerByPhone(phone);

    const fullName = name || `${firstName || ""} ${lastName || ""}`.trim();
    const hashed = await hashPassword(password);

    await prisma.user.create({
      data: {
        name: fullName,
        firstName,
        lastName,
        email,
        password: hashed,
        phone,
        erpCustomerNumber: erpRecord?.erpCustomerNumber ?? null,
        gstin,
        dciNumber,
        panNumber,
        state,
        city,
        pincode,
        role: "USER",
        isActive: false,
        membershipTier: "ASSOCIATE",
      },
    });

    return NextResponse.json({
      success: true,
      pendingApproval: true,
      erpCustomerNumber: erpRecord?.erpCustomerNumber ?? null,
      message: erpRecord
        ? `Registration submitted (ERP #${erpRecord.erpCustomerNumber}). You will receive an email once your account is approved.`
        : "Registration submitted. You will receive an email once your account is approved.",
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
