/**
 * LLM client for the Strategist + Narrative Planner.
 *
 * Nebius (OpenAI-compatible) with GLM as the reasoning model. Model is
 * env-configurable via PRESENTATION_BRAIN_MODEL so it can be swapped
 * without code changes. JSON-mode output validated against Zod schemas
 * with one retry that feeds validation errors back to the model.
 *
 * Server-only module.
 */

import OpenAI from "openai";
import type { z } from "zod";

const NEBIUS_BASE_URL =
  process.env.NEBIUS_BASE_URL ?? "https://api.studio.nebius.com/v1/";

/**
 * Reasoning model for Strategist / Planner / Design Director.
 * Qwen3.5-397B — ~1s latency on Nebius (measured) with thinking disabled.
 * Override with PRESENTATION_BRAIN_MODEL to swap without code changes.
 */
export const BRAIN_MODEL =
  process.env.PRESENTATION_BRAIN_MODEL ?? "Qwen/Qwen3.5-397B-A17B";

/**
 * Vision model for the Design Critic — reviews rendered slide images.
 * Kimi K2.6 accepts image_url content on Nebius (verified).
 * Override with PRESENTATION_CRITIC_MODEL.
 */
export const VISION_MODEL =
  process.env.PRESENTATION_CRITIC_MODEL ?? "moonshotai/Kimi-K2.6";

let client: OpenAI | null = null;

export function getBrainClient(): OpenAI {
  if (!process.env.NEBIUS_API_KEY) {
    throw new Error("NEBIUS_API_KEY is not configured.");
  }
  if (!client) {
    client = new OpenAI({
      baseURL: NEBIUS_BASE_URL,
      apiKey: process.env.NEBIUS_API_KEY,
    });
  }
  return client;
}

/** Strip markdown fences / reasoning preamble and extract the JSON object. */
export function extractJson(raw: string): string {
  let text = raw.trim();
  // remove <think>...</think> blocks some reasoning models emit
  text = text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) text = fence[1].trim();
  // find first { ... last }
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end > start) text = text.slice(start, end + 1);
  return text;
}

export interface StructuredCallOptions {
  system: string;
  user: string;
  temperature?: number;
  maxTokens?: number;
  /**
   * Reasoning models like GLM emit long hidden thinking chains before the
   * answer, multiplying latency 5-10x. We disable thinking by default —
   * the pipeline needs structured classification, not deep reasoning.
   * Set to true only for calls that genuinely benefit from it.
   */
  enableThinking?: boolean;
}

/**
 * Call the brain model expecting JSON that validates against `schema`.
 * On validation failure, retries once with the error report appended.
 */
export async function structuredCall<T>(
  schema: z.ZodType<T>,
  options: StructuredCallOptions,
): Promise<T> {
  const openai = getBrainClient();
  let lastError = "";

  for (let attempt = 0; attempt < 2; attempt++) {
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: "system", content: options.system },
      {
        role: "user",
        content:
          attempt === 0
            ? options.user
            : `${options.user}\n\nYour previous response failed validation:\n${lastError}\n\nReturn corrected JSON only.`,
      },
    ];

    const completion = await openai.chat.completions.create({
      model: BRAIN_MODEL,
      messages,
      temperature: options.temperature ?? 0.4,
      max_tokens: options.maxTokens ?? 8000,
      response_format: { type: "json_object" },
      // vLLM-style flag Nebius supports for hybrid reasoning models
      // (GLM, Qwen3). Unknown params are ignored by other backends.
      // @ts-expect-error -- non-standard OpenAI param, passed through to Nebius
      chat_template_kwargs: {
        enable_thinking: options.enableThinking ?? false,
      },
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    try {
      const parsed = JSON.parse(extractJson(raw));
      const result = schema.safeParse(parsed);
      if (result.success) return result.data;
      lastError = result.error.issues
        .slice(0, 12)
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("\n");
    } catch (err) {
      lastError = `Invalid JSON: ${err instanceof Error ? err.message : "parse error"}`;
    }
  }

  throw new Error(
    `Brain model output failed schema validation after retry: ${lastError}`,
  );
}

export interface VisionCallOptions {
  system: string;
  user: string;
  /** PNG buffers rendered from slides; sent as base64 data URLs */
  images: Buffer[];
  temperature?: number;
  maxTokens?: number;
}

/**
 * Call the vision critic model with rendered slide images, expecting JSON
 * that validates against `schema`. One retry with the validation report.
 */
export async function visionCall<T>(
  schema: z.ZodType<T>,
  options: VisionCallOptions,
): Promise<T> {
  const openai = getBrainClient();
  let lastError = "";

  const imageParts = options.images.map((buf) => ({
    type: "image_url" as const,
    image_url: { url: `data:image/png;base64,${buf.toString("base64")}` },
  }));

  for (let attempt = 0; attempt < 2; attempt++) {
    const userText =
      attempt === 0
        ? options.user
        : `${options.user}\n\nYour previous response failed validation:\n${lastError}\n\nReturn corrected JSON only.`;

    const completion = await openai.chat.completions.create({
      model: VISION_MODEL,
      messages: [
        { role: "system", content: options.system },
        {
          role: "user",
          content: [{ type: "text", text: userText }, ...imageParts],
        },
      ],
      temperature: options.temperature ?? 0.2,
      max_tokens: options.maxTokens ?? 3000,
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    try {
      const parsed = JSON.parse(extractJson(raw));
      const result = schema.safeParse(parsed);
      if (result.success) return result.data;
      lastError = result.error.issues
        .slice(0, 12)
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("\n");
    } catch (err) {
      lastError = `Invalid JSON: ${err instanceof Error ? err.message : "parse error"}`;
    }
  }

  throw new Error(
    `Vision critic output failed schema validation after retry: ${lastError}`,
  );
}
