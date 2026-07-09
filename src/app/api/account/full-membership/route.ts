import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { canSubmitFullMembership, isCompanyProfileComplete } from "@/lib/membership";

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      membershipTier: true,
      fullMemberStatus: true,
      company: true,
      gstin: true,
      panNumber: true,
      state: true,
      city: true,
      pincode: true,
      phone: true,
      licenseDocumentUrl: true,
    },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (user.membershipTier === "FULL") {
    return NextResponse.json({ error: "You are already a full member" }, { status: 400 });
  }
  if (user.fullMemberStatus === "PENDING") {
    return NextResponse.json({ error: "Your full membership application is already under review" }, { status: 400 });
  }

  const profile = {
    ...user,
    id: session.id,
    firstName: null,
    lastName: null,
    email: session.email,
    name: session.name,
    erpCustomerNumber: null,
    dciNumber: null,
  };

  if (!isCompanyProfileComplete(profile)) {
    return NextResponse.json(
      { error: "Please complete all company details and upload your medical license before applying." },
      { status: 400 }
    );
  }

  if (!canSubmitFullMembership(profile)) {
    return NextResponse.json({ error: "Unable to submit application" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.id },
    data: {
      fullMemberStatus: "PENDING",
      fullMemberRequestedAt: new Date(),
      fullMemberReviewNote: null,
    },
  });

  return NextResponse.json({
    success: true,
    message: "Full membership application submitted. An admin will review your company details and license.",
  });
}
