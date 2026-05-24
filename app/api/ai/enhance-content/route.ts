import { logger } from '@/lib/logger';
import { NextRequest } from 'next/server';
const { NextResponse } = require('next/server');
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in.' },
        { status: 401 }
      );
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError) {
      const isUpstreamFailure =
        (authError.status !== undefined && authError.status >= 500) ||
        /timeout|ECONNREFUSED|ECONNRESET|network/i.test(authError.message ?? '');

      if (isUpstreamFailure) {
        return NextResponse.json(
          { error: 'Authentication service unavailable. Please try again later.' },
          { status: 503 }
        );
      }

      return NextResponse.json(
        { error: 'Authentication required. Please sign in.' },
        { status: 401 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { prompt, documentType, canvasData, context } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Build context-aware prompt
    const systemPrompt = `You are an expert design and content enhancement assistant. You help users improve their ${documentType} documents.

Current document context:
- Document type: ${documentType}
- Number of elements: ${context?.objectCount || 0}
- Has text: ${context?.hasText ? 'Yes' : 'No'}
- Has images: ${context?.hasImages ? 'Yes' : 'No'}

Provide specific, actionable suggestions based on the user's request. If they ask for:
- Text improvements: Suggest better wording, structure, and formatting
- Color schemes: Provide hex color codes with explanations
- Layout suggestions: Give specific positioning and spacing advice
- Design elements: Suggest what to add and where

Keep responses concise, practical, and easy to implement. Use bullet points for clarity.`;

    const fullPrompt = `${systemPrompt}\n\nUser request: ${prompt}`;

    // Generate AI response
    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();

    // Parse response for actionable enhancements
    const enhancements = parseEnhancements(text, prompt);

    return NextResponse.json({
      response: text,
      enhancements,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    logger.error({ route: 'app/api/ai/enhance-content/route.ts' }, 'Error in AI enhancement:', error);
    return NextResponse.json(
      { error: 'Failed to enhance content. Please try again.' },
      { status: 500 }
    );
  }
}

function parseEnhancements(text: string, prompt: string): any {
  const enhancements: any = {};
  const lower = prompt.toLowerCase();

  // Extract color codes if mentioned
  const colorRegex = /#[0-9A-Fa-f]{6}/g;
  const colors = text.match(colorRegex);
  if (colors && colors.length > 0) {
    enhancements.colors = {
      primary: colors[0],
      secondary: colors[1] || colors[0],
      accent: colors[2] || colors[0]
    };
  }

  // Extract text suggestions
  if (lower.includes('text') || lower.includes('content')) {
    enhancements.textSuggestions = extractBulletPoints(text);
  }

  // Extract layout suggestions
  if (lower.includes('layout') || lower.includes('position')) {
    enhancements.layoutSuggestions = extractBulletPoints(text);
  }

  return Object.keys(enhancements).length > 0 ? enhancements : null;
}

function extractBulletPoints(text: string): string[] {
  const lines = text.split('\n');
  const bulletPoints: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
      bulletPoints.push(trimmed.substring(1).trim());
    }
  }

  return bulletPoints;
}
