"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold text-brand-navy mb-2">Admin Error</h1>
        <p className="text-brand-silver text-sm mb-6">{error.message || "Something went wrong in the admin panel."}</p>
        <button
          type="button"
          onClick={reset}
          className="px-6 py-2.5 bg-brand-accent text-brand-navy rounded-sm font-medium hover:bg-brand-accent-dark transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
