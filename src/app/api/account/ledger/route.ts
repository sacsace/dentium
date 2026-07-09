import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const requests = await prisma.ledgerRequest.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(requests);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();
  const periodFrom = data.periodFrom ? new Date(data.periodFrom) : null;
  const periodTo = data.periodTo ? new Date(data.periodTo) : null;
  const notes = typeof data.notes === "string" ? data.notes.trim() : null;
  const gstin = typeof data.gstin === "string" ? data.gstin.trim() : null;

  if (!periodFrom || !periodTo || Number.isNaN(periodFrom.getTime()) || Number.isNaN(periodTo.getTime())) {
    return NextResponse.json({ error: "Valid period dates are required" }, { status: 400 });
  }
  if (periodFrom > periodTo) {
    return NextResponse.json({ error: "Period end must be after start" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.id }, select: { gstin: true } });

  const request = await prisma.ledgerRequest.create({
    data: {
      userId: session.id,
      periodFrom,
      periodTo,
      gstin: gstin || user?.gstin || null,
      notes,
    },
  });
  return NextResponse.json(request, { status: 201 });
}
