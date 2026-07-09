"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Save, Building2, MapPin, User, Lock } from "lucide-react";
import { INDIAN_STATES } from "@/lib/site-config";
import { authInputClass } from "@/components/auth/AuthShell";
import type { UserProfile } from "@/lib/profile";
import { LicenseDocumentField } from "@/components/account/LicenseDocumentField";
import { FullMemberUpgradeSection } from "@/components/account/FullMemberUpgradeSection";
import type { MembershipProfile } from "@/lib/membership";

type AccountProfileFormProps = {
  profile: MembershipProfile;
  view?: "personal" | "company" | "all";
};

type SectionProps = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onSave: () => void;
  saving: boolean;
};

function ProfileSection({ id, title, description, icon, children, onSave, saving }: SectionProps) {
  return (
    <section id={id} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 md:p-8">
      <div className="flex items-start gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center text-brand-deep shrink-0">
          {icon}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-brand-navy tracking-tight">{title}</h2>
          <p className="text-brand-silver text-sm mt-1">{description}</p>
        </div>
      </div>

      <div className="space-y-4">{children}</div>

      <Button type="button" onClick={onSave} disabled={saving} className="rounded-xl mt-6">
        <Save className="w-4 h-4" />
        {saving ? "Saving..." : "Save"}
      </Button>
    </section>
  );
}

export function AccountProfileForm({ profile, view = "all" }: AccountProfileFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: profile.firstName || "",
    lastName: profile.lastName || "",
    email: profile.email,
    phone: profile.phone || "",
    company: profile.company || "",
    gstin: profile.gstin || "",
    dciNumber: profile.dciNumber || "",
    panNumber: profile.panNumber || "",
    state: profile.state || "",
    city: profile.city || "",
    pincode: profile.pincode || "",
    licenseDocumentUrl: profile.licenseDocumentUrl || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [savingSection, setSavingSection] = useState<string | null>(null);

  const saveSection = async (section: string, payload: Record<string, string | undefined>) => {
    setError("");
    setSuccess("");
    setSavingSection(section);

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update profile");
        return;
      }
      setSuccess("Saved successfully.");
      if (section === "security") {
        setForm((prev) => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
      }
      router.refresh();
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setSavingSection(null);
    }
  };

  const savePersonal = () =>
    saveSection("personal", {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
    });

  const saveBusiness = () =>
    saveSection("business", {
      company: form.company,
      gstin: form.gstin,
      dciNumber: form.dciNumber,
      panNumber: form.panNumber,
      licenseDocumentUrl: form.licenseDocumentUrl,
    });

  const saveAddress = () =>
    saveSection("address", {
      state: form.state,
      city: form.city,
      pincode: form.pincode,
    });

  const saveSecurity = () => {
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    if (!form.newPassword) {
      setError("Enter a new password to change it.");
      return;
    }
    saveSection("security", {
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
    });
  };

  const showPersonal = view === "all" || view === "personal";
  const showCompany = view === "all" || view === "company";

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3.5 rounded-xl border border-red-100">{error}</div>
      )}
      {success && (
        <div className="bg-green-50 text-green-700 text-sm p-3.5 rounded-xl border border-green-100">{success}</div>
      )}

      {showPersonal && (
        <>
          <ProfileSection
            id="personal-info"
            title="Personal Information"
            description="Your basic account details."
            icon={<User className="w-5 h-5" />}
            onSave={savePersonal}
            saving={savingSection === "personal"}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-brand-navy mb-1.5">First name</label>
                <input
                  required
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className={authInputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-navy mb-1.5">Last name</label>
                <input
                  required
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className={authInputClass}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-navy mb-1.5">Email</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={authInputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-navy mb-1.5">Phone</label>
              <input
                placeholder="+91"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={authInputClass}
              />
            </div>
            {profile.erpCustomerNumber && (
              <div>
                <label className="block text-sm font-medium text-brand-navy mb-1.5">ERP Customer #</label>
                <p className="px-4 py-2.5 bg-brand-light/50 border border-gray-100 rounded-xl font-mono text-sm text-brand-navy">
                  {profile.erpCustomerNumber}
                </p>
              </div>
            )}
          </ProfileSection>

          <ProfileSection
            id="security-info"
            title="Password"
            description="Change your password anytime."
            icon={<Lock className="w-5 h-5" />}
            onSave={saveSecurity}
            saving={savingSection === "security"}
          >
            <input
              type="password"
              placeholder="Current password"
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              className={authInputClass}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="password"
                placeholder="New password"
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                className={authInputClass}
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className={authInputClass}
              />
            </div>
          </ProfileSection>
        </>
      )}

      {showCompany && (
        <>
          <FullMemberUpgradeSection profile={{ ...profile, ...form }} />

          <ProfileSection
            id="business-info"
            title="Business & Tax Information"
            description="Clinic or company details for orders and tax invoices."
            icon={<Building2 className="w-5 h-5" />}
            onSave={saveBusiness}
            saving={savingSection === "business"}
          >
            <div>
              <label className="block text-sm font-medium text-brand-navy mb-1.5">Company / Clinic name</label>
              <input
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className={authInputClass}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-brand-navy mb-1.5">GSTIN</label>
                <input
                  placeholder="e.g. 22AAAAA0000A1Z5"
                  value={form.gstin}
                  onChange={(e) => setForm({ ...form, gstin: e.target.value })}
                  className={authInputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-navy mb-1.5">PAN number</label>
                <input
                  value={form.panNumber}
                  onChange={(e) => setForm({ ...form, panNumber: e.target.value })}
                  className={authInputClass}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-navy mb-1.5">DCI number (Optional)</label>
              <input
                value={form.dciNumber}
                onChange={(e) => setForm({ ...form, dciNumber: e.target.value })}
                className={authInputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-navy mb-1.5">Medical license copy *</label>
              <LicenseDocumentField
                value={form.licenseDocumentUrl}
                onChange={(licenseDocumentUrl) => setForm({ ...form, licenseDocumentUrl })}
              />
              <p className="text-xs text-brand-silver mt-2">Required for full membership approval.</p>
            </div>
          </ProfileSection>

          <ProfileSection
            id="address-info"
            title="Delivery Address"
            description="Default address for deliveries and invoices."
            icon={<MapPin className="w-5 h-5" />}
            onSave={saveAddress}
            saving={savingSection === "address"}
          >
            <div>
              <label className="block text-sm font-medium text-brand-navy mb-1.5">State</label>
              <select
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className={authInputClass}
              >
                <option value="">Select state</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-brand-navy mb-1.5">City</label>
                <input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className={authInputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-navy mb-1.5">Pincode</label>
                <input
                  value={form.pincode}
                  onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                  className={authInputClass}
                />
              </div>
            </div>
          </ProfileSection>
        </>
      )}
    </div>
  );
}
