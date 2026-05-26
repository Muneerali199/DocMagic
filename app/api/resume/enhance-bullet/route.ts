import { NextResponse } from 'next/server';

import {
  buildBulletEnhancementPrompt,
  cleanEnhancedBullet,
  validateBulletInput,
} from '@/lib/resume/bullet-enhancer';

const AI_REQUEST_TIMEOUT_MS = 12_000;

class BadRequestError extends Error {}

function optionalString(value: unknown, field: string): string | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (typeof value !== 'string') {
    throw new BadRequestError(`${field} must be a string`);
  }
  return value;
}

async function enhanceWithGemini(prompt: string, apiKey: string): Promise<string> {
  const signal = AbortSignal.timeout(AI_REQUEST_TIMEOUT_MS);
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.35,
          topP: 0.9,
          maxOutputTokens: 140,
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error('Gemini bullet enhancement failed');
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function enhanceWithOpenAI(prompt: string, apiKey: string): Promise<string> {
  const signal = AbortSignal.timeout(AI_REQUEST_TIMEOUT_MS);
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You improve exactly one resume bullet and return only the improved bullet.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.35,
      max_tokens: 140,
    }),
  });

  if (!response.ok) {
    throw new Error('OpenAI bullet enhancement failed');
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const bullet = validateBulletInput(body?.bullet);
    const title = optionalString(body?.title, 'title');
    const company = optionalString(body?.company, 'company');
    const skills = optionalString(body?.skills, 'skills');
    const prompt = buildBulletEnhancementPrompt({
      bullet,
      title,
      company,
      skills,
    });

    const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (!geminiApiKey && !openaiApiKey) {
      return NextResponse.json(
        { error: 'AI API key is not configured' },
        { status: 500 },
      );
    }

    const rawEnhancement = geminiApiKey
      ? await enhanceWithGemini(prompt, geminiApiKey)
      : await enhanceWithOpenAI(prompt, openaiApiKey!);

    const enhancedBullet = cleanEnhancedBullet(rawEnhancement);
    if (!enhancedBullet) {
      return NextResponse.json(
        { error: 'AI did not return an enhanced bullet' },
        { status: 502 },
      );
    }

    return NextResponse.json({ enhancedBullet });
  } catch (error: any) {
    const message = error?.message || 'Failed to enhance bullet point';
    const status = error instanceof BadRequestError || message.includes('required') || message.includes('empty') || message.includes('600')
      ? 400
      : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
