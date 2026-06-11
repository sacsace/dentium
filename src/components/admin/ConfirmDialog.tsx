"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

type ConfirmState = ConfirmOptions & {
  resolve: (value: boolean) => void;
};

export function useConfirmDialog() {
  const [state, setState] = useState<ConfirmState | null>(null);
  const stateRef = useRef<ConfirmState | null>(null);

  const close = useCallback((value: boolean) => {
    stateRef.current?.resolve(value);
    stateRef.current = null;
    setState(null);
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      const next: ConfirmState = { ...options, resolve };
      stateRef.current = next;
      setState(next);
    });
  }, []);

  useEffect(() => {
    if (!state) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(false);
    };

    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [state, close]);

  const ConfirmDialogHost = useCallback(() => {
    if (!state) return null;

    return (
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50"
        onClick={() => close(false)}
        role="presentation"
      >
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-message"
          className="bg-white rounded-sm shadow-lg border border-gray-100 w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between p-6 pb-4">
            <div className="flex gap-4">
              <div className="shrink-0 w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" aria-hidden />
              </div>
              <div className="min-w-0 pt-0.5">
                <h2 id="confirm-dialog-title" className="text-base font-semibold text-brand-navy">
                  {state.title ?? "Confirm deletion"}
                </h2>
                <p id="confirm-dialog-message" className="mt-2 text-sm text-brand-silver leading-relaxed">
                  {state.message}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => close(false)}
              className="shrink-0 text-brand-silver hover:text-brand-dark -mt-1 -mr-1 p-1"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex justify-end gap-3 px-6 py-4 bg-brand-gray/30 border-t border-gray-100">
            <Button type="button" variant="ghost" size="sm" onClick={() => close(false)}>
              {state.cancelLabel ?? "Cancel"}
            </Button>
            <Button type="button" variant="danger" size="sm" onClick={() => close(true)}>
              {state.confirmLabel ?? "Delete"}
            </Button>
          </div>
        </div>
      </div>
    );
  }, [state, close]);

  return { confirm, ConfirmDialogHost };
}
