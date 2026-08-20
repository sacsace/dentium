"use client";

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
        "inline-flex items-center gap-0.5 border p-0.5 text-[11px] font-semibold tracking-wide",
        dark ? "border-white/25 bg-transparent text-white" : "border-brand-muted bg-white text-brand-navy",
        className
      )}
      role="group"
      aria-label={locale === "ko" ? "언어 선택" : "Select language"}
      data-no-translate
    >
      {!compact && <span className="px-1.5 opacity-50">LANG</span>}
      <button
        type="button"
        onClick={() => setLocale("ko")}
        className={cn(
          "px-2 py-1 transition-colors",
          locale === "ko"
            ? "bg-brand-accent text-brand-navy"
            : dark
              ? "text-white/55 hover:text-white"
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
          "px-2 py-1 transition-colors",
          locale === "en"
            ? "bg-brand-accent text-brand-navy"
            : dark
              ? "text-white/55 hover:text-white"
              : "text-brand-silver hover:text-brand-navy"
        )}
        aria-pressed={locale === "en"}
      >
        EN
      </button>
    </div>
  );
}
