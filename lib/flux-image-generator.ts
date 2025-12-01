/**
 * FLUX.1-schnell Image Generator using Nebius API
 * High-quality image generation for presentations
 * Supports: logos, illustrations, diagrams, wireframes, mockups, infographics
 */

const NEBIUS_API_KEY = process.env.NEBIUS_API_KEY;
const NEBIUS_BASE_URL = "https://api.tokenfactory.nebius.com/v1/";

interface FluxImageOptions {
  prompt: string;
  size?: "1024x1024" | "1024x768" | "768x1024" | "512x512" | "1024x576";
  model?: string;
  imageType?: 'illustration' | 'diagram' | 'wireframe' | 'mockup' | 'logo' | 'icon' | 'chart' | 'photo' | 'abstract' | 'infographic' | 'technology';
}

// Enhanced style presets for different image types
const IMAGE_STYLE_PRESETS: Record<string, string> = {
  illustration: "modern professional illustration, clean vector style, flat design, vibrant colors, minimalist composition, digital illustration",
  diagram: "clean professional diagram, clear labels, organized layout, business presentation style, technical infographic, flowchart design",
  wireframe: "professional UI wireframe mockup, clean layout, placeholder elements, grid-based design, grayscale with accent highlights, blueprint style",
  mockup: "realistic product mockup, professional photography style, clean background, studio lighting, 3D render quality",
  logo: "modern minimalist logo design, clean typography, simple geometry, memorable design, scalable vector style",
  icon: "professional icon set, consistent style, clear meaning, modern flat design, suitable for presentations",
  chart: "professional data visualization chart, clean design, clear labels, modern color palette, infographic style",
  photo: "high-quality professional photograph, studio lighting, clean composition, commercial quality, 8k resolution",
  abstract: "modern abstract background, gradient colors, geometric shapes, dynamic composition, vibrant patterns",
  infographic: "professional infographic illustration, clear data hierarchy, modern icons, organized sections, visual storytelling",
  technology: "futuristic technology visualization, digital elements, circuit patterns, modern tech aesthetic, glowing accents, sci-fi design"
};

/**
 * Generate a single image using FLUX via Nebius
 */
export async function generateFluxImage({
  prompt,
  size = "1024x576",
  model = "black-forest-labs/flux-dev",
  imageType = 'illustration'
}: FluxImageOptions): Promise<string> {
  if (!NEBIUS_API_KEY) {
    console.warn('⚠️ NEBIUS_API_KEY not set, falling back to placeholder');
    return `https://placehold.co/${size}/6366F1/FFFFFF?text=${encodeURIComponent(prompt.substring(0, 20))}`;
  }

  try {
    console.log(`🎨 Generating FLUX ${imageType}: "${prompt.substring(0, 50)}..."`);

    // Parse size
    const [width, height] = size.split('x').map(Number);

    // Enhance prompt with style preset
    const enhancedPrompt = enhancePromptWithStyle(prompt, imageType);

    // Use OpenAI SDK format for Nebius (as per official docs)
    const OpenAI = (await import('openai')).default;
    const client = new OpenAI({
      baseURL: NEBIUS_BASE_URL,
      apiKey: NEBIUS_API_KEY,
    });

    const response = await client.images.generate({
      model: model,
      prompt: enhancedPrompt,
      response_format: "url",
      // @ts-ignore - Nebius-specific parameters
      width: width,
      height: height,
      num_inference_steps: 28,
      n: 1,
    });

    if (!response.data || !response.data[0] || !response.data[0].url) {
      throw new Error('Invalid response from FLUX API');
    }

    const imageUrl = response.data[0].url;
    console.log('✅ FLUX image generated successfully');
    
    return imageUrl;
  } catch (error: any) {
    console.error('❌ Error generating FLUX image:', error);
    // Fallback to reliable placeholder if API fails
    return `https://placehold.co/${size}/6366F1/FFFFFF?text=${encodeURIComponent('Image')}`;
  }
}

/**
 * Enhance prompt with appropriate style preset
 */
function enhancePromptWithStyle(prompt: string, imageType: string): string {
  const stylePreset = IMAGE_STYLE_PRESETS[imageType] || IMAGE_STYLE_PRESETS.illustration;
  
  // Check if prompt already has style enhancements
  const hasEnhancement = Object.values(IMAGE_STYLE_PRESETS).some(preset => 
    prompt.toLowerCase().includes(preset.substring(0, 20).toLowerCase())
  );

  if (hasEnhancement) {
    return prompt;
  }

  return `${prompt}, ${stylePreset}, high quality, professional, suitable for business presentation, 16:9 aspect ratio`;
}

/**
 * Generate multiple images for presentation slides
 */
export async function generatePresentationImages(
  slidePrompts: string[],
  size: "1024x1024" | "1024x768" | "512x512" = "512x512"
): Promise<string[]> {
  console.log(`🎨 Generating ${slidePrompts.length} presentation images with FLUX...`);

  const imagePromises = slidePrompts.map(prompt => 
    generateFluxImage({ prompt, size })
  );

  try {
    const images = await Promise.all(imagePromises);
    console.log(`✅ Generated ${images.length} presentation images`);
    return images;
  } catch (error) {
    console.error('❌ Error generating presentation images:', error);
    // Return placeholders for all slides
    return slidePrompts.map(() => `https://placehold.co/${size}/EEE/31343C?text=Slide+Image`);
  }
}

/**
 * Regenerate a single slide image
 */
export async function regenerateSlideImage(
  prompt: string,
  size: "1024x1024" | "1024x768" | "1024x576" = "1024x576"
): Promise<string> {
  console.log(`🔄 Regenerating image: "${prompt}"`);
  return generateFluxImage({ prompt, size });
}

/**
 * Enhance prompt for Gamma-style presentation images
 */
function enhancePromptForPresentation(prompt: string): string {
  // Gamma-style presentation enhancements
  const gammaStyleKeywords = [
    "stunning professional photography",
    "vibrant gradient overlays",
    "modern abstract background",
    "dramatic cinematic lighting",
    "bold vibrant colors",
    "high-end commercial quality",
    "8k ultra HD resolution",
    "visually striking composition",
    "premium design aesthetic",
    "professional studio quality",
    "dynamic perspective",
    "rich color palette"
  ];

  // Check if prompt already has enhancements
  const hasEnhancement = gammaStyleKeywords.some(keyword => 
    prompt.toLowerCase().includes(keyword.toLowerCase())
  );

  if (hasEnhancement) {
    return prompt;
  }

  // Add Gamma-style enhancements for breathtaking images
  return `${prompt}, stunning professional photography, vibrant gradient overlays, modern abstract background, dramatic cinematic lighting, bold vibrant colors, high-end commercial quality, 8k ultra HD, visually striking composition, premium design aesthetic, 16:9 aspect ratio, professional studio quality`;
}

/**
 * Generate Gamma-style image for specific slide types
 * Now with intelligent image type selection
 */
export async function generateSlideImage(
  slideType: string,
  slideTitle: string,
  slideContent: string,
  size: "1024x1024" | "1024x768" | "1024x576" = "1024x576"
): Promise<string> {
  // Determine the best image type based on slide type
  const imageTypeMap: Record<string, string> = {
    title: 'abstract',
    cover: 'abstract',
    content: 'illustration',
    bullet: 'illustration',
    image: 'photo',
    visual: 'photo',
    comparison: 'diagram',
    vs: 'diagram',
    timeline: 'infographic',
    process: 'diagram',
    conclusion: 'abstract',
    summary: 'illustration',
    stats: 'chart',
    numbers: 'infographic',
    mockup: 'mockup',
    'data-viz': 'chart',
    team: 'photo',
    testimonial: 'photo',
    quote: 'abstract',
    features: 'icon',
    benefits: 'illustration',
    pricing: 'chart',
    cta: 'abstract',
    contact: 'illustration'
  };

  const imageType = imageTypeMap[slideType.toLowerCase()] || 'illustration';
  let prompt = "";

  // Build contextual prompts based on slide type and content
  switch (slideType.toLowerCase()) {
    case "title":
    case "cover":
      prompt = `Hero image for "${slideTitle}", stunning gradient background, vibrant purple and blue tones, modern abstract shapes, cinematic lighting, ultra premium quality`;
      break;
    
    case "content":
    case "bullet":
      prompt = `Professional illustration for "${slideTitle}", ${slideContent.substring(0, 80)}, clean modern design, business style`;
      break;
    
    case "image":
    case "visual":
      prompt = `Professional photograph representing "${slideTitle}", ${slideContent.substring(0, 100)}, dramatic lighting, cinematic composition`;
      break;
    
    case "comparison":
    case "vs":
      prompt = `Comparison diagram for "${slideTitle}", split design showing contrast, clear visual hierarchy, professional infographic style`;
      break;
    
    case "timeline":
      prompt = `Timeline infographic for "${slideTitle}", horizontal flow design, milestone markers, modern icons, clean layout`;
      break;

    case "process":
      prompt = `Process flow diagram for "${slideTitle}", step-by-step visualization, connected nodes, professional flowchart design`;
      break;
    
    case "conclusion":
    case "summary":
      prompt = `Inspiring conclusion image for "${slideTitle}", uplifting gradient, warm colors, motivational atmosphere`;
      break;
    
    case "stats":
    case "numbers":
    case "data-viz":
      prompt = `Data visualization chart for "${slideTitle}", ${slideContent.substring(0, 60)}, modern chart design, clear data representation`;
      break;

    case "mockup":
      prompt = `Product mockup for "${slideTitle}", ${slideContent.substring(0, 60)}, device screens, realistic 3D render, professional display`;
      break;

    case "team":
      prompt = `Professional team concept for "${slideTitle}", diverse group, collaborative atmosphere, modern office setting`;
      break;

    case "testimonial":
    case "quote":
      prompt = `Inspirational background for "${slideTitle}", subtle gradient, professional atmosphere, quote-friendly design`;
      break;

    case "features":
    case "benefits":
      prompt = `Feature illustration for "${slideTitle}", ${slideContent.substring(0, 60)}, icon-based design, clear visual hierarchy`;
      break;

    case "pricing":
      prompt = `Pricing visualization for "${slideTitle}", tier comparison, professional chart style, clean business design`;
      break;

    case "cta":
      prompt = `Call-to-action background for "${slideTitle}", dynamic gradient, action-oriented design, vibrant energy`;
      break;
    
    default:
      prompt = `Professional illustration for "${slideTitle}", ${slideContent.substring(0, 80)}, modern business design`;
  }

  return generateFluxImage({ prompt, size, imageType: imageType as any });
}

/**
 * Generate smart image based on content analysis
 */
export async function generateSmartImage(
  topic: string,
  context: string,
  preferredType?: string,
  size: "1024x1024" | "1024x768" | "1024x576" = "1024x576"
): Promise<{ url: string; type: string }> {
  // Analyze content to determine best image type
  const contentLower = (topic + ' ' + context).toLowerCase();
  
  let imageType: string = preferredType || 'illustration';
  
  // Smart type detection based on keywords
  if (!preferredType) {
    if (contentLower.includes('data') || contentLower.includes('chart') || contentLower.includes('graph') || contentLower.includes('statistics')) {
      imageType = 'chart';
    } else if (contentLower.includes('process') || contentLower.includes('flow') || contentLower.includes('step')) {
      imageType = 'diagram';
    } else if (contentLower.includes('wireframe') || contentLower.includes('ui') || contentLower.includes('interface') || contentLower.includes('screen')) {
      imageType = 'wireframe';
    } else if (contentLower.includes('mockup') || contentLower.includes('device') || contentLower.includes('phone') || contentLower.includes('laptop')) {
      imageType = 'mockup';
    } else if (contentLower.includes('logo') || contentLower.includes('brand')) {
      imageType = 'logo';
    } else if (contentLower.includes('icon') || contentLower.includes('symbol')) {
      imageType = 'icon';
    } else if (contentLower.includes('tech') || contentLower.includes('code') || contentLower.includes('digital') || contentLower.includes('ai') || contentLower.includes('software')) {
      imageType = 'technology';
    } else if (contentLower.includes('photo') || contentLower.includes('team') || contentLower.includes('people') || contentLower.includes('office')) {
      imageType = 'photo';
    } else if (contentLower.includes('infographic') || contentLower.includes('info')) {
      imageType = 'infographic';
    } else if (contentLower.includes('abstract') || contentLower.includes('background')) {
      imageType = 'abstract';
    }
  }

  const prompt = `${topic}, ${context.substring(0, 100)}`;
  const url = await generateFluxImage({ prompt, size, imageType: imageType as any });
  
  return { url, type: imageType };
}

/**
 * Batch generate images with rate limiting
 */
export async function batchGenerateImages(
  prompts: string[],
  size: "1024x1024" | "1024x768" | "1024x576" = "1024x576",
  delayMs: number = 1000
): Promise<string[]> {
  const images: string[] = [];

  for (let i = 0; i < prompts.length; i++) {
    const image = await generateFluxImage({ prompt: prompts[i], size });
    images.push(image);
    
    // Add delay between requests to avoid rate limiting
    if (i < prompts.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return images;
}
