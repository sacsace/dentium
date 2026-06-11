"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface NewsletterSectionProps {
  variant?: "home" | "footer";
}

export function NewsletterSection({ variant = "home" }: NewsletterSectionProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isFooter = variant === "footer";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: variant }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Subscription failed. Please try again.");
        return;
      }

      setSubmitted(true);
      setMessage(data.message || "Thank you for subscribing!");
      setEmail("");
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={cn(isFooter ? "bg-brand-deep py-12" : "py-20 bg-brand-gray")}>
      <div className="container mx-auto px-4 lg:px-8 max-w-2xl text-center">
        <h2 className={cn("font-display text-2xl md:text-3xl font-semibold mb-3", isFooter ? "text-white" : "text-brand-navy")}>
          Subscribe To Our Newsletter
        </h2>
        <p className={cn("text-sm mb-6", isFooter ? "text-white/70" : "text-brand-silver")}>
          Join our subscribe list to get the latest news, updates and special offers delivered directly in your Inbox
        </p>
        {submitted ? (
          <p className={cn("text-sm", isFooter ? "text-white" : "text-brand-deep")}>{message}</p>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-sm text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-deep disabled:opacity-60"
              />
              <Button type="submit" variant={isFooter ? "secondary" : "primary"} disabled={loading}>
                {loading ? "Subscribing..." : "Subscribe"}
              </Button>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </form>
        )}
      </div>
    </section>
  );
}
