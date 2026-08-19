import { NextRequest, NextResponse } from "next/server";
import { readStoredFile, PUBLIC_FILE_PREFIX } from "@/lib/private-storage";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { path } = await params;
  const relativePath = path.join("/");
  if (!relativePath) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const file = await readStoredFile(`${PUBLIC_FILE_PREFIX}${relativePath}`);
  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(file.buffer), {
    headers: {
      "Content-Type": file.contentType || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Disposition": `inline; filename="${file.fileName.replace(/"/g, "")}"`,
    },
  });
}
