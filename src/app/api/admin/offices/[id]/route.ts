import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const existing = await prisma.globalOffice.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Office not found" }, { status: 404 });
    }

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

    if (isHeadquarter) {
      await prisma.globalOffice.updateMany({
        where: { id: { not: id } },
        data: { isHeadquarter: false },
      });
    }

    const data: Record<string, unknown> = {};
    if (country !== undefined) data.country = country;
    if (city !== undefined) data.city = city;
    if (address !== undefined) data.address = address || null;
    if (phone !== undefined) data.phone = phone || null;
    if (email !== undefined) data.email = email || null;
    if (latitude !== undefined) data.latitude = latitude !== "" && latitude != null ? Number(latitude) : null;
    if (longitude !== undefined) data.longitude = longitude !== "" && longitude != null ? Number(longitude) : null;
    if (isHeadquarter !== undefined) data.isHeadquarter = Boolean(isHeadquarter);
    if (sortOrder !== undefined) data.sortOrder = sortOrder !== "" && sortOrder != null ? Number(sortOrder) : 0;
    if (isActive !== undefined) data.isActive = Boolean(isActive);

    const office = await prisma.globalOffice.update({ where: { id }, data });
    return NextResponse.json(office);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    await prisma.globalOffice.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Office not found" }, { status: 404 });
  }
}
