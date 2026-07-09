export function parseCouponPayload(data: Record<string, unknown>) {
  const freeShipping = Boolean(data.freeShipping);
  const discountType = data.discountType;
  if (!discountType || !["PERCENT", "FIXED"].includes(String(discountType))) {
    return { error: "Invalid discount type" as const };
  }

  const discountValue = Number(data.discountValue);
  if (!freeShipping && (!Number.isFinite(discountValue) || discountValue <= 0)) {
    return { error: "Discount value must be greater than 0 (or enable free shipping)" as const };
  }
  if (discountType === "PERCENT" && discountValue > 100) {
    return { error: "Percent discount cannot exceed 100" as const };
  }

  const productIds = Array.isArray(data.productIds)
    ? data.productIds.filter((id): id is string => typeof id === "string")
    : [];

  const allowedUserIds = Array.isArray(data.allowedUserIds)
    ? data.allowedUserIds.filter((id): id is string => typeof id === "string")
    : [];

  return {
    discountType: discountType as "PERCENT" | "FIXED",
    discountValue: freeShipping && !Number.isFinite(discountValue) ? 0 : discountValue,
    freeShipping,
    productIds,
    allowedUserIds,
  };
}
