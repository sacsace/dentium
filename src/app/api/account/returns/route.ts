import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const requests = await prisma.returnRequest.findMany({
    where: { userId: session.id },
    include: { order: { select: { orderNumber: true, status: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(requests);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();
  const orderId = typeof data.orderId === "string" ? data.orderId : "";
  const type = data.type === "EXCHANGE" ? "EXCHANGE" : "RETURN";
  const reason = typeof data.reason === "string" ? data.reason.trim() : "";
  const itemNotes = typeof data.itemNotes === "string" ? data.itemNotes.trim() : null;

  if (!orderId || !reason) {
    return NextResponse.json({ error: "Order and reason are required" }, { status: 400 });
  }

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: session.id },
  });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const existing = await prisma.returnRequest.findFirst({
    where: { orderId, status: { in: ["PENDING", "APPROVED"] } },
  });
  if (existing) {
    return NextResponse.json({ error: "A return/exchange request is already open for this order" }, { status: 409 });
  }

  const request = await prisma.returnRequest.create({
    data: { orderId, userId: session.id, type, reason, itemNotes },
    include: { order: { select: { orderNumber: true, status: true } } },
  });
  return NextResponse.json(request, { status: 201 });
}
