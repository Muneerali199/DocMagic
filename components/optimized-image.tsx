"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useMemo, useState, type SyntheticEvent } from "react";

export interface OptimizedImageSource {
  url?: string;
  path?: string;
  width: number;
  format?: "webp" | "avif" | "jpeg";
}

interface OptimizedImageProps extends Omit<ImageProps, "src" | "alt"> {
  src: string;
  alt: string;
  variants?: OptimizedImageSource[];
  fallbackSrc?: string;
}

function getVariantUrl(variant: OptimizedImageSource) {
  return variant.url || variant.path;
}

function buildSrcSet(variants: OptimizedImageSource[] = []) {
  return [...variants]
    .sort((a, b) => a.width - b.width)
    .map((variant) => {
      const url = getVariantUrl(variant);
      return url ? `${url} ${variant.width}w` : "";
    })
    .filter(Boolean)
    .join(", ");
}

export function OptimizedImage({
  src,
  alt,
  variants = [],
  fallbackSrc,
  sizes = "(max-width: 768px) 100vw, 50vw",
  loading = "lazy",
  onError,
  className,
  style,
  width,
  height,
  ...props
}: OptimizedImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const srcSet = useMemo(() => buildSrcSet(variants), [variants]);
  const shouldUseVariants = Boolean(srcSet) && currentSrc !== fallbackSrc;

  useEffect(() => {
    setCurrentSrc(src);
  }, [src]);

  const handleError = (event: SyntheticEvent<HTMLImageElement, Event>) => {
    onError?.(event);
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    }
  };

  if (shouldUseVariants) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- custom storage srcSet variants are pre-generated and must be forwarded directly.
      <img
        src={currentSrc}
        srcSet={srcSet}
        sizes={typeof sizes === "string" ? sizes : undefined}
        alt={alt}
        loading={loading}
        className={className}
        style={style}
        width={typeof width === "number" ? width : undefined}
        height={typeof height === "number" ? height : undefined}
        onError={handleError}
      />
    );
  }

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      sizes={sizes}
      loading={loading}
      className={className}
      style={style}
      width={width}
      height={height}
      onError={handleError}
    />
  );
}
