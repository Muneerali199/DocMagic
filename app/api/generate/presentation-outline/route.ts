export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { 
  generatePresentationText, 
  generateChartData 
} from '@/lib/mistral';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { ACTION_COSTS, TIER_LIMITS } from '@/lib/credits-service';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
      const parsedSlides = JSON.parse(jsonMatch[0]);
      
      // Ensure we have the correct number of slides
      if (parsedSlides.length !== pageCount) {
        console.warn(`⚠️ Nebius generated ${parsedSlides.length} slides instead of ${pageCount}. Adjusting...`);
        
        // If too many slides, trim to pageCount
        if (parsedSlides.length > pageCount) {
          return parsedSlides.slice(0, pageCount);
        }
        
        // If too few slides, generate filler slides
        while (parsedSlides.length < pageCount) {
          const slideNumber = parsedSlides.length + 1;
          parsedSlides.push({
            slideNumber,
            type: 'content',
            title: `Slide ${slideNumber}`,
            content: 'Content for this slide',
            bulletPoints: ['Key point 1', 'Key point 2', 'Key point 3']
          });
        }
      }
      
      return parsedSlides;
    } catch (e) {
      console.error('Failed to parse Nebius response:', e);
    }
  }
  
  // Fallback: create basic slides with exact pageCount
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
    // ✅ AUTHENTICATION CHECK
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in.' },
        { status: 401 }
      );
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { prompt, pageCount = 8, outlineOnly = false } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Missing prompt' },
        { status: 400 }
      );
    }

    // ✅ CREDIT CHECK - Calculate cost based on number of slides
    const creditCost = pageCount * ACTION_COSTS.presentation; // 1 credit per slide
    
    // Get or create user credits
    let { data: userCredits, error: creditsError } = await supabaseAdmin
      .from('user_credits')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // If no credits record exists, create one
    if (!userCredits) {
      const resetDate = new Date();
      resetDate.setDate(resetDate.getDate() + 30);
      
      const { data: newCredits, error: insertError } = await supabaseAdmin
        .from('user_credits')
        .insert({
          user_id: user.id,
          tier: 'free',
          credits_total: TIER_LIMITS.free,
          credits_used: 0,
          credits_reset_at: resetDate.toISOString()
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('Failed to create credits record:', insertError);
        return NextResponse.json(
          { error: 'Failed to initialize credits' },
          { status: 500 }
        );
      }
      userCredits = newCredits;
    }

    // Check if credits need reset
    if (userCredits && new Date(userCredits.credits_reset_at) < new Date()) {
      const resetDate = new Date();
      resetDate.setDate(resetDate.getDate() + 30);

      const { data: updatedCredits } = await supabaseAdmin
        .from('user_credits')
        .update({
          credits_used: 0,
          credits_reset_at: resetDate.toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (updatedCredits) {
        userCredits = updatedCredits;
      }
    }

    // Check if user has enough credits
    const creditsRemaining = userCredits.credits_total - userCredits.credits_used;
    
    if (creditsRemaining < creditCost) {
      return NextResponse.json(
        { 
          error: 'Not enough credits',
          message: `You need ${creditCost} credits to generate a ${pageCount}-slide presentation. You have ${creditsRemaining} credits remaining.`,
          needsUpgrade: true,
          currentTier: userCredits.tier,
          creditsRemaining,
          creditsRequired: creditCost
        },
        { status: 402 }
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
    
    // ✅ DEDUCT CREDITS after successful generation
    const { error: updateError } = await supabaseAdmin
      .from('user_credits')
      .update({ 
        credits_used: userCredits.credits_used + creditCost,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Failed to deduct credits:', updateError);
      // Don't fail the request, just log the error
    } else {
      // Log the usage
      await supabaseAdmin
        .from('credit_usage_log')
        .insert({
          user_id: user.id,
          action_type: 'presentation',
          credits_used: creditCost,
          metadata: { 
            pageCount: enhancedOutlines.length,
            prompt_length: prompt.length 
          }
        });
      
      console.log(`💳 Deducted ${creditCost} credits for ${enhancedOutlines.length}-slide presentation`);
    }
    
    return NextResponse.json({ 
      outlines: enhancedOutlines,
      stats: {
        totalSlides: enhancedOutlines.length,
        withImages: enhancedOutlines.filter((o: any) => o.imageUrl).length,
        withCharts: enhancedOutlines.filter((o: any) => o.chartData).length,
      },
      credits: {
        used: creditCost,
        remaining: creditsRemaining - creditCost
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