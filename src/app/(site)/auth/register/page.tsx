"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { UserPlus } from "lucide-react";
import { notifyAuthChange } from "@/hooks/useAuth";
import {
  AuthShell,
  AuthError,
  AuthFooterLink,
  AuthLink,
  authInputClass,
  authButtonClass,
} from "@/components/auth/AuthShell";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
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
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }
      notifyAuthChange();
      router.push("/");
      router.refresh();
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Create a Dentium Account" subtitle="Quick sign-up — company and address can be added later when you purchase">
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
