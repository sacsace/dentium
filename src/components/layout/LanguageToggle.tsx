"use client";

import { Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageProvider";

export function LanguageToggle({
  compact = false,
  dark = false,
  className,
}: {
  compact?: boolean;
  dark?: boolean;
  className?: string;
}) {
  const { locale, setLocale } = useLanguage();

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border p-0.5 text-xs font-semibold",
        dark ? "border-white/20 bg-white/5 text-white" : "border-brand-muted bg-white/80 text-brand-navy",
        className
      )}
      role="group"
      aria-label={locale === "ko" ? "언어 선택" : "Select language"}
      data-no-translate
    >
      {!compact && <Languages className="ml-1.5 mr-1 h-3.5 w-3.5 opacity-60" aria-hidden="true" />}
      <button
        type="button"
        onClick={() => setLocale("ko")}
        className={cn(
          "rounded-full px-2 py-1 transition-colors",
          locale === "ko"
            ? "bg-brand-accent text-brand-navy"
            : dark
              ? "text-white/60 hover:text-white"
              : "text-brand-silver hover:text-brand-navy"
        )}
        aria-pressed={locale === "ko"}
      >
        한
      </button>
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={cn(
          "rounded-full px-2 py-1 transition-colors",
          locale === "en"
            ? "bg-brand-accent text-brand-navy"
            : dark
              ? "text-white/60 hover:text-white"
              : "text-brand-silver hover:text-brand-navy"
        )}
        aria-pressed={locale === "en"}
      >
        EN
      </button>
    </div>
  );
}
