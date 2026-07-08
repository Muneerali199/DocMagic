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

export const BRAIN_MODEL =
  process.env.PRESENTATION_BRAIN_MODEL ?? "zai-org/GLM-5.2";

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
