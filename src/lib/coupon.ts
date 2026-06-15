import { prisma } from "@/lib/prisma";
import {
  calculateDiscountAmount,
  normalizeCouponCode,
  type CouponValidationResult,
} from "@/lib/coupon-utils";

export type { CouponValidationResult } from "@/lib/coupon-utils";

export async function validateCouponCode(
  code: string,
  subtotal: number
): Promise<CouponValidationResult> {
  const normalized = normalizeCouponCode(code);
  if (!normalized) {
    return { valid: false, error: "Please enter a coupon code" };
  }

  const coupon = await prisma.coupon.findUnique({ where: { code: normalized } });
  if (!coupon) {
    return { valid: false, error: "Invalid coupon code" };
  }
  if (!coupon.isActive) {
    return { valid: false, error: "This coupon is no longer active" };
  }
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return { valid: false, error: "This coupon has expired" };
  }
  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, error: "This coupon has reached its usage limit" };
  }

  const minOrder = coupon.minOrderAmount != null ? Number(coupon.minOrderAmount) : 0;
  if (subtotal < minOrder) {
    return {
      valid: false,
      error: `Minimum order amount is ₹${minOrder.toLocaleString("en-IN")}`,
    };
  }

  const discountValue = Number(coupon.discountValue);
  const discountAmount = calculateDiscountAmount(subtotal, coupon.discountType, discountValue);
  const total = Math.max(0, subtotal - discountAmount);

  return {
    valid: true,
    code: coupon.code,
    discountAmount,
    subtotal,
    total,
    discountType: coupon.discountType,
    discountValue,
  };
}
