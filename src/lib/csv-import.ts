export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  const content = text.replace(/^\uFEFF/, "").trim();
  if (!content) return [];

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const next = content[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        cell += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(cell.trim());
      cell = "";
    } else if (char === "\n" || (char === "\r" && next === "\n")) {
      row.push(cell.trim());
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      cell = "";
      if (char === "\r") i++;
    } else {
      cell += char;
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell.trim());
    if (row.some((value) => value.length > 0)) rows.push(row);
  }

  return rows;
}

export function csvToRecords(text: string): Record<string, string>[] {
  const rows = parseCsv(text);
  if (rows.length < 2) return [];

  const headers = rows[0].map((header) => header.toLowerCase().trim());
  return rows
    .slice(1)
    .map((row) => {
      const record: Record<string, string> = {};
      headers.forEach((header, index) => {
        record[header] = row[index]?.trim() ?? "";
      });
      return record;
    })
    .filter((record) => Object.values(record).some((value) => value.length > 0));
}

export function parseCsvBoolean(value: string | undefined, defaultValue = true): boolean {
  if (value == null || value === "") return defaultValue;
  const normalized = value.toLowerCase();
  if (["true", "yes", "1", "y", "active"].includes(normalized)) return true;
  if (["false", "no", "0", "n", "inactive"].includes(normalized)) return false;
  return defaultValue;
}

export function splitCsvList(value: string | undefined, separator: "|" | "," = "|"): string[] {
  if (!value?.trim()) return [];
  if (separator === ",") {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return value.split("|").map((item) => item.trim()).filter(Boolean);
}

export type BulkImportFailure = {
  row: number;
  name?: string;
  error: string;
};

export type BulkImportResult = {
  created: number;
  failed: BulkImportFailure[];
};

export function downloadCsvTemplate(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
