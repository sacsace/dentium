import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, context: RouteContext) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const { isActive } = await req.json();

  if (typeof isActive !== "boolean") {
    return NextResponse.json({ error: "isActive must be a boolean" }, { status: 400 });
  }

  try {
    const subscriber = await prisma.newsletterSubscriber.update({
      where: { id },
      data: {
        isActive,
        unsubscribedAt: isActive ? null : new Date(),
        ...(isActive ? { subscribedAt: new Date() } : {}),
      },
    });
    return NextResponse.json(subscriber);
  } catch {
    return NextResponse.json({ error: "Subscriber not found" }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;

  try {
    await prisma.newsletterSubscriber.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Subscriber not found" }, { status: 404 });
  }
}
