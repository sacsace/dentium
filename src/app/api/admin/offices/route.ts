import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const offices = await prisma.globalOffice.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json(offices);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const {
      country,
      city,
      address,
      phone,
      email,
      latitude,
      longitude,
      isHeadquarter,
      sortOrder,
      isActive,
    } = body;

    if (!country || !city) {
      return NextResponse.json({ error: "Country and city are required" }, { status: 400 });
    }

    if (isHeadquarter) {
      await prisma.globalOffice.updateMany({ data: { isHeadquarter: false } });
    }

    const office = await prisma.globalOffice.create({
      data: {
        country,
        city,
        address: address || null,
        phone: phone || null,
        email: email || null,
        latitude: latitude != null && latitude !== "" ? Number(latitude) : null,
        longitude: longitude != null && longitude !== "" ? Number(longitude) : null,
        isHeadquarter: Boolean(isHeadquarter),
        sortOrder: sortOrder != null && sortOrder !== "" ? Number(sortOrder) : 0,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json(office, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
