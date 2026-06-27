/**
 * @jest-environment node
 */

import {
  buildOptimizedImagePath,
  createResponsiveImageVariants,
  getImageCacheControl,
  IMAGE_VARIANTS,
} from "../image-optimizer";
import sharp from "sharp";

describe("image optimizer helpers", () => {
  it("builds predictable variant paths", () => {
    expect(
      buildOptimizedImagePath("uploads/user/avatar.png", "medium", "webp"),
    ).toBe("uploads/user/avatar/medium.webp");
  });

  it("returns immutable cache headers for optimized variants", () => {
    expect(getImageCacheControl()).toContain("max-age=31536000");
    expect(getImageCacheControl()).toContain("immutable");
  });

  it("creates one variant for every size and requested format", async () => {
    const input = await sharp({
      create: {
        width: 1600,
        height: 900,
        channels: 3,
        background: "#1d4ed8",
      },
    })
      .png()
      .toBuffer();

    const variants = await createResponsiveImageVariants(input, {
      basePath: "uploads/hero.png",
      formats: ["webp", "jpeg"],
    });

    expect(variants).toHaveLength(Object.keys(IMAGE_VARIANTS).length * 2);
    expect(variants.map((variant) => variant.format)).toEqual([
      "webp",
      "jpeg",
      "webp",
      "jpeg",
      "webp",
      "jpeg",
    ]);
  });

  it("does not upscale variants beyond the source width", async () => {
    const input = await sharp({
      create: {
        width: 320,
        height: 240,
        channels: 3,
        background: "#0f172a",
      },
    })
      .png()
      .toBuffer();

    const variants = await createResponsiveImageVariants(input, {
      basePath: "uploads/small.png",
      formats: ["webp"],
    });

    expect(variants.every((variant) => variant.width <= 320)).toBe(true);
  });

  it("uses auto-oriented dimensions when capping variant widths", async () => {
    const input = await sharp({
      create: {
        width: 80,
        height: 160,
        channels: 3,
        background: "#2563eb",
      },
    })
      .jpeg()
      .withMetadata({ orientation: 6 })
      .toBuffer();

    const variants = await createResponsiveImageVariants(input, {
      basePath: "uploads/rotated.jpg",
      formats: ["jpeg"],
    });

    expect(variants[0].width).toBe(150);
    const metadata = await sharp(variants[0].buffer).metadata();
    expect(metadata.width).toBe(150);
  });
});
