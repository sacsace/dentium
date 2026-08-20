"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Popup = {
  id: string;
  title: string;
  content: string | null;
  image: string | null;
  videoUrl: string | null;
  contentType: "IMAGE" | "VIDEO" | "HTML";
  displayTarget: "ALL" | "MOBILE" | "DESKTOP";
  ctaText: string | null;
  ctaLink: string | null;
};

function dismissKey(id: string) {
  return `dentium-popup-dismiss-${id}`;
}

function isDismissedToday(id: string) {
  try {
    const raw = localStorage.getItem(dismissKey(id));
    if (!raw) return false;
    const dismissed = new Date(raw);
    const now = new Date();
    return dismissed.toDateString() === now.toDateString();
  } catch {
    return false;
  }
}

function dismissForToday(id: string) {
  localStorage.setItem(dismissKey(id), new Date().toISOString());
}

function matchesDisplayTarget(target: Popup["displayTarget"]) {
  if (target === "ALL") return true;
  const mobile = window.matchMedia("(max-width: 767px)").matches;
  if (target === "MOBILE") return mobile;
  return !mobile;
}

export function SitePopup() {
  const [popup, setPopup] = useState<Popup | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetch("/api/popups/active")
      .then((res) => (res.ok ? res.json() : []))
      .then((popups: Popup[]) => {
        const match = popups.find((p) => !isDismissedToday(p.id) && matchesDisplayTarget(p.displayTarget));
        if (match) {
          setPopup(match);
          setVisible(true);
        }
      })
      .catch(() => undefined);
  }, []);

  if (!visible || !popup) return null;

  const handleDismissToday = () => {
    dismissForToday(popup.id);
    setVisible(false);
  };

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      <div
        className="absolute inset-0 bg-brand-navy/25 backdrop-blur-[2px] pointer-events-auto"
        onClick={() => setVisible(false)}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="site-popup-title"
        className="pointer-events-auto absolute top-[12%] right-4 md:right-8 w-[min(100%-2rem,24rem)] origin-top-right animate-[popup-in_0.35s_ease-out]"
      >
        <div className="relative overflow-hidden border border-brand-muted bg-white shadow-lift">
          <div className="h-1 w-full bg-brand-accent" />

          <button
            type="button"
            onClick={() => setVisible(false)}
            className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center border border-brand-muted bg-white text-brand-navy transition-colors hover:bg-brand-gray hover:text-brand-deep"
            aria-label="Close popup"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="p-6 pt-5">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-accent">
              Notice
            </p>
            <h2
              id="site-popup-title"
              className="font-display pr-10 text-xl font-semibold leading-snug text-brand-navy"
            >
              {popup.title}
            </h2>

            {popup.contentType === "IMAGE" && popup.image && (
              <div className="relative mt-4 aspect-video overflow-hidden bg-brand-gray border border-brand-muted">
                <Image src={popup.image} alt={popup.title} fill className="object-cover" />
              </div>
            )}

            {popup.contentType === "VIDEO" && popup.videoUrl && (
              <div className="mt-4 aspect-video overflow-hidden bg-black border border-brand-muted">
                <iframe
                  src={popup.videoUrl}
                  title={popup.title}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {popup.content && (
              <div
                className="prose prose-sm tiptap-content mt-4 max-w-none text-brand-dark [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-lg"
                dangerouslySetInnerHTML={{ __html: popup.content }}
              />
            )}

            <div className="mt-6 flex flex-col gap-3">
              {popup.ctaText && popup.ctaLink && (
                <Link href={popup.ctaLink} onClick={() => setVisible(false)} className="w-full">
                  <Button className="w-full">{popup.ctaText}</Button>
                </Link>
              )}
              <button
                type="button"
                onClick={handleDismissToday}
                className="text-left text-xs font-medium text-brand-silver underline-offset-2 transition-colors hover:text-brand-navy hover:underline"
              >
                Don&apos;t show again today
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
