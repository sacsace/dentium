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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  const isFooter = variant === "footer";

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
          <p className={cn("text-sm", isFooter ? "text-white" : "text-brand-deep")}>Thank you for subscribing!</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              required
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 rounded-sm text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-deep"
            />
            <Button type="submit" variant={isFooter ? "secondary" : "primary"}>
              Subscribe
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
