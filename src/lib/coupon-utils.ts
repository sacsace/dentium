export type DiscountType = "PERCENT" | "FIXED";

export type CouponValidationResult =
  | {
      valid: true;
      code: string;
      discountAmount: number;
      subtotal: number;
      total: number;
      discountType: DiscountType;
      discountValue: number;
    }
  | { valid: false; error: string };

export function normalizeCouponCode(code: string): string {
  return code.trim().toUpperCase();
}

export function calculateDiscountAmount(
  subtotal: number,
  discountType: DiscountType,
  discountValue: number
): number {
  if (subtotal <= 0) return 0;

  let discount = 0;
  if (discountType === "PERCENT") {
    discount = (subtotal * discountValue) / 100;
  } else {
    discount = discountValue;
  }

  return Math.min(Math.max(0, discount), subtotal);
}

export function formatDiscountLabel(type: DiscountType, value: number): string {
  if (type === "PERCENT") return `${value}% off`;
  return `₹${value.toLocaleString("en-IN")} off`;
}

const COUPON_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateCouponCode(length = 10): string {
  const bytes = new Uint8Array(length);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }

  let code = "";
  for (let i = 0; i < length; i++) {
    code += COUPON_CODE_CHARS[bytes[i] % COUPON_CODE_CHARS.length];
  }
  return code;
}
