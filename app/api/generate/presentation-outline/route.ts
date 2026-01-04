export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { 
  generatePresentationText, 
  generateChartData 
} from '@/lib/mistral';
import OpenAI from 'openai';

// Fallback to Nebius/Qwen when Gemini fails
const nebiusClient = new OpenAI({
  baseURL: 'https://api.tokenfactory.nebius.com/v1/',
  apiKey: process.env.NEBIUS_API_KEY,
});

async function generateWithNebius(prompt: string, pageCount: number) {
  console.log('🔄 Using Nebius/Qwen as fallback...');
  
  const completion = await nebiusClient.chat.completions.create({
    model: 'Qwen/Qwen3-235B-A22B-Instruct-2507',
    messages: [
      {
        role: 'system',
        content: `You are a professional presentation designer. Generate exactly ${pageCount} slides for a presentation.
Return a JSON array of slides with this structure:
[
  {
    "slideNumber": 1,
    "type": "title",
    "title": "Main Title",
    "subtitle": "Subtitle text",
    "content": "Brief description",
    "bulletPoints": ["Point 1", "Point 2", "Point 3"]
  }
]
Slide types: title, content, bullets, stats, comparison, timeline, conclusion
Make content professional, engaging, and visually focused.`
      },
      {
        role: 'user',
        content: `Create a ${pageCount}-slide presentation about: ${prompt}`
      }
    ],
    max_tokens: 4000,
    temperature: 0.7,
  });

  const content = completion.choices[0]?.message?.content || '[]';
  
  // Extract JSON from response
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error('Failed to parse Nebius response:', e);
    }
  }
  
  // Fallback: create basic slides
  return Array.from({ length: pageCount }, (_, i) => ({
    slideNumber: i + 1,
    type: i === 0 ? 'title' : i === pageCount - 1 ? 'conclusion' : 'content',
    title: i === 0 ? prompt : `Slide ${i + 1}`,
    content: 'Content for this slide',
    bulletPoints: ['Key point 1', 'Key point 2', 'Key point 3']
  }));
}


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, pageCount = 8, outlineOnly = false } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Missing prompt' },
        { status: 400 }
      );
    }

    console.log('📝 Step 1: Generating slide text content...');
    
    // Step 1: Generate text content - Use Mistral first, then Nebius fallback
    let outlines;
    try {
      console.log('Using Mistral Large for text generation');
      outlines = await generatePresentationText(prompt, pageCount);
      console.log('✅ Generated with Mistral');
    } catch (mistralError: any) {
      console.error('⚠️ Mistral failed:', mistralError.message);
      console.log('🔄 Falling back to Nebius/Qwen...');
      outlines = await generateWithNebius(prompt, pageCount);
    }
    
    console.log(`✅ Generated ${outlines.length} slides`);

    // If outlineOnly is requested, return here without generating images/charts
    if (outlineOnly) {
      console.log('🚀 Returning outline only as requested');
      return NextResponse.json({ 
        outlines: outlines,
        stats: {
          totalSlides: outlines.length,
          withImages: 0,
          withCharts: 0,
        }
      });
    }

    console.log('🎨 Step 2: Generating images with FLUX AI...');
    
    // Step 2: Generate images with FLUX (skip Mistral)
    const { generatePresentationImages } = await import('@/lib/flux-image-generator');
    const { getEnhancedImagePrompt } = await import('@/lib/presentation-styles');
    
    // Create enhanced image prompts from slide content
    const imagePrompts = outlines.map((outline: any) => {
      const slideType = outline.type || 'content';
      const title = outline.title || '';
      const content = outline.content || outline.bulletPoints?.join(', ') || '';
      
      // Create detailed, contextual prompt for stunning images
      let basePrompt = '';
      
      if (slideType === 'title' || slideType === 'cover') {
        basePrompt = `Stunning hero image for presentation titled "${title}", ${prompt}, inspiring and professional`;
      } else if (slideType === 'conclusion' || slideType === 'summary') {
        basePrompt = `Inspiring conclusion image for "${title}", uplifting and motivational, ${prompt}`;
      } else {
        basePrompt = `Professional visual representation of "${title}", ${content.substring(0, 80)}, ${prompt}`;
      }
      
      // Enhance with style-specific keywords
      return getEnhancedImagePrompt(basePrompt, 'modern');
    });
    
    // Generate all images with FLUX (using 512x512 - smaller, faster)
    const imageUrls = await generatePresentationImages(imagePrompts, "512x512");
    
    console.log(`✅ Generated ${imageUrls.length} images with FLUX`);
    console.log('📊 Step 3: Generating chart data with Mistral AI...');
    
    // Step 3: Generate chart data with Mistral AI (keep this for now)
    let chartDataList = [];
    try {
      chartDataList = await generateChartData(outlines, prompt);
      console.log(`✅ Generated ${chartDataList.length} charts`);
    } catch (error) {
      console.error('Error generating charts:', error);
      console.log('⚠️ Skipping chart generation due to rate limit');
    }
    
    console.log('✨ Step 4: Combining slides with images and charts...');
    
    // Step 4: Combine everything
    const enhancedOutlines = outlines.map((outline: any, index: number) => {
      const chartData = chartDataList.find((chart: any) => chart.slideNumber === index + 1);
      
      return {
        ...outline,
        image: imageUrls[index] || `https://placehold.co/512x512/EEE/31343C?text=Slide+${index + 1}`,
        imageQuery: imagePrompts[index],
        imageDescription: `AI-generated image for ${outline.title}`,
        imageUrl: imageUrls[index] || `https://placehold.co/512x512/EEE/31343C?text=Slide+${index + 1}`,
        chartData: chartData || null,
        bullets: outline.bulletPoints || outline.bullets || [],
      };
    });
    
    console.log('✨ Step 5: Presentation enhancement complete!');
    console.log(`📊 Final stats: ${enhancedOutlines.length} slides, ${imageUrls.length} FLUX images, ${chartDataList.length} charts`);
    
    return NextResponse.json({ 
      outlines: enhancedOutlines,
      stats: {
        totalSlides: enhancedOutlines.length,
        withImages: enhancedOutlines.filter((o: any) => o.imageUrl).length,
        withCharts: enhancedOutlines.filter((o: any) => o.chartData).length,
      }
    });
  } catch (error) {
    console.error('Error generating presentation outline:', error);
    return NextResponse.json(
      { error: 'Failed to generate presentation outline', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}