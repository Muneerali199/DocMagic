import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createEnhancedPresentationPrompt } from '@/lib/prompts/enhanced-presentation-prompt';

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

    console.log(`🎨 Generating ENHANCED presentation: "${topic}" for ${audience}`);

    // Create the ENHANCED prompt for 10x better presentations
    const prompt = createEnhancedPresentationPrompt(
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
        console.log('📡 Starting Qwen3-235B stream with ENHANCED prompt...');

        const completion = await openai.chat.completions.create({
          model: 'Qwen/Qwen3-235B-A22B-Instruct-2507',
          messages: [
            {
              role: 'system',
              content: `You are an elite presentation designer who creates presentations 10X BETTER than Gamma.
Your presentations feature:
- Professional mockups (phone, laptop, dashboard views)
- Rich data visualizations with realistic numbers
- Before/After comparisons
- Timeline/Roadmap views
- Stats grids with impressive metrics
- Feature grids with icons
- Testimonials with social proof
- Logo clouds for credibility

Always return valid TOON format starting with ---SLIDE---
Never include explanatory text, just the slide content.`,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 12000,
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

        console.log('✅ ENHANCED stream complete');
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
