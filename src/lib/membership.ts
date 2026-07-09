import type { SessionUser } from "@/lib/auth";
import type { UserProfile } from "@/lib/profile";

export type PriceAccess = "guest" | "associate" | "full";

export type MembershipProfile = UserProfile & {
  membershipTier?: "ASSOCIATE" | "FULL";
  licenseDocumentUrl?: string | null;
  fullMemberStatus?: "NONE" | "PENDING" | "REJECTED";
  fullMemberReviewNote?: string | null;
  role?: string;
};

export function isAdminRole(role?: string) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export function canSeeProductPrices(user: Pick<SessionUser, "role" | "membershipTier"> | null): boolean {
  if (!user) return false;
  if (isAdminRole(user.role)) return true;
  return user.membershipTier === "FULL";
}

export function getPriceAccess(user: Pick<SessionUser, "role" | "membershipTier"> | null): PriceAccess {
  if (!user) return "guest";
  if (canSeeProductPrices(user)) return "full";
  return "associate";
}

export function membershipTierLabel(tier: "ASSOCIATE" | "FULL") {
  return tier === "FULL" ? "Full Member" : "Associate Member";
}

export function isCompanyProfileComplete(profile: MembershipProfile): boolean {
  return !!(
    profile.company?.trim() &&
    profile.gstin?.trim() &&
    profile.panNumber?.trim() &&
    profile.state?.trim() &&
    profile.city?.trim() &&
    profile.pincode?.trim() &&
    profile.phone?.trim() &&
    profile.licenseDocumentUrl?.trim()
  );
}

export function canSubmitFullMembership(profile: MembershipProfile): boolean {
  if (profile.membershipTier === "FULL") return false;
  if (profile.fullMemberStatus === "PENDING") return false;
  return isCompanyProfileComplete(profile);
}
