import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookie, getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertSameOrigin } from "@/lib/security";

export async function POST(req: NextRequest) {
  const originError = assertSameOrigin(req);
  if (originError) return originError;

  const session = await getSession();
  if (session) {
    await prisma.user.update({
      where: { id: session.id },
      data: { sessionVersion: { increment: 1 } },
    });
  }

  await clearAuthCookie();
  return NextResponse.json({ success: true });
}
