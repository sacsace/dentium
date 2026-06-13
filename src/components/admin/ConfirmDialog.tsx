"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ADMIN_DIALOG_OVERLAY, ADMIN_DIALOG_PANEL } from "@/lib/admin-dialog";

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
}

export interface AlertOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  variant?: "error" | "warning" | "info";
}

type ConfirmState = ConfirmOptions & { resolve: (value: boolean) => void };
type AlertState = AlertOptions & { resolve: () => void };
type DialogState = { kind: "confirm"; state: ConfirmState } | { kind: "alert"; state: AlertState };

type AdminDialogContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  showAlert: (options: AlertOptions) => Promise<void>;
};

const AdminDialogContext = createContext<AdminDialogContextValue | null>(null);

function DialogIcon({ variant }: { variant: "danger" | "primary" | "error" | "warning" | "info" }) {
  if (variant === "info") {
    return (
      <div className="shrink-0 w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center">
        <Info className="w-5 h-5 text-sky-600" aria-hidden />
      </div>
    );
  }
  if (variant === "warning") {
    return (
      <div className="shrink-0 w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
        <AlertTriangle className="w-5 h-5 text-amber-600" aria-hidden />
      </div>
    );
  }
  if (variant === "primary") {
    return (
      <div className="shrink-0 w-10 h-10 rounded-full bg-brand-accent/20 flex items-center justify-center">
        <Info className="w-5 h-5 text-brand-deep" aria-hidden />
      </div>
    );
  }
  return (
    <div className="shrink-0 w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
      <AlertCircle className="w-5 h-5 text-red-600" aria-hidden />
    </div>
  );
}

function AdminDialogHost({
  dialog,
  onClose,
}: {
  dialog: DialogState | null;
  onClose: (result: boolean) => void;
}) {
  if (!dialog) return null;

  const isConfirm = dialog.kind === "confirm";
  const options = dialog.state;
  const iconVariant = isConfirm
    ? options.variant === "primary"
      ? "primary"
      : "danger"
    : options.variant ?? "error";

  const title = options.title ?? (isConfirm ? "Confirm deletion" : "Notice");
  const confirmLabel = isConfirm
    ? (options as ConfirmState).confirmLabel ?? "Delete"
    : (options as AlertState).confirmLabel ?? "OK";

  return (
    <div
      className={ADMIN_DIALOG_OVERLAY}
      onClick={() => onClose(false)}
      role="presentation"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="admin-dialog-title"
        aria-describedby="admin-dialog-message"
        className={ADMIN_DIALOG_PANEL}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-6 pb-4 gap-3">
          <div className="flex gap-4 min-w-0">
            <DialogIcon variant={iconVariant} />
            <div className="min-w-0 pt-0.5">
              <h2 id="admin-dialog-title" className="text-base font-semibold text-brand-navy">
                {title}
              </h2>
              <p
                id="admin-dialog-message"
                className="mt-2 text-sm text-brand-silver leading-relaxed whitespace-pre-wrap break-words"
              >
                {options.message}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onClose(false)}
            className="shrink-0 text-brand-silver hover:text-brand-dark p-1 -mt-1 -mr-1"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-3 px-6 py-4 bg-brand-gray/30 border-t border-gray-100 justify-end">
          {isConfirm && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onClose(false)}>
              {(options as ConfirmState).cancelLabel ?? "Cancel"}
            </Button>
          )}
          <Button
            type="button"
            variant={isConfirm && (options as ConfirmState).variant !== "primary" ? "danger" : "primary"}
            size="sm"
            onClick={() => onClose(true)}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AdminDialogProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const dialogRef = useRef<DialogState | null>(null);

  const close = useCallback((confirmed: boolean) => {
    const current = dialogRef.current;
    if (!current) return;

    if (current.kind === "confirm") {
      current.state.resolve(confirmed);
    } else if (confirmed) {
      current.state.resolve();
    }

    dialogRef.current = null;
    setDialog(null);
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      const next: DialogState = {
        kind: "confirm",
        state: { ...options, resolve },
      };
      dialogRef.current = next;
      setDialog(next);
    });
  }, []);

  const showAlert = useCallback((options: AlertOptions) => {
    return new Promise<void>((resolve) => {
      const next: DialogState = {
        kind: "alert",
        state: { ...options, resolve },
      };
      dialogRef.current = next;
      setDialog(next);
    });
  }, []);

  useEffect(() => {
    if (!dialog) return;

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
  }, [dialog, close]);

  return (
    <AdminDialogContext.Provider value={{ confirm, showAlert }}>
      {children}
      <AdminDialogHost dialog={dialog} onClose={close} />
    </AdminDialogContext.Provider>
  );
}

export function useAdminDialog() {
  const ctx = useContext(AdminDialogContext);
  if (!ctx) {
    throw new Error("useAdminDialog must be used within AdminDialogProvider");
  }
  return ctx;
}

export function useConfirmDialog() {
  return useAdminDialog();
}
