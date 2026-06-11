import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { savePrivateFile } from "@/lib/private-storage";
import { fileTypeFromName } from "@/lib/format-file-size";

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
  "application/x-zip-compressed",
]);

const MAX_SIZE = 20 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type) && !file.name.match(/\.(pdf|doc|docx|xls|xlsx|zip)$/i)) {
      return NextResponse.json({ error: "Allowed formats: PDF, DOC, DOCX, XLS, XLSX, ZIP" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File must be 20MB or less" }, { status: 400 });
    }

    const stored = await savePrivateFile(file, "downloads");

    return NextResponse.json({
      fileUrl: stored.storageKey,
      fileName: stored.fileName,
      fileType: fileTypeFromName(stored.fileName),
      fileSizeBytes: file.size,
    });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
