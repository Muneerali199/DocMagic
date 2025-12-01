export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { generatePresentationOutline } from '@/lib/gemini';
import { 
  generatePresentationText, 
  generateChartData 
} from '@/lib/mistral';


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, pageCount = 8, useGemini = true, outlineOnly = false } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Missing prompt' },
        { status: 400 }
      );
    }

    console.log('📝 Step 1: Generating slide text content...');
    
    // Step 1: Generate text content (choice between Gemini or Mistral)
    let outlines;
    if (useGemini) {
      console.log('Using Gemini 2.0 Flash for text generation');
      outlines = await generatePresentationOutline({ prompt, pageCount });
    } else {
      console.log('Using Mistral Large for text generation');
      outlines = await generatePresentationText(prompt, pageCount);
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