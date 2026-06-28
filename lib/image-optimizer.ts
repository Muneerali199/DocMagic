import sharp from "sharp";

export const IMAGE_VARIANTS = {
  thumbnail: { width: 150, quality: 72 },
  medium: { width: 640, quality: 78 },
  large: { width: 1200, quality: 82 },
} as const;

export type ImageVariantName = keyof typeof IMAGE_VARIANTS;
export type ImageFormat = "webp" | "avif" | "jpeg";

export interface OptimizedImageVariant {
  name: ImageVariantName;
  width: number;
  format: ImageFormat;
  path: string;
  buffer: Buffer;
  contentType: string;
}

export interface OptimizeImageOptions {
  basePath: string;
  formats?: ImageFormat[];
}

const CONTENT_TYPES: Record<ImageFormat, string> = {
  webp: "image/webp",
  avif: "image/avif",
  jpeg: "image/jpeg",
};

export function buildOptimizedImagePath(
  basePath: string,
  variant: ImageVariantName,
  format: ImageFormat,
) {
  const cleanPath = basePath.replace(/\.[a-z0-9]+$/i, "").replace(/^\/+/, "");
  return `${cleanPath}/${variant}.${format}`;
}

async function encodeImage(
  image: sharp.Sharp,
  format: ImageFormat,
  quality: number,
) {
  if (format === "avif") return image.avif({ quality }).toBuffer();
  if (format === "jpeg")
    return image.jpeg({ quality, mozjpeg: true }).toBuffer();
  return image.webp({ quality }).toBuffer();
}

export async function createResponsiveImageVariants(
  input: Buffer | ArrayBuffer | Uint8Array,
  options: OptimizeImageOptions,
): Promise<OptimizedImageVariant[]> {
  const formats = options.formats || ["webp", "avif", "jpeg"];
  const source = sharp(input, { failOn: "none" }).rotate();
  const metadata = await source.metadata();
  const sourceWidth = metadata.autoOrient?.width || metadata.width;
  const variants: OptimizedImageVariant[] = [];

  for (const [name, config] of Object.entries(IMAGE_VARIANTS) as Array<
    [ImageVariantName, (typeof IMAGE_VARIANTS)[ImageVariantName]]
  >) {
    const targetWidth = Math.min(config.width, sourceWidth || config.width);

    for (const format of formats) {
      const resized = source.clone().resize({
        width: targetWidth,
        withoutEnlargement: true,
      });

      variants.push({
        name,
        width: targetWidth,
        format,
        path: buildOptimizedImagePath(options.basePath, name, format),
        buffer: await encodeImage(resized, format, config.quality),
        contentType: CONTENT_TYPES[format],
      });
    }
  }

  return variants;
}

export function getImageCacheControl() {
  return "public, max-age=31536000, immutable";
}
