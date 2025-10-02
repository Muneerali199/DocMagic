export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const { NextResponse } = require('next/server');
import { generatePresentationOutline } from '@/lib/gemini';
import { 
  generatePresentationText, 
  generateImageDescriptions, 
  generateChartData 
} from '@/lib/mistral';
import { searchImages } from '@/lib/unsplash';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, pageCount = 8, useGemini = true } = body;

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
    console.log('🎨 Step 2: Generating image descriptions with Mistral AI...');
    
    // Step 2: Generate image descriptions with Mistral AI
    const imageDescriptions = await generateImageDescriptions(outlines, prompt);
    
    console.log(`✅ Generated ${imageDescriptions.length} image descriptions`);
    console.log('📊 Step 3: Generating chart data with Mistral AI...');
    
    // Step 3: Generate chart data with Mistral AI
    const chartDataList = await generateChartData(outlines, prompt);
    
    console.log(`✅ Generated ${chartDataList.length} charts`);
    console.log('🖼️ Step 4: Fetching real images from Unsplash...');
    
    // Step 4: Fetch actual images from Unsplash based on descriptions
    const enhancedOutlines = await Promise.all(
      outlines.map(async (outline: any, index: number) => {
        // Find matching image description
        const imageDesc = imageDescriptions.find(img => img.slideNumber === index + 1);
        
        // Find matching chart data
        const chartData = chartDataList.find(chart => chart.slideNumber === index + 1);
        
        // Fetch image if we have a description
        let imageUrl = '';
        if (imageDesc && imageDesc.searchQuery) {
          try {
            const images = await searchImages(imageDesc.searchQuery, 1);
            if (images && images.length > 0) {
              imageUrl = images[0].urls.regular;
            }
          } catch (error) {
            console.error(`Error fetching image for slide ${index + 1}:`, error);
          }
        }
        
        return {
          ...outline,
          imageQuery: imageDesc?.searchQuery || '',
          imageDescription: imageDesc?.description || '',
          imageUrl: imageUrl || `https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1080&fit=crop&q=80`,
          chartData: chartData || null,
          bullets: outline.bulletPoints || outline.bullets || [],
        };
      })
    );
    
    console.log('✨ Step 5: Presentation enhancement complete!');
    console.log(`📊 Final stats: ${enhancedOutlines.length} slides, ${imageDescriptions.length} images, ${chartDataList.length} charts`);
    
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