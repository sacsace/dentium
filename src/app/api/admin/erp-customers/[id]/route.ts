import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { buildErpRecordData, findErpCustomerConflict } from "@/lib/erp-customer-record";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.erpCustomerRecord.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Record not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const merged = {
      erpCustomerNumber: body.erpCustomerNumber ?? existing.erpCustomerNumber,
      customerName: body.customerName ?? existing.customerName,
      gstNo: body.gstNo ?? existing.gstNo,
      panNo: body.panNo ?? existing.panNo,
      state: body.state ?? existing.state,
      email: body.email ?? existing.email,
      phone: body.phone ?? existing.phoneRaw ?? existing.phoneNormalized,
      address: body.address ?? existing.address,
      others: body.others ?? existing.others,
      erpStatus: body.erpStatus ?? existing.erpStatus,
    };

    const conflict = await findErpCustomerConflict({ ...merged, excludeId: id });
    if (conflict.conflict) {
      return NextResponse.json({ error: conflict.message, duplicate: true, field: conflict.field }, { status: 409 });
    }

    const data = buildErpRecordData(merged);
    const record = await prisma.erpCustomerRecord.update({
      where: { id },
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

    return NextResponse.json(record);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update record" },
      { status: 400 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    await prisma.erpCustomerRecord.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Record not found" }, { status: 404 });
  }
}
