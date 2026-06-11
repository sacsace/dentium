"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { LogIn } from "lucide-react";
import { notifyAuthChange } from "@/hooks/useAuth";
import {
  AuthShell,
  AuthError,
  AuthFooterLink,
  AuthLink,
  authInputClass,
  authButtonClass,
} from "@/components/auth/AuthShell";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }
      if (data.user.role === "ADMIN" || data.user.role === "SUPER_ADMIN") {
        notifyAuthChange();
        router.push("/admin");
      } else {
        notifyAuthChange();
        router.push("/");
      }
      router.refresh();
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Sign In" subtitle="Use your Dentium Account">
      {error && <AuthError message={error} />}

      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          required
          type="text"
          placeholder="Email or Mobile number"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className={authInputClass}
        />
        <div className="space-y-2">
          <input
            required
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className={authInputClass}
          />
          <div className="text-right">
            <AuthLink href="/auth/forgot-password">Forgot password?</AuthLink>
          </div>
        </div>
        <Button type="submit" className={authButtonClass} disabled={loading}>
          <LogIn className="w-4 h-4" />
          {loading ? "Signing in..." : "Log in"}
        </Button>
      </form>

      <AuthFooterLink>
        Don&apos;t have an account? <AuthLink href="/auth/register">Create Account</AuthLink>
      </AuthFooterLink>
    </AuthShell>
  );
}
