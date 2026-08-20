import Link from "next/link";
import { DentiumLogo } from "@/components/brand/DentiumLogo";
import { cn } from "@/lib/utils";

export const authInputClass =
  "w-full px-4 py-3 border border-brand-muted bg-white text-sm text-brand-dark placeholder:text-brand-silver/80 transition-colors duration-200 focus:outline-none focus:border-brand-navy/40 focus:ring-2 focus:ring-brand-accent/25";

export const authButtonClass =
  "w-full rounded-sm font-semibold tracking-tight";

type AuthShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: "md" | "lg";
};

export function AuthShell({ title, subtitle, children, maxWidth = "md" }: AuthShellProps) {
  return (
    <section className="min-h-screen pt-28 pb-16 px-4 bg-brand-gray">
      <div className={cn("mx-auto", maxWidth === "lg" ? "max-w-lg" : "max-w-md")}>
        <div className="flex justify-center mb-8">
          <DentiumLogo href="/" size="md" />
        </div>

        <div className="surface-panel p-8 md:p-10">
          <div className="mb-8 pb-6 border-b border-brand-muted">
            <p className="section-eyebrow !mb-2">Dentium India</p>
            <h1 className="text-2xl font-semibold text-brand-navy tracking-tight font-display">{title}</h1>
            {subtitle && <p className="text-brand-silver text-sm mt-2 leading-relaxed">{subtitle}</p>}
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}

export function AuthError({ message }: { message: string }) {
  return (
    <div className="bg-red-50 text-red-700 text-sm p-3.5 border border-red-200 mb-5">{message}</div>
  );
}

export function AuthFooterLink({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-center text-sm text-brand-silver mt-8 pt-6 border-t border-brand-muted leading-relaxed">
      {children}
    </p>
  );
}

export function AuthLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-brand-deep font-medium hover:text-brand-navy transition-colors">
      {children}
    </Link>
  );
}
