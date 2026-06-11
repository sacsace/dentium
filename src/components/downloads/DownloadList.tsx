"use client";

import Link from "next/link";
import { Download, Lock } from "lucide-react";

export interface DownloadListItem {
  id: string;
  title: string;
  fileType: string;
  fileSizeLabel: string;
  requiresLogin: boolean;
}

interface DownloadListProps {
  items: DownloadListItem[];
  isLoggedIn: boolean;
}

export function DownloadList({ items, isLoggedIn }: DownloadListProps) {
  if (items.length === 0) {
    return (
      <p className="text-center text-brand-silver text-sm py-12">
        No downloads available at the moment. Please check back later.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const locked = item.requiresLogin && !isLoggedIn;

        return (
          <div
            key={item.id}
            className="flex items-center justify-between gap-4 p-4 bg-brand-gray rounded-sm hover:bg-brand-light/80 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              {locked ? (
                <Lock className="w-5 h-5 text-brand-silver shrink-0" />
              ) : (
                <Download className="w-5 h-5 text-brand-accent-dark shrink-0" />
              )}
              <div className="min-w-0">
                <p className="font-medium text-brand-navy text-sm truncate">{item.title}</p>
                <p className="text-brand-silver text-xs">
                  {item.fileType} · {item.fileSizeLabel}
                </p>
              </div>
            </div>

            {locked ? (
              <Link
                href="/auth/login?redirect=/downloads"
                className="shrink-0 text-sm font-medium text-brand-accent-dark hover:underline"
              >
                Login to download
              </Link>
            ) : (
              <a
                href={`/api/downloads/${item.id}`}
                download
                className="shrink-0 text-sm font-medium text-brand-accent-dark hover:underline"
              >
                Download
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}
