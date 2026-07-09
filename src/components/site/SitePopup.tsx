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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
      <div className="relative bg-white rounded-sm shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/90 shadow hover:bg-white"
          aria-label="Close popup"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 pt-10">
          <h2 className="font-display text-xl font-semibold text-brand-navy mb-4 pr-8">{popup.title}</h2>

          {popup.contentType === "IMAGE" && popup.image && (
            <div className="relative aspect-video mb-4 rounded-sm overflow-hidden bg-brand-gray">
              <Image src={popup.image} alt={popup.title} fill className="object-cover" />
            </div>
          )}

          {popup.contentType === "VIDEO" && popup.videoUrl && (
            <div className="aspect-video mb-4 rounded-sm overflow-hidden bg-black">
              <iframe
                src={popup.videoUrl}
                title={popup.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {popup.contentType === "HTML" && popup.content && (
            <div
              className="prose prose-sm max-w-none mb-4 text-brand-dark"
              dangerouslySetInnerHTML={{ __html: popup.content }}
            />
          )}

          {popup.contentType !== "HTML" && popup.content && (
            <p className="text-brand-silver text-sm mb-4 whitespace-pre-wrap">{popup.content}</p>
          )}

          <div className="flex flex-wrap gap-3">
            {popup.ctaText && popup.ctaLink && (
              <Link href={popup.ctaLink} onClick={() => setVisible(false)}>
                <Button>{popup.ctaText}</Button>
              </Link>
            )}
            <button
              type="button"
              onClick={handleDismissToday}
              className="text-sm text-brand-silver hover:text-brand-navy underline"
            >
              Don&apos;t show again today
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
