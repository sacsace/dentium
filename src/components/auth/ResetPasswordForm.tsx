"use client";

import { useState } from "react";
import { CheckCircle2, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  AuthError,
  AuthFooterLink,
  AuthLink,
  AuthShell,
  authButtonClass,
  authInputClass,
} from "@/components/auth/AuthShell";

export function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(token ? "" : "The reset link is invalid.");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error || "Unable to reset the password.");
        return;
      }
      setSuccess(data.message);
      setPassword("");
      setConfirmPassword("");
    } catch {
      setError("Unable to reset the password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Create New Password" subtitle="Choose a secure password for your account">
      {error && <AuthError message={error} />}
      {success ? (
        <>
          <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            <p>{success}</p>
          </div>
          <AuthFooterLink>
            <AuthLink href="/auth/login">Continue to Login</AuthLink>
          </AuthFooterLink>
        </>
      ) : (
        <>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-silver" />
              <input
                required
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                minLength={8}
                placeholder="New password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={`${authInputClass} px-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-silver hover:text-brand-navy"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <input
              required
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              minLength={8}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className={authInputClass}
            />
            <p className="text-xs leading-relaxed text-brand-silver">
              Use at least 8 characters with at least one letter and one number.
            </p>
            <Button
              type="submit"
              className={authButtonClass}
              disabled={loading || !token}
            >
              {loading ? "Changing Password..." : "Change Password"}
            </Button>
          </form>
          <AuthFooterLink>
            Need a new link? <AuthLink href="/auth/forgot-password">Request Reset Link</AuthLink>
          </AuthFooterLink>
        </>
      )}
    </AuthShell>
  );
}
