import { prisma } from "@/lib/prisma";
import { normalizePhoneForLookup } from "@/lib/phone";

export function deriveErpCustomerNumber(gstNo: string, customerName: string, rowIndex: number): string {
  const slug = customerName
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 10)
    .toUpperCase();
  if (gstNo) return `${gstNo}-${slug || rowIndex}`;
  return `ERP-${String(rowIndex).padStart(4, "0")}`;
}

export type ErpRecordInput = {
  customerName?: string | null;
  gstNo?: string | null;
  panNo?: string | null;
  state?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  others?: string | null;
  erpStatus?: string | null;
  erpCustomerNumber?: string | null;
};

export async function findErpCustomerConflict(
  input: ErpRecordInput & { excludeId?: string }
): Promise<{ conflict: true; field: string; message: string } | { conflict: false }> {
  const excludeId = input.excludeId;
  const erpCustomerNumber = input.erpCustomerNumber?.trim();
  const gstNo = input.gstNo?.trim();
  const phoneNormalized = input.phone ? normalizePhoneForLookup(input.phone) : null;

  if (erpCustomerNumber) {
    const byNumber = await prisma.erpCustomerRecord.findFirst({
      where: { erpCustomerNumber, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true, customerName: true },
    });
    if (byNumber) {
      return {
        conflict: true,
        field: "erpCustomerNumber",
        message: `Duplicate ERP customer number "${erpCustomerNumber}" (${byNumber.customerName || "existing record"}).`,
      };
    }
  }

  if (gstNo && input.customerName?.trim()) {
    const byGstName = await prisma.erpCustomerRecord.findFirst({
      where: {
        gstNo,
        customerName: { equals: input.customerName.trim(), mode: "insensitive" },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true, customerName: true },
    });
    if (byGstName) {
      return {
        conflict: true,
        field: "gstNo",
        message: `Duplicate customer: same GST No. and Customer Name (${byGstName.customerName}).`,
      };
    }
  }

  return { conflict: false };
}

export function buildErpRecordData(input: ErpRecordInput, rowIndex = 1) {
  const customerName = input.customerName?.trim() || null;
  const gstNo = input.gstNo?.trim() || null;
  const phoneRaw = input.phone?.trim() || null;
  const phoneNormalized = phoneRaw ? normalizePhoneForLookup(phoneRaw) : null;

  if (!phoneNormalized) {
    throw new Error("A valid phone number is required (min 10 digits).");
  }
  if (!customerName) {
    throw new Error("Customer name is required.");
  }

  const erpCustomerNumber =
    input.erpCustomerNumber?.trim() ||
    deriveErpCustomerNumber(gstNo || "", customerName, rowIndex);

  return {
    erpCustomerNumber,
    phoneNormalized,
    phoneRaw,
    customerName,
    company: customerName,
    email: input.email?.trim() || null,
    gstNo,
    panNo: input.panNo?.trim() || null,
    state: input.state?.trim() || null,
    address: input.address?.trim() || null,
    others: input.others?.trim() || null,
    erpStatus: input.erpStatus?.trim() || null,
  };
}
