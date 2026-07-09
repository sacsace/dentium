"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";

export function WhatsAppFloat() {
  const [href, setHref] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/site/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data?.whatsappNumber) return;
        const digits = String(data.whatsappNumber).replace(/\D/g, "");
        if (!digits) return;
        const message = encodeURIComponent(data.whatsappMessage || "Hello");
        setHref(`https://wa.me/${digits}?text=${message}`);
      })
      .catch(() => {});
  }, []);

  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg hover:scale-105 transition-transform"
      aria-label="Chat on WhatsApp"
      title="Chat on WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
    </a>
  );
}
