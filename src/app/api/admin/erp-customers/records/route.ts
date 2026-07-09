import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { buildErpRecordData, findErpCustomerConflict } from "@/lib/erp-customer-record";

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const conflict = await findErpCustomerConflict(body);
    if (conflict.conflict) {
      return NextResponse.json({ error: conflict.message, duplicate: true, field: conflict.field }, { status: 409 });
    }

    const data = buildErpRecordData(body);
    const record = await prisma.erpCustomerRecord.create({
      data,
      select: {
        id: true,
        erpCustomerNumber: true,
        phoneRaw: true,
        phoneNormalized: true,
        customerName: true,
        company: true,
        email: true,
        gstNo: true,
        panNo: true,
        state: true,
        address: true,
        others: true,
        erpStatus: true,
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create record" },
      { status: 400 }
    );
  }
}
