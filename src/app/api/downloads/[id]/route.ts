import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { readStoredFile } from "@/lib/private-storage";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  const item = await prisma.downloadResource.findUnique({ where: { id } });
  if (!item || !item.isActive) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (item.requiresLogin) {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Login required" }, { status: 401 });
    }
  }

  const file = await readStoredFile(item.fileUrl);
  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const contentType =
    item.fileType === "PDF"
      ? "application/pdf"
      : item.fileName.endsWith(".zip")
        ? "application/zip"
        : "application/octet-stream";

  return new NextResponse(new Uint8Array(file.buffer), {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${item.fileName.replace(/"/g, "")}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
