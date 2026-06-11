"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold text-brand-navy mb-2">Something went wrong</h1>
        <p className="text-brand-silver text-sm mb-6">{error.message || "An unexpected error occurred."}</p>
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
