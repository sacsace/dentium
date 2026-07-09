"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { UserPlus } from "lucide-react";
import {
  AuthShell,
  AuthError,
  AuthFooterLink,
  AuthLink,
  authInputClass,
  authButtonClass,
} from "@/components/auth/AuthShell";

type ErpMatch = {
  erpCustomerNumber: string;
  customerName: string | null;
  company: string | null;
};

export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [erpMatch, setErpMatch] = useState<ErpMatch | null>(null);
  const [erpChecking, setErpChecking] = useState(false);

  useEffect(() => {
    const phone = form.phone.trim();
    if (phone.replace(/\D/g, "").length < 10) {
      setErpMatch(null);
      return;
    }

    let cancelled = false;
    setErpChecking(true);
    const timer = window.setTimeout(() => {
      fetch(`/api/erp-customers/lookup?phone=${encodeURIComponent(phone)}`)
        .then((r) => (r.ok ? r.json() : { matched: false }))
        .then((data) => {
          if (cancelled) return;
          if (data.matched) {
            setErpMatch({
              erpCustomerNumber: data.erpCustomerNumber,
              customerName: data.customerName,
              company: data.company,
            });
          } else {
            setErpMatch(null);
          }
        })
        .finally(() => {
          if (!cancelled) setErpChecking(false);
        });
    }, 400);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [form.phone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (form.phone.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          name: `${form.firstName} ${form.lastName}`.trim(),
          email: form.email,
          phone: form.phone,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }
      setSuccess(data.message || "Registration submitted. You will receive an email once your account is approved.");
      setForm({ firstName: "", lastName: "", email: "", phone: "", password: "", confirmPassword: "" });
      setErpMatch(null);
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Create a Dentium Account" subtitle="Quick sign-up — company and address can be added later when you purchase">
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-sm text-green-800 text-sm">
          {success}
        </div>
      )}
      {error && <AuthError message={error} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            required
            placeholder="First name *"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            className={authInputClass}
          />
          <input
            required
            placeholder="Last name *"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            className={authInputClass}
          />
        </div>
        <input
          required
          type="email"
          placeholder="Email *"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className={authInputClass}
        />
        <input
          required
          type="tel"
          placeholder="Phone * (ERP matching)"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className={authInputClass}
          autoComplete="tel"
        />
        {erpChecking && form.phone.trim() && (
          <p className="text-xs text-brand-silver -mt-2">Checking ERP records...</p>
        )}
        {erpMatch && (
          <div className="p-3 bg-brand-accent/15 border border-brand-accent/40 rounded-sm text-sm">
            <p className="font-medium text-brand-navy">
              ERP Customer #: <span className="font-mono">{erpMatch.erpCustomerNumber}</span>
            </p>
            {(erpMatch.customerName || erpMatch.company) && (
              <p className="text-brand-silver text-xs mt-1">
                {[erpMatch.customerName, erpMatch.company].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
        )}
        <input
          required
          type="password"
          placeholder="Password *"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className={authInputClass}
        />
        <input
          required
          type="password"
          placeholder="Confirm password *"
          value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          className={authInputClass}
        />
        <Button type="submit" className={authButtonClass} disabled={loading}>
          <UserPlus className="w-4 h-4" />
          {loading ? "Creating account..." : "Create Account"}
        </Button>
      </form>

      <AuthFooterLink>
        Already have an account? <AuthLink href="/auth/login">Login</AuthLink>
      </AuthFooterLink>
    </AuthShell>
  );
}
