"use client";

import { useState } from "react";
import { CheckCircle2, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  AuthShell,
  AuthError,
  AuthFooterLink,
  AuthLink,
  authInputClass,
  authButtonClass,
} from "@/components/auth/AuthShell";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error || "Unable to send reset instructions.");
        return;
      }
      setSuccess(data.message);
    } catch {
      setError("Unable to send reset instructions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Forgot Password" subtitle="Enter your email to receive reset instructions">
      {error && <AuthError message={error} />}
      {success && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          <p>{success}</p>
        </div>
      )}
      <p className="mb-5 text-sm leading-relaxed text-brand-silver">
        Enter your registered email address. We will send a secure link that expires in 1 hour.
      </p>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-silver" />
          <input
            required
            type="email"
            autoComplete="email"
            placeholder="Email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={`${authInputClass} pl-11`}
          />
        </div>
        <Button type="submit" className={authButtonClass} disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </Button>
      </form>
      <AuthFooterLink>
        Remember your password? <AuthLink href="/auth/login">Back to Login</AuthLink>
      </AuthFooterLink>
    </AuthShell>
  );
}
