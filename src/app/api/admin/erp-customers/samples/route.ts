import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { ensureErpCustomerSamples } from "@/lib/erp-customer-seed";

export async function POST() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await ensureErpCustomerSamples();
  if (!result.seeded) {
    return NextResponse.json(
      { error: "Sample data was not loaded because ERP records already exist.", seeded: false, count: result.count },
      { status: 409 }
    );
  }

  return NextResponse.json({ success: true, seeded: true, count: result.count });
}
