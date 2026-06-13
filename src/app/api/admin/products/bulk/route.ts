import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { importProductsFromCsv } from "@/lib/bulk-product-import";

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { csv } = await req.json();
  if (!csv || typeof csv !== "string" || !csv.trim()) {
    return NextResponse.json({ error: "CSV content is required" }, { status: 400 });
  }

  const result = await importProductsFromCsv(csv);
  return NextResponse.json(result);
}
