/**
 * FLUX.1-schnell Image Generator using Nebius API
 * High-quality image generation for presentations
 */

const NEBIUS_API_KEY = process.env.NEBIUS_API_KEY;
const NEBIUS_BASE_URL = "https://api.tokenfactory.nebius.com/v1/";

interface FluxImageOptions {
  prompt: string;
  size?: "1024x1024" | "1024x768" | "768x1024" | "512x512";
  model?: string;
}

/**
 * Generate a single image using FLUX via Nebius
 */
export async function generateFluxImage({
  prompt,
  size = "512x512",
  model = "black-forest-labs/flux-dev"
}: FluxImageOptions): Promise<string> {
  if (!NEBIUS_API_KEY) {
    console.warn('⚠️ NEBIUS_API_KEY not set, falling back to placeholder');
    return `https://placehold.co/${size}/EEE/31343C?text=Image`;
  }

  try {
    console.log(`🎨 Generating FLUX image: "${prompt.substring(0, 50)}..."`);

    // Parse size
    const [width, height] = size.split('x').map(Number);

    // Use OpenAI SDK format for Nebius (as per official docs)
    const OpenAI = (await import('openai')).default;
    const client = new OpenAI({
      baseURL: NEBIUS_BASE_URL,
      apiKey: NEBIUS_API_KEY,
    });

    const response = await client.images.generate({
      model: model,
      prompt: enhancePromptForPresentation(prompt),
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
    return `https://placehold.co/${size}/EEE/31343C?text=Image`;
  }
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
 */
export async function generateSlideImage(
  slideType: string,
  slideTitle: string,
  slideContent: string,
  size: "1024x1024" | "1024x768" | "1024x576" = "1024x576"
): Promise<string> {
  let prompt = "";

  switch (slideType.toLowerCase()) {
    case "title":
    case "cover":
      prompt = `Breathtaking hero image for "${slideTitle}", stunning gradient background, vibrant purple and blue tones, modern abstract shapes, cinematic lighting, ultra premium quality, inspiring and bold`;
      break;
    
    case "content":
    case "bullet":
      prompt = `Beautiful abstract background for "${slideTitle}", soft gradient overlay, modern geometric patterns, professional photography, vibrant colors, clean composition, high-end design`;
      break;
    
    case "image":
    case "visual":
      prompt = `Stunning professional photograph representing "${slideTitle}", ${slideContent.substring(0, 100)}, dramatic lighting, vibrant colors, cinematic composition, ultra high quality`;
      break;
    
    case "comparison":
    case "vs":
      prompt = `Dynamic split-screen visual for "${slideTitle}", contrasting vibrant colors, modern design, professional photography, clear visual hierarchy`;
      break;
    
    case "timeline":
    case "process":
      prompt = `Modern timeline visualization for "${slideTitle}", flowing gradient background, clean infographic style, vibrant accent colors, professional design`;
      break;
    
    case "conclusion":
    case "summary":
      prompt = `Inspiring conclusion image for "${slideTitle}", uplifting gradient background, warm vibrant colors, motivational atmosphere, premium quality, cinematic feel`;
      break;
    
    case "stats":
    case "numbers":
      prompt = `Bold data visualization background for "${slideTitle}", vibrant gradient, modern abstract shapes, professional infographic style, eye-catching design`;
      break;
    
    default:
      prompt = `Stunning presentation slide background for "${slideTitle}", vibrant gradient overlay, modern abstract design, professional photography, bold colors, premium quality`;
  }

  return generateFluxImage({ prompt, size });
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
