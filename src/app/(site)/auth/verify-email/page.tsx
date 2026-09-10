"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  AuthShell,
  AuthError,
  AuthFooterLink,
  AuthLink,
  authInputClass,
  authButtonClass,
} from "@/components/auth/AuthShell";

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    token ? "loading" : "idle"
  );
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [resendMsg, setResendMsg] = useState("");
  const [resendError, setResendError] = useState("");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setStatus("error");
          setMessage(data.error || "Verification failed.");
          return;
        }
        setStatus("success");
        setMessage(data.message || "Email verified successfully.");
      } catch {
        if (!cancelled) {
          setStatus("error");
          setMessage("An error occurred. Please try again.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setResending(true);
    setResendError("");
    setResendMsg("");
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResendError(data.error || "Could not resend verification email.");
        return;
      }
      setResendMsg(data.message);
    } catch {
      setResendError("An error occurred. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthShell title="Verify your email" subtitle="Confirm your address to continue registration">
      {status === "loading" && <p className="text-sm text-brand-silver">Verifying your email…</p>}
      {status === "success" && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-800 text-sm">
          {message}
          <p className="mt-3">
            <Link href="/auth/login" className="font-semibold text-brand-deep hover:underline">
              Go to login
            </Link>
          </p>
        </div>
      )}
      {status === "error" && <AuthError message={message} />}

      {(status === "idle" || status === "error") && (
        <form onSubmit={handleResend} className="space-y-4 mt-4">
          <p className="text-sm text-brand-silver">
            Need a new verification link? Enter the email you used to register.
          </p>
          <input
            required
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={authInputClass}
          />
          {resendError && <AuthError message={resendError} />}
          {resendMsg && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-sm">{resendMsg}</div>
          )}
          <Button type="submit" className={authButtonClass} disabled={resending}>
            {resending ? "Sending…" : "Resend verification email"}
          </Button>
        </form>
      )}

      <AuthFooterLink>
        Already verified? <AuthLink href="/auth/login">Log in</AuthLink>
      </AuthFooterLink>
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<AuthShell title="Verify your email"><p className="text-sm text-brand-silver">Loading…</p></AuthShell>}>
      <VerifyEmailInner />
    </Suspense>
  );
}
