/** Uploaded multipart field — avoids `instanceof File` (breaks in bundled Node.js). */
export interface UploadableFile {
  name: string;
  size: number;
  type: string;
  arrayBuffer(): Promise<ArrayBuffer>;
}

export function isUploadableFile(value: unknown): value is UploadableFile {
  if (!value || typeof value !== "object") return false;
  const candidate = value as UploadableFile;
  return (
    typeof candidate.arrayBuffer === "function" &&
    typeof candidate.name === "string" &&
    typeof candidate.size === "number"
  );
}
