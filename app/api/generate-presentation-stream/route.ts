import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { createEnhancedPresentationPrompt } from "@/lib/prompts/enhanced-presentation-prompt";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required. Please sign in." },
        { status: 401 },
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required. Please sign in." },
        { status: 401 },
      );
    }

    const { topic, audience, outline, settings } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const prompt = createEnhancedPresentationPrompt(
      topic,
      audience,
      outline,
      settings,
    );

    // Create a ReadableStream that streams SSE chunks to the client
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            stream: true,
            max_tokens: 4000,
          });

          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content ?? "";
            if (content) {
              // SSE format: "data: {json}\n\n"
              const sseData = JSON.stringify({ content });
              controller.enqueue(encoder.encode(`data: ${sseData}\n\n`));
            }
          }

          // Signal completion to the client
          const doneData = JSON.stringify({ done: true });
          controller.enqueue(encoder.encode(`data: ${doneData}\n\n`));
        } catch (streamError) {
          logger.error(
            { route: "generate-presentation-stream" },
            "❌ Stream error:",
            streamError,
          );
          const errorData = JSON.stringify({
            error: "Stream generation failed",
          });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    logger.error(
      { route: "app/api/generate-presentation-stream/route.ts" },
      "❌ API error:",
      error,
    );
    return NextResponse.json(
      { error: "Failed to generate presentation" },
      { status: 500 },
    );
  }
}
