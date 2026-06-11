import Link from "next/link";
import { DentiumLogo } from "@/components/brand/DentiumLogo";
import { cn } from "@/lib/utils";

export const authInputClass =
  "w-full px-4 py-3.5 rounded-xl border border-gray-200/90 bg-white text-sm text-brand-dark placeholder:text-brand-silver/75 transition-all duration-200 focus:outline-none focus:border-brand-deep/50 focus:ring-4 focus:ring-brand-deep/10";

export const authButtonClass = "w-full rounded-xl font-semibold tracking-wide shadow-md shadow-brand-deep/15";

type AuthShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: "md" | "lg";
};

export function AuthShell({ title, subtitle, children, maxWidth = "md" }: AuthShellProps) {
  return (
    <section className="min-h-screen pt-28 pb-16 px-4 bg-gradient-to-b from-brand-light/50 via-white to-brand-gray/30">
      <div className={cn("mx-auto", maxWidth === "lg" ? "max-w-lg" : "max-w-md")}>
        <div className="flex justify-center mb-8">
          <DentiumLogo href="/" size="md" />
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-[0_12px_40px_rgba(10,22,40,0.07)] p-8 md:p-10">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-[1.65rem] font-semibold text-brand-navy tracking-tight">{title}</h1>
            {subtitle && <p className="text-brand-silver text-sm mt-2 font-normal leading-relaxed">{subtitle}</p>}
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}

export function AuthError({ message }: { message: string }) {
  return (
    <div className="bg-red-50/90 text-red-600 text-sm p-3.5 rounded-xl border border-red-100 mb-5">{message}</div>
  );
}

export function AuthFooterLink({ children }: { children: React.ReactNode }) {
  return <p className="text-center text-sm text-brand-silver mt-8 leading-relaxed">{children}</p>;
}

export function AuthLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-brand-deep font-medium hover:text-brand-blue transition-colors">
      {children}
    </Link>
  );
}
