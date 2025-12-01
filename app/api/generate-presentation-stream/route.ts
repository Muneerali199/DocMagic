import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createPresentationPrompt } from '@/lib/prompts/presentation-prompt';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const openai = new OpenAI({
  baseURL: 'https://api.tokenfactory.nebius.com/v1/',
  apiKey: process.env.NEBIUS_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { topic, audience, outline, settings } = await req.json();

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    console.log(`🎨 Generating presentation: "${topic}" for ${audience}`);

    // Create the prompt
    const prompt = createPresentationPrompt(
      topic,
      audience || 'business professionals',
      outline,
      settings
    );

    // Create a TransformStream for streaming
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Start streaming in the background
    (async () => {
      try {
        console.log('📡 Starting Qwen3-235B stream...');

        const completion = await openai.chat.completions.create({
          model: 'Qwen/Qwen3-235B-A22B-Instruct-2507',
          messages: [
            {
              role: 'system',
              content: 'You are an expert presentation designer. Always return valid JSON.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 8000,
          temperature: 0.7,
          stream: true,
        });

        let fullContent = '';

        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content || '';

          if (content) {
            fullContent += content;

            // Send chunk to client
            await writer.write(
              encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
            );
          }
        }

        console.log('✅ Qwen3-235B stream complete');
        console.log(`📊 Generated ${fullContent.length} characters`);

        // Send completion signal
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`)
        );
      } catch (error) {
        console.error('❌ Stream error:', error);
        await writer.write(
          encoder.encode(
            `data: ${JSON.stringify({ error: 'Stream failed' })}\n\n`
          )
        );
      } finally {
        await writer.close();
      }
    })();

    // Return the readable stream
    return new NextResponse(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('❌ API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate presentation' },
      { status: 500 }
    );
  }
}
