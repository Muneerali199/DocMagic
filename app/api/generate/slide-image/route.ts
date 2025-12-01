/**
 * API Route for generating AI images for presentation slides
 * Uses FLUX model via Nebius for high-quality image generation
 */

import { NextRequest, NextResponse } from 'next/server';

const NEBIUS_API_KEY = process.env.NEBIUS_API_KEY;
const NEBIUS_BASE_URL = "https://api.tokenfactory.nebius.com/v1/";

// Image type definitions with prompt templates
const IMAGE_TYPES: Record<string, { prefix: string; suffix: string; style: string }> = {
  illustration: {
    prefix: "Modern professional illustration of",
    suffix: "clean vector style, flat design, vibrant colors, minimalist composition",
    style: "digital illustration, 2D vector art, modern flat design"
  },
  diagram: {
    prefix: "Clean professional diagram showing",
    suffix: "clear labels, organized layout, business presentation style",
    style: "technical diagram, infographic style, clean lines, organized structure"
  },
  wireframe: {
    prefix: "Professional UI wireframe mockup of",
    suffix: "clean layout, placeholder elements, grid-based design, grayscale with accent color",
    style: "wireframe design, UI/UX mockup, blueprint style, minimal colors"
  },
  mockup: {
    prefix: "Realistic product mockup of",
    suffix: "professional photography style, clean background, studio lighting",
    style: "3D render, product visualization, photorealistic, professional"
  },
  logo: {
    prefix: "Modern minimalist logo design for",
    suffix: "clean typography, simple geometry, memorable design, scalable",
    style: "logo design, brand identity, vector graphics, iconic"
  },
  icon: {
    prefix: "Professional icon set representing",
    suffix: "consistent style, clear meaning, modern design, suitable for presentations",
    style: "icon design, glyph style, outlined or filled, consistent weight"
  },
  chart: {
    prefix: "Professional data visualization chart showing",
    suffix: "clean design, clear labels, modern color palette, business presentation style",
    style: "data visualization, infographic, chart design, professional"
  },
  photo: {
    prefix: "High-quality professional photograph of",
    suffix: "studio lighting, clean composition, commercial quality",
    style: "professional photography, 8k resolution, cinematic lighting"
  },
  abstract: {
    prefix: "Modern abstract background representing",
    suffix: "gradient colors, geometric shapes, dynamic composition",
    style: "abstract art, gradient design, modern patterns, vibrant colors"
  },
  infographic: {
    prefix: "Professional infographic illustration about",
    suffix: "clear data hierarchy, modern icons, organized sections, professional colors",
    style: "infographic design, data storytelling, visual hierarchy"
  },
  concept: {
    prefix: "Conceptual visualization of",
    suffix: "metaphorical representation, creative interpretation, thought-provoking",
    style: "concept art, creative visualization, artistic interpretation"
  },
  technology: {
    prefix: "Futuristic technology visualization of",
    suffix: "digital elements, circuit patterns, modern tech aesthetic, glowing accents",
    style: "tech visualization, digital art, futuristic design, sci-fi aesthetic"
  }
};

// Slide type to recommended image types mapping
const SLIDE_TYPE_RECOMMENDATIONS: Record<string, string[]> = {
  title: ['abstract', 'photo', 'technology'],
  cover: ['abstract', 'photo', 'technology'],
  content: ['illustration', 'photo', 'abstract'],
  bullet: ['icon', 'illustration', 'diagram'],
  comparison: ['diagram', 'illustration', 'infographic'],
  timeline: ['infographic', 'diagram', 'illustration'],
  process: ['diagram', 'infographic', 'wireframe'],
  stats: ['chart', 'infographic', 'diagram'],
  numbers: ['chart', 'infographic', 'abstract'],
  mockup: ['mockup', 'wireframe', 'diagram'],
  'data-viz': ['chart', 'infographic', 'diagram'],
  testimonial: ['photo', 'abstract', 'illustration'],
  quote: ['abstract', 'photo', 'illustration'],
  team: ['photo', 'illustration', 'icon'],
  conclusion: ['abstract', 'photo', 'illustration'],
  cta: ['abstract', 'illustration', 'photo']
};

/**
 * Build an optimized prompt for image generation
 */
function buildImagePrompt(
  topic: string, 
  imageType: string, 
  slideTitle?: string,
  slideContent?: string,
  customInstructions?: string
): string {
  const typeConfig = IMAGE_TYPES[imageType] || IMAGE_TYPES.illustration;
  
  let contextualTopic = topic;
  if (slideTitle) {
    contextualTopic = `${slideTitle} - ${topic}`;
  }
  if (slideContent && slideContent.length < 200) {
    contextualTopic += `, ${slideContent}`;
  }
  
  let prompt = `${typeConfig.prefix} ${contextualTopic}, ${typeConfig.style}, ${typeConfig.suffix}`;
  
  if (customInstructions) {
    prompt += `, ${customInstructions}`;
  }
  
  // Add quality enhancements
  prompt += ", high quality, professional, suitable for business presentation, 16:9 aspect ratio";
  
  return prompt;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      topic, 
      imageType = 'illustration', 
      slideType,
      slideTitle,
      slideContent,
      customPrompt,
      size = '1024x576',
      count = 1
    } = body;

    if (!topic && !customPrompt) {
      return NextResponse.json(
        { error: 'Topic or custom prompt is required' },
        { status: 400 }
      );
    }

    // Check for API key
    if (!NEBIUS_API_KEY) {
      console.warn('⚠️ NEBIUS_API_KEY not set, returning placeholder');
      const placeholderImages = Array(count).fill(null).map((_, i) => ({
        url: `https://placehold.co/${size}/6366F1/FFFFFF?text=${encodeURIComponent(topic || 'Image')}`,
        type: imageType,
        prompt: customPrompt || topic
      }));
      return NextResponse.json({ images: placeholderImages, fallback: true });
    }

    console.log(`🎨 Generating ${count} ${imageType} image(s) for: "${topic || customPrompt}"`);

    // Parse size
    const [width, height] = size.split('x').map(Number);

    // Build prompts
    const prompts: string[] = [];
    for (let i = 0; i < count; i++) {
      if (customPrompt) {
        prompts.push(customPrompt);
      } else {
        prompts.push(buildImagePrompt(topic, imageType, slideTitle, slideContent));
      }
    }

    // Use OpenAI SDK for Nebius
    const OpenAI = (await import('openai')).default;
    const client = new OpenAI({
      baseURL: NEBIUS_BASE_URL,
      apiKey: NEBIUS_API_KEY,
    });

    // Generate images
    const imageResults = await Promise.all(
      prompts.map(async (prompt, index) => {
        try {
          const response = await client.images.generate({
            model: "black-forest-labs/flux-dev",
            prompt: prompt,
            response_format: "url",
            // @ts-ignore - Nebius-specific parameters
            width: width,
            height: height,
            num_inference_steps: 28,
            n: 1,
          });

          if (!response.data?.[0]?.url) {
            throw new Error('Invalid response from FLUX API');
          }

          return {
            url: response.data[0].url,
            type: imageType,
            prompt: prompt,
            success: true
          };
        } catch (error: any) {
          console.error(`❌ Error generating image ${index + 1}:`, error.message);
          return {
            url: `https://placehold.co/${size}/6366F1/FFFFFF?text=${encodeURIComponent('Generation+Failed')}`,
            type: imageType,
            prompt: prompt,
            success: false,
            error: error.message
          };
        }
      })
    );

    const successCount = imageResults.filter(r => r.success).length;
    console.log(`✅ Generated ${successCount}/${count} images successfully`);

    return NextResponse.json({ 
      images: imageResults,
      recommendations: slideType ? SLIDE_TYPE_RECOMMENDATIONS[slideType] : undefined
    });

  } catch (error: any) {
    console.error('❌ Image generation API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate images' },
      { status: 500 }
    );
  }
}

// GET endpoint to get image type recommendations
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slideType = searchParams.get('slideType');

  return NextResponse.json({
    imageTypes: Object.keys(IMAGE_TYPES),
    recommendations: slideType ? SLIDE_TYPE_RECOMMENDATIONS[slideType] : SLIDE_TYPE_RECOMMENDATIONS,
    typeDescriptions: Object.entries(IMAGE_TYPES).map(([key, value]) => ({
      type: key,
      style: value.style
    }))
  });
}
