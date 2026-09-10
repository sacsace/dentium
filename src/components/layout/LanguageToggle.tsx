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
  const isKo = locale === "ko";

  return (
    <div
      className={cn("inline-flex items-center gap-2", className)}
      role="group"
      aria-label={isKo ? "언어 선택" : "Select language"}
      data-no-translate
    >
      {!compact && (
        <span
          className={cn(
            "text-[10px] font-semibold uppercase tracking-[0.14em]",
            dark ? "text-white/45" : "text-brand-silver"
          )}
        >
          Lang
        </span>
      )}
      <div
        className={cn(
          "relative inline-grid grid-cols-2 items-center rounded-full p-1",
          dark
            ? "bg-white/10 ring-1 ring-inset ring-white/20"
            : "bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06)] ring-1 ring-inset ring-black/[0.06]"
        )}
      >
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-brand-accent transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            isKo ? "translate-x-0" : "translate-x-full"
          )}
        />
        <button
          type="button"
          onClick={() => setLocale("ko")}
          className={cn(
            "relative z-10 min-w-[2.25rem] rounded-full px-3 py-1.5 text-center text-[12px] font-semibold leading-none transition-colors duration-200",
            isKo
              ? "text-brand-navy"
              : dark
                ? "text-white/50 hover:text-white/80"
                : "text-brand-silver hover:text-brand-navy/70"
          )}
          aria-pressed={isKo}
        >
          한
        </button>
        <button
          type="button"
          onClick={() => setLocale("en")}
          className={cn(
            "relative z-10 min-w-[2.25rem] rounded-full px-3 py-1.5 text-center text-[12px] font-semibold leading-none tracking-wide transition-colors duration-200",
            !isKo
              ? "text-brand-navy"
              : dark
                ? "text-white/50 hover:text-white/80"
                : "text-brand-silver hover:text-brand-navy/70"
          )}
          aria-pressed={!isKo}
        >
          EN
        </button>
      </div>
    </div>
  );
}
