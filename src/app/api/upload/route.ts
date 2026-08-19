import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { savePublicFile } from "@/lib/private-storage";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const inferredName = file.name.toLowerCase();
    const isImage = file.type.startsWith("image/") || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(inferredName);
    const isVideo = file.type.startsWith("video/") || /\.(mp4|webm)$/i.test(inferredName);
    const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(inferredName);

    if (!isImage && !isVideo && !isPdf) {
      return NextResponse.json({ error: "Only image, video, or PDF files are allowed" }, { status: 400 });
    }

    const MAX_SIZE = isVideo
      ? 50 * 1024 * 1024
      : isPdf
        ? 10 * 1024 * 1024
        : 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      const label = isVideo ? "Video must be 50MB or less" : isPdf ? "PDF must be 10MB or less" : "Image must be 5MB or less";
      return NextResponse.json({ error: label }, { status: 400 });
    }

    const saved = await savePublicFile(file, isVideo ? "videos" : isPdf ? "pdf" : "images");
    return NextResponse.json({ url: saved.publicUrl, storageKey: saved.storageKey });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
