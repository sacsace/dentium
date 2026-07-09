import { prisma } from "@/lib/prisma";
import {
  calculateDiscountAmount,
  normalizeCouponCode,
  type DiscountType,
} from "@/lib/coupon-utils";

export const DEFAULT_SHIPPING_FEE = 200;
export const DEFAULT_GST_RATE = 18;

export type CartLineInput = {
  productId: string;
  variantId?: string | null;
  quantity: number;
};

export type PricingLine = {
  productId: string;
  variantId: string | null;
  variantLabel: string | null;
  name: string;
  quantity: number;
  unitPrice: number;
  lineSubtotal: number;
  gstRate: number;
  promoDiscount: number;
  couponDiscount: number;
  taxableAmount: number;
  taxAmount: number;
};

export type PricingBreakdown = {
  lines: PricingLine[];
  subtotal: number;
  promotionDiscount: number;
  promotionTitle: string | null;
  couponDiscount: number;
  couponCode: string | null;
  freeShipping: boolean;
  shippingAmount: number;
  taxAmount: number;
  total: number;
  couponBlocked: boolean;
  couponBlockedReason: string | null;
};

type ProductRow = {
  id: string;
  name: string;
  price: unknown;
  gstRate: unknown;
  productType: string;
};

type VariantRow = {
  id: string;
  productId: string;
  name: string;
  price: unknown;
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function unitPrice(product: ProductRow, variant: VariantRow | null): number {
  if (variant?.price != null) return Number(variant.price);
  if (product.price != null) return Number(product.price);
  return 0;
}

function allocateDiscount(total: number, weights: number[]): number[] {
  if (total <= 0 || weights.every((w) => w <= 0)) {
    return weights.map(() => 0);
  }
  const sum = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map((w) => (w / sum) * total);
  const rounded = raw.map((v) => round2(v));
  const diff = round2(total - rounded.reduce((a, b) => a + b, 0));
  if (diff !== 0 && rounded.length > 0) {
    rounded[0] = round2(rounded[0] + diff);
  }
  return rounded;
}

async function loadCartContext(lines: CartLineInput[]) {
  const productIds = [...new Set(lines.map((l) => l.productId))];
  const variantIds = [...new Set(lines.map((l) => l.variantId).filter(Boolean))] as string[];

  const [products, variants, promotions] = await Promise.all([
    prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      select: { id: true, name: true, price: true, gstRate: true, productType: true },
    }),
    variantIds.length
      ? prisma.productVariant.findMany({
          where: { id: { in: variantIds }, isActive: true },
          select: { id: true, productId: true, name: true, price: true },
        })
      : Promise.resolve([]),
    prisma.promotion.findMany({
      where: {
        isActive: true,
        type: "BOGO",
        startsAt: { lte: new Date() },
        OR: [{ endsAt: null }, { endsAt: { gte: new Date() } }],
      },
      include: {
        buyProduct: { select: { name: true } },
        getProduct: { select: { name: true } },
      },
    }),
  ]);

  return {
    productMap: new Map(products.map((p) => [p.id, p])),
    variantMap: new Map(variants.map((v) => [v.id, v])),
    promotions,
  };
}

function calculateBogoDiscount(
  pricingLines: { productId: string; lineSubtotal: number; quantity: number; unitPrice: number }[],
  promotions: Awaited<ReturnType<typeof loadCartContext>>["promotions"]
): { discount: number; title: string | null; excludeCoupons: boolean } {
  let totalDiscount = 0;
  let title: string | null = null;
  let excludeCoupons = false;

  const qtyByProduct = new Map<string, number>();
  for (const line of pricingLines) {
    qtyByProduct.set(line.productId, (qtyByProduct.get(line.productId) || 0) + line.quantity);
  }

  for (const promo of promotions) {
    const buyQty = qtyByProduct.get(promo.buyProductId) || 0;
    if (buyQty < promo.buyQuantity) continue;

    const sets = Math.floor(buyQty / promo.buyQuantity);
    const freeUnits = sets * promo.getQuantity;
    const getLine = pricingLines.find((l) => l.productId === promo.getProductId);
    if (!getLine || freeUnits <= 0) continue;

    const discount = round2(Math.min(getLine.lineSubtotal, freeUnits * getLine.unitPrice));
    if (discount > 0) {
      totalDiscount = round2(totalDiscount + discount);
      title = promo.title;
      if (promo.excludeCoupons) excludeCoupons = true;
    }
  }

  return { discount: totalDiscount, title, excludeCoupons };
}

export async function calculateCartPricing(options: {
  lines: CartLineInput[];
  couponCode?: string | null;
  userId?: string | null;
}): Promise<PricingBreakdown> {
  const { lines, couponCode, userId } = options;
  const { productMap, variantMap, promotions } = await loadCartContext(lines);

  const baseLines: PricingLine[] = [];

  for (const input of lines) {
    const product = productMap.get(input.productId);
    if (!product) continue;
    const variant = input.variantId ? variantMap.get(input.variantId) ?? null : null;
    if (input.variantId && (!variant || variant.productId !== product.id)) continue;

    const qty = input.quantity > 0 ? input.quantity : 1;
    const price = unitPrice(product, variant);
    const gstRate = product.gstRate != null ? Number(product.gstRate) : DEFAULT_GST_RATE;

    baseLines.push({
      productId: product.id,
      variantId: variant?.id ?? null,
      variantLabel: variant?.name ?? null,
      name: variant ? `${product.name} — ${variant.name}` : product.name,
      quantity: qty,
      unitPrice: price,
      lineSubtotal: round2(price * qty),
      gstRate,
      promoDiscount: 0,
      couponDiscount: 0,
      taxableAmount: 0,
      taxAmount: 0,
    });
  }

  const subtotal = round2(baseLines.reduce((s, l) => s + l.lineSubtotal, 0));

  const bogo = calculateBogoDiscount(
    baseLines.map((l) => ({
      productId: l.productId,
      lineSubtotal: l.lineSubtotal,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
    })),
    promotions
  );

  const promoAlloc = allocateDiscount(
    bogo.discount,
    baseLines.map((l) => l.lineSubtotal)
  );
  baseLines.forEach((line, i) => {
    line.promoDiscount = promoAlloc[i];
  });

  const afterPromo = round2(subtotal - bogo.discount);

  let couponDiscount = 0;
  let appliedCode: string | null = null;
  let freeShipping = false;
  let couponBlocked = false;
  let couponBlockedReason: string | null = null;

  if (couponCode && afterPromo > 0) {
    if (bogo.excludeCoupons) {
      couponBlocked = true;
      couponBlockedReason = "Coupons cannot be combined with active promotions";
    } else {
      const couponResult = await validateCouponForCart(couponCode, afterPromo, {
        userId,
        cartProductIds: baseLines.map((l) => l.productId),
      });
      if (couponResult.valid) {
        couponDiscount = couponResult.discountAmount;
        appliedCode = couponResult.code;
        freeShipping = couponResult.freeShipping;
      }
    }
  }

  const couponAlloc = allocateDiscount(
    couponDiscount,
    baseLines.map((l) => round2(l.lineSubtotal - l.promoDiscount))
  );
  baseLines.forEach((line, i) => {
    line.couponDiscount = couponAlloc[i];
    line.taxableAmount = round2(line.lineSubtotal - line.promoDiscount - line.couponDiscount);
    line.taxAmount = round2(line.taxableAmount * (line.gstRate / 100));
  });

  const taxAmount = round2(baseLines.reduce((s, l) => s + l.taxAmount, 0));
  const shippingAmount = freeShipping || afterPromo <= 0 ? 0 : DEFAULT_SHIPPING_FEE;
  const total = round2(afterPromo - couponDiscount + taxAmount + shippingAmount);

  return {
    lines: baseLines,
    subtotal,
    promotionDiscount: bogo.discount,
    promotionTitle: bogo.title,
    couponDiscount,
    couponCode: appliedCode,
    freeShipping,
    shippingAmount,
    taxAmount,
    total,
    couponBlocked,
    couponBlockedReason,
  };
}

async function validateCouponForCart(
  code: string,
  subtotal: number,
  context: { userId?: string | null; cartProductIds: string[] }
) {
  const normalized = normalizeCouponCode(code);
  if (!normalized) return { valid: false as const, error: "Please enter a coupon code" };

  const coupon = await prisma.coupon.findUnique({ where: { code: normalized } });
  if (!coupon) return { valid: false as const, error: "Invalid coupon code" };
  if (!coupon.isActive) return { valid: false as const, error: "This coupon is no longer active" };
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return { valid: false as const, error: "This coupon has expired" };
  }
  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
    return { valid: false as const, error: "This coupon has reached its usage limit" };
  }

  if (coupon.allowedUserIds.length > 0) {
    if (!context.userId || !coupon.allowedUserIds.includes(context.userId)) {
      return { valid: false as const, error: "This coupon is not available for your account" };
    }
  }

  if (coupon.productIds.length > 0) {
    const hasProduct = context.cartProductIds.some((id) => coupon.productIds.includes(id));
    if (!hasProduct) {
      return { valid: false as const, error: "This coupon does not apply to items in your cart" };
    }
  }

  const minOrder = coupon.minOrderAmount != null ? Number(coupon.minOrderAmount) : 0;
  if (subtotal < minOrder) {
    return {
      valid: false as const,
      error: `Minimum order amount is ₹${minOrder.toLocaleString("en-IN")}`,
    };
  }

  const discountValue = Number(coupon.discountValue);
  let discountAmount = 0;

  if (coupon.freeShipping && coupon.discountType === "PERCENT" && discountValue === 0) {
    discountAmount = 0;
  } else if (coupon.freeShipping && coupon.discountType === "FIXED" && discountValue === 0) {
    discountAmount = 0;
  } else {
    discountAmount = calculateDiscountAmount(
      subtotal,
      coupon.discountType as DiscountType,
      discountValue
    );
  }

  return {
    valid: true as const,
    code: coupon.code,
    discountAmount,
    freeShipping: coupon.freeShipping,
    discountType: coupon.discountType as DiscountType,
    discountValue,
  };
}

export async function validateCouponCode(
  code: string,
  subtotal: number,
  context?: { userId?: string | null; cartProductIds?: string[] }
) {
  const result = await validateCouponForCart(code, subtotal, {
    userId: context?.userId,
    cartProductIds: context?.cartProductIds ?? [],
  });

  if (!result.valid) {
    return { valid: false as const, error: result.error };
  }

  const total = Math.max(0, subtotal - result.discountAmount);
  return {
    valid: true as const,
    code: result.code,
    discountAmount: result.discountAmount,
    subtotal,
    total,
    discountType: result.discountType,
    discountValue: result.discountValue,
    freeShipping: result.freeShipping,
  };
}
