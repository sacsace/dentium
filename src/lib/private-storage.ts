import path from "path";
import { mkdir, readFile, writeFile } from "fs/promises";

export const PRIVATE_FILE_PREFIX = "private:";

const STORAGE_ROOT = path.join(process.cwd(), "storage", "private");

function resolvePrivatePath(relativePath: string): string | null {
  const normalized = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, "");
  const fullPath = path.join(STORAGE_ROOT, normalized);
  if (!fullPath.startsWith(STORAGE_ROOT)) return null;
  return fullPath;
}

export async function savePrivateFile(file: File, subdir: string) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const uploadDir = path.join(STORAGE_ROOT, subdir);
  await mkdir(uploadDir, { recursive: true });

  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
  await writeFile(path.join(uploadDir, filename), buffer);

  return {
    storageKey: `${PRIVATE_FILE_PREFIX}${subdir}/${filename}`,
    fileName: file.name,
  };
}

export async function readStoredFile(fileUrl: string) {
  if (fileUrl.startsWith(PRIVATE_FILE_PREFIX)) {
    const relative = fileUrl.slice(PRIVATE_FILE_PREFIX.length);
    const fullPath = resolvePrivatePath(relative);
    if (!fullPath) return null;
    const buffer = await readFile(fullPath);
    return { buffer, fileName: path.basename(relative) };
  }

  if (fileUrl.startsWith("/uploads/")) {
    const publicRoot = path.join(process.cwd(), "public", "uploads");
    const relative = fileUrl.replace(/^\/uploads\//, "");
    const fullPath = path.join(publicRoot, relative);
    if (!fullPath.startsWith(publicRoot)) return null;
    const buffer = await readFile(fullPath);
    return { buffer, fileName: path.basename(relative) };
  }

  return null;
}
