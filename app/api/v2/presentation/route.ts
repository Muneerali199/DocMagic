/**
 * v2 presentation generation endpoint — IR compiler pipeline.
 *
 * POST { prompt, slideCount?, designLanguage?, audienceHint? }
 * Streams NDJSON events:
 *   { "type": "progress", "stage": string, "detail"?: string }
 *   { "type": "result", "resolved": ResolvedIR, "benchmark": ..., "designLanguage": ... }
 *   { "type": "error", "message": string }
 *
 * Runs alongside the legacy HTML-first pipeline (parallel v2 path).
 */

import { generatePresentation } from "@/lib/presentation/orchestrator";

export const maxDuration = 300;

interface RequestBody {
  prompt?: string;
  slideCount?: number;
  designLanguage?: string;
  audienceHint?: string;
}

export async function POST(request: Request): Promise<Response> {
  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const prompt = body.prompt?.trim();
  if (!prompt) {
    return Response.json({ error: "Missing 'prompt'" }, { status: 400 });
  }
  if (
    body.slideCount !== undefined &&
    (!Number.isInteger(body.slideCount) ||
      body.slideCount < 3 ||
      body.slideCount > 30)
  ) {
    return Response.json(
      { error: "'slideCount' must be an integer between 3 and 30" },
      { status: 400 },
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      };
      try {
        const result = await generatePresentation(prompt, {
          slideCount: body.slideCount,
          designLanguage: body.designLanguage,
          audienceHint: body.audienceHint,
          onProgress: (stage, detail) =>
            send({ type: "progress", stage, detail }),
        });
        send({
          type: "result",
          resolved: result.resolved,
          benchmark: result.benchmark,
          designLanguage: result.designLanguage,
          passesRun: result.passesRun,
        });
      } catch (error) {
        send({
          type: "error",
          message: error instanceof Error ? error.message : "Generation failed",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
