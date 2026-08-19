import path from "path";
import { mkdir, readFile, writeFile } from "fs/promises";
import type { UploadableFile } from "@/lib/upload-file";

export const PRIVATE_FILE_PREFIX = "private:";
export const PUBLIC_FILE_PREFIX = "public:";

function resolveStorageBase() {
  const configured = process.env.STORAGE_PATH?.trim();
  if (configured) return path.resolve(configured);

  // Railway and similar PaaS: use /tmp when no persistent volume is mounted.
  if (process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_SERVICE_NAME) {
    return path.join("/tmp", "dentium-india", "storage");
  }

  return path.join(process.cwd(), "storage");
}

function getStorageRoots() {
  const base = resolveStorageBase();
  return {
    private: path.join(base, "private"),
    public: path.join(base, "public"),
  };
}

function resolvePrivatePath(relativePath: string): string | null {
  const { private: storageRoot } = getStorageRoots();
  const normalized = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, "");
  const fullPath = path.join(storageRoot, normalized);
  if (!fullPath.startsWith(storageRoot)) return null;
  return fullPath;
}

function resolvePublicPath(relativePath: string): string | null {
  const { public: storageRoot } = getStorageRoots();
  const normalized = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, "");
  const fullPath = path.join(storageRoot, normalized);
  if (!fullPath.startsWith(storageRoot)) return null;
  return fullPath;
}

function detectContentType(fileName: string) {
  const ext = path.extname(fileName).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  if (ext === ".svg") return "image/svg+xml";
  if (ext === ".mp4") return "video/mp4";
  if (ext === ".webm") return "video/webm";
  if (ext === ".pdf") return "application/pdf";
  return "application/octet-stream";
}

export async function savePrivateFile(file: UploadableFile, subdir: string) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const { private: storageRoot } = getStorageRoots();
  const uploadDir = path.join(storageRoot, subdir);
  await mkdir(uploadDir, { recursive: true });

  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
  await writeFile(path.join(uploadDir, filename), buffer);

  return {
    storageKey: `${PRIVATE_FILE_PREFIX}${subdir}/${filename}`,
    fileName: file.name,
  };
}

export async function savePublicFile(file: UploadableFile, subdir: string) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  if (buffer.length === 0) {
    throw new Error("Empty file received");
  }

  const { public: storageRoot } = getStorageRoots();
  const uploadDir = path.join(storageRoot, subdir);
  await mkdir(uploadDir, { recursive: true });

  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
  await writeFile(path.join(uploadDir, filename), buffer);

  return {
    storageKey: `${PUBLIC_FILE_PREFIX}${subdir}/${filename}`,
    publicUrl: `/api/media/${subdir}/${filename}`,
    fileName: file.name,
    contentType: file.type || detectContentType(file.name),
  };
}

export async function readStoredFile(fileUrl: string) {
  if (fileUrl.startsWith(PRIVATE_FILE_PREFIX)) {
    const relative = fileUrl.slice(PRIVATE_FILE_PREFIX.length);
    const fullPath = resolvePrivatePath(relative);
    if (!fullPath) return null;
    const buffer = await readFile(fullPath);
    return { buffer, fileName: path.basename(relative), contentType: detectContentType(relative) };
  }

  if (fileUrl.startsWith(PUBLIC_FILE_PREFIX)) {
    const relative = fileUrl.slice(PUBLIC_FILE_PREFIX.length);
    const fullPath = resolvePublicPath(relative);
    if (!fullPath) return null;
    const buffer = await readFile(fullPath);
    return { buffer, fileName: path.basename(relative), contentType: detectContentType(relative) };
  }

  if (fileUrl.startsWith("/uploads/")) {
    const publicRoot = path.join(process.cwd(), "public", "uploads");
    const relative = fileUrl.replace(/^\/uploads\//, "");
    const fullPath = path.join(publicRoot, relative);
    if (!fullPath.startsWith(publicRoot)) return null;
    const buffer = await readFile(fullPath);
    return { buffer, fileName: path.basename(relative), contentType: detectContentType(relative) };
  }

  return null;
}
