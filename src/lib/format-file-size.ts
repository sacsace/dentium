export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes == null || bytes <= 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  const value = unitIndex === 0 ? Math.round(size) : Math.round(size * 10) / 10;
  return `${value} ${units[unitIndex]}`;
}

export function fileTypeFromName(name: string): string {
  const ext = name.split(".").pop()?.toUpperCase();
  return ext && ext.length <= 8 ? ext : "FILE";
}
