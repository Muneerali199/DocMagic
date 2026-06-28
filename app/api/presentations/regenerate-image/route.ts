import { logger } from "@/lib/logger";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { regenerateSlideImage } from "@/lib/flux-image-generator";
import { createRoute } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const supabase = await createRoute();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    let body: Record<string, unknown>;
try {
  body = (await request.json()) as Record<string, unknown>;
} catch {
  return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
}
    const { prompt, size = "1024x576", imageType } = body;

    const allowedSizes = ["1024x1024", "1024x768", "1024x576"] as const;
    const allowedImageTypes = [
      "illustration",
      "diagram",
      "wireframe",
      "mockup",
      "logo",
      "icon",
      "chart",
      "photo",
      "abstract",
      "infographic",
      "technology",
    ] as const;

    if (typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json({ error: "Missing or invalid prompt" }, { status: 400 });
    }

    if (
      typeof size !== "string" ||
      !allowedSizes.includes(size as (typeof allowedSizes)[number])
    ) {
      return NextResponse.json({ error: "Invalid size" }, { status: 400 });
    }

    if (
      imageType !== undefined &&
      (typeof imageType !== "string" ||
        !allowedImageTypes.includes(imageType as (typeof allowedImageTypes)[number]))
    ) {
      return NextResponse.json({ error: "Invalid imageType" }, { status: 400 });
    }

    const safePrompt = prompt.trim();
    const safeSize = size as (typeof allowedSizes)[number];
    const safeImageType = imageType as (typeof allowedImageTypes)[number] | undefined;

    // Generate new image with FLUX, applying the selected style preset
    const imageUrl = await regenerateSlideImage(safePrompt, safeSize, safeImageType);

    return NextResponse.json({
      imageUrl,
      success: true,
    });
  } catch (error) {
    logger.error(
      { route: "app/api/presentations/regenerate-image/route.ts" },
      "Error regenerating image:",
      error,
    );
    return NextResponse.json(
      { error: "Failed to regenerate image" },
      { status: 500 },
    );
  }
}
