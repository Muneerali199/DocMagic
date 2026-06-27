import { NextRequest, NextResponse } from "next/server";
import { generateAlternativeImages } from "@/lib/mistral";

export async function POST(req: NextRequest) {
  try {
    const { slideTitle, slideContent, count } = await req.json();

    if (!slideTitle || !slideContent) {
      return NextResponse.json(
        { error: "slideTitle and slideContent are required" },
        { status: 400 }
      );
    }

    const safeCount = Math.min(Math.max(Number.isInteger(count) ? count : 5, 1), 10);

    const images = await generateAlternativeImages(slideTitle, slideContent, safeCount);
    return NextResponse.json({ images });
  } catch (error) {
    console.error("[generate-alternative-images] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate image suggestions" },
      { status: 500 }
    );
  }
}
