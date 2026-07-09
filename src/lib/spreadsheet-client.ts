/** Client-side: read CSV or Excel (.xlsx/.xls) as CSV text for bulk import. */
export async function readSpreadsheetAsCsv(file: File): Promise<string> {
  const isExcel =
    /\.xlsx?$/i.test(file.name) ||
    file.type.includes("spreadsheet") ||
    file.type.includes("excel");

  if (isExcel) {
    const XLSX = await import("xlsx");
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) return "";
    return XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
  }

  return file.text();
}
