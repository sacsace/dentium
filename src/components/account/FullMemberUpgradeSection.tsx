"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { canSubmitFullMembership, isCompanyProfileComplete, membershipTierLabel } from "@/lib/membership";
import type { MembershipProfile } from "@/lib/membership";

export function FullMemberUpgradeSection({ profile }: { profile: MembershipProfile }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const complete = isCompanyProfileComplete(profile);
  const canApply = canSubmitFullMembership(profile);

  const handleApply = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    const res = await fetch("/api/account/full-membership", { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setMessage(data.message || "Application submitted.");
      router.refresh();
    } else {
      setError(data.error || "Failed to submit application");
    }
  };

  if (profile.membershipTier === "FULL") {
    return (
      <div className="p-4 bg-green-50 border border-green-100 rounded-xl text-sm text-green-800">
        You are a <strong>{membershipTierLabel("FULL")}</strong>. Product prices and purchasing are enabled.
      </div>
    );
  }

  return (
    <div className="p-5 bg-brand-light/50 border border-brand-accent/30 rounded-2xl space-y-4">
      <div>
        <p className="text-sm font-semibold text-brand-navy">Upgrade to Full Member</p>
        <p className="text-xs text-brand-silver mt-1">
          Associate members can browse the catalog but cannot see prices. Complete company details, upload your medical
          license, then apply for admin approval to become a full member.
        </p>
      </div>

      <p className="text-xs text-brand-navy">
        Current status: <strong>{membershipTierLabel("ASSOCIATE")}</strong>
        {profile.fullMemberStatus === "PENDING" && (
          <span className="text-amber-700"> · Application pending review</span>
        )}
        {profile.fullMemberStatus === "REJECTED" && (
          <span className="text-red-600"> · Application rejected — update details and re-apply</span>
        )}
      </p>

      {profile.fullMemberReviewNote && profile.fullMemberStatus === "REJECTED" && (
        <p className="text-xs text-red-600 bg-red-50 p-3 rounded-lg">{profile.fullMemberReviewNote}</p>
      )}

      {!complete && (
        <ul className="text-xs text-brand-silver list-disc pl-5 space-y-1">
          {!profile.company?.trim() && <li>Company / clinic name</li>}
          {!profile.gstin?.trim() && <li>GSTIN</li>}
          {!profile.panNumber?.trim() && <li>PAN number</li>}
          {!profile.phone?.trim() && <li>Phone number (Personal Information)</li>}
          {!profile.state?.trim() && <li>State</li>}
          {!profile.city?.trim() && <li>City</li>}
          {!profile.pincode?.trim() && <li>Pincode</li>}
          {!profile.licenseDocumentUrl?.trim() && <li>Medical license copy</li>}
        </ul>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-green-700">{message}</p>}

      {canApply && (
        <Button type="button" onClick={handleApply} disabled={loading}>
          {loading ? "Submitting..." : "Apply for Full Membership"}
        </Button>
      )}

      {profile.fullMemberStatus === "PENDING" && (
        <p className="text-xs text-brand-silver">We will email you once an admin reviews your application.</p>
      )}
    </div>
  );
}
