import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { requireAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.type.startsWith("image/") && !file.type.startsWith("video/") && file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only image, video, or PDF files are allowed" }, { status: 400 });
    }

    const MAX_SIZE = file.type.startsWith("video/")
      ? 50 * 1024 * 1024
      : file.type === "application/pdf"
        ? 10 * 1024 * 1024
        : 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      const label = file.type.startsWith("video/") ? "Video must be 50MB or less" : file.type === "application/pdf" ? "PDF must be 10MB or less" : "File must be 5MB or less";
      return NextResponse.json({ error: label }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    const url = `/uploads/${filename}`;
    return NextResponse.json({ url });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
