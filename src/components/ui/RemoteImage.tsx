import Image, { ImageProps } from "next/image";
import { cn } from "@/lib/utils";

export function isLocalImageSrc(src: string): boolean {
  if (!src) return false;
  if (src.startsWith("data:") || src.startsWith("//")) return false;
  return src.startsWith("/");
}

type RemoteImageProps = Omit<ImageProps, "src"> & {
  src: string;
};

export function RemoteImage({
  src,
  alt,
  fill,
  className,
  sizes,
  priority,
  width,
  height,
  ...rest
}: RemoteImageProps) {
  const safeAlt = alt ?? "";

  if (!isLocalImageSrc(src)) {
    if (fill) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={safeAlt}
          className={cn("absolute inset-0 h-full w-full", className)}
          loading={priority ? "eager" : "lazy"}
        />
      );
    }

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={safeAlt}
        width={typeof width === "number" ? width : undefined}
        height={typeof height === "number" ? height : undefined}
        className={className}
        loading={priority ? "eager" : "lazy"}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={safeAlt}
      fill={fill}
      className={className}
      sizes={sizes}
      priority={priority}
      width={width}
      height={height}
      {...rest}
    />
  );
}
