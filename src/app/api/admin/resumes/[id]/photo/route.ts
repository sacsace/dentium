import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { readStoredFile } from "@/lib/private-storage";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const application = await prisma.resumeApplication.findUnique({ where: { id } });
  if (!application?.photoUrl) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const file = await readStoredFile(application.photoUrl);
  if (!file) return NextResponse.json({ error: "File not found" }, { status: 404 });

  const ext = file.fileName.split(".").pop()?.toLowerCase();
  const contentType =
    ext === "png" ? "image/png" :
    ext === "webp" ? "image/webp" :
    ext === "gif" ? "image/gif" :
    "image/jpeg";

  return new NextResponse(new Uint8Array(file.buffer), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
