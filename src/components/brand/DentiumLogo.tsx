import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { BRAND_LOGOS, BRAND_GREEN, SITE } from "@/lib/site-config";

export type LogoVariant = keyof typeof BRAND_LOGOS;

const sizeStyles = {
  sm: { wordmark: "h-7", primary: "h-9", onGreen: "h-8", circle: "h-9 w-9" },
  md: { wordmark: "h-8", primary: "h-10", onGreen: "h-9", circle: "h-11 w-11" },
  lg: { wordmark: "h-10", primary: "h-12", onGreen: "h-11", circle: "h-14 w-14" },
} as const;

type DentiumLogoProps = {
  href?: string;
  size?: keyof typeof sizeStyles;
  variant?: LogoVariant;
  className?: string;
  priority?: boolean;
};

function LogoWordmark({ className, light }: { className?: string; light?: boolean }) {
  const fill = light ? "#ffffff" : BRAND_GREEN;
  return (
    <svg
      viewBox="0 0 168 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={SITE.brand}
      className={cn("w-auto", className)}
    >
      <text
        x="0"
        y="28"
        fill={fill}
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="30"
        fontWeight="700"
      >
        Dentium
      </text>
    </svg>
  );
}

function LogoPrimary({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 54"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`${SITE.brand} - For Dentists By Dentists`}
      className={cn("w-auto", className)}
    >
      <text
        x="0"
        y="30"
        fill={BRAND_GREEN}
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="30"
        fontWeight="700"
      >
        Dentium
      </text>
      <text
        x="1"
        y="48"
        fill={BRAND_GREEN}
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="11"
        fontWeight="500"
        letterSpacing="0.02em"
      >
        For Dentists By Dentists
      </text>
    </svg>
  );
}

export function DentiumLogo({
  href,
  size = "md",
  variant = "primary",
  className,
  priority = false,
}: DentiumLogoProps) {
  const dimensionClass = sizeStyles[size][variant];

  let graphic: React.ReactNode;

  if (variant === "circle") {
    graphic = (
      <Image
        src={BRAND_LOGOS.circle}
        alt={SITE.brand}
        width={128}
        height={128}
        priority={priority}
        className={cn("object-contain rounded-full", dimensionClass)}
      />
    );
  } else if (variant === "primary") {
    graphic = <LogoPrimary className={dimensionClass} />;
  } else if (variant === "onGreen") {
    graphic = <LogoWordmark light className={dimensionClass} />;
  } else {
    graphic = <LogoWordmark className={dimensionClass} />;
  }

  if (href) {
    return (
      <Link
        href={href}
        className={cn("inline-flex shrink-0 items-center transition-opacity hover:opacity-90", className)}
      >
        {graphic}
      </Link>
    );
  }

  return <span className={cn("inline-flex items-center", className)}>{graphic}</span>;
}
