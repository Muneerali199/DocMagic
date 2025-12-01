/**
 * Gamma-style Image Prompts for Stunning Presentations
 * Based on analysis of Gamma.app presentations
 */

export interface SlideImagePrompt {
  slideType: string;
  basePrompt: string;
  styleEnhancements: string;
}

/**
 * Generate Gamma-style image prompts based on slide type and content
 */
export function generateGammaStylePrompt(
  slideType: string,
  title: string,
  content: string,
  topic: string
): string {
  const prompts: Record<string, (title: string, content: string, topic: string) => string> = {
    title: (title, content, topic) =>
      `Epic hero image for "${title}", ${topic}, futuristic technology background, vibrant gradient from blue to purple, dramatic lighting, cinematic composition, ultra-wide angle, 8k quality, professional photography, depth of field, modern minimalist, visually stunning`,

    overview: (title, content, topic) =>
      `Professional overview visualization for "${title}", ${topic}, modern interface design, clean composition, vibrant colors, high-tech aesthetic, professional photography, dramatic lighting, 8k resolution, premium quality`,

    features: (title, content, topic) =>
      `Dynamic feature showcase for "${title}", ${content.substring(0, 50)}, modern technology, vibrant gradient background, professional product photography, clean minimalist design, dramatic lighting, 8k quality`,

    statistics: (title, content, topic) =>
      `Data visualization background for "${title}", abstract geometric patterns, vibrant gradient, modern infographic style, professional design, clean composition, dramatic lighting, 8k resolution`,

    marketplace: (title, content, topic) =>
      `Modern marketplace interface for "${title}", ${topic}, sleek design, vibrant colors, professional photography, futuristic aesthetic, dramatic lighting, ultra-wide composition, 8k quality`,

    roadmap: (title, content, topic) =>
      `Timeline visualization for "${title}", modern abstract background, vibrant gradient, professional design, clean minimalist composition, dramatic lighting, futuristic aesthetic, 8k resolution`,

    team: (title, content, topic) =>
      `Professional team collaboration for "${title}", modern office environment, diverse team, vibrant lighting, cinematic photography, high-end quality, dramatic composition, 8k resolution`,

    community: (title, content, topic) =>
      `Vibrant community gathering for "${title}", ${topic}, diverse people connecting, modern aesthetic, dramatic lighting, professional photography, energetic atmosphere, 8k quality`,

    conclusion: (title, content, topic) =>
      `Inspiring conclusion image for "${title}", ${topic}, uplifting atmosphere, vibrant gradient, dramatic lighting, cinematic composition, professional photography, visually stunning, 8k resolution`,

    default: (title, content, topic) =>
      `Professional presentation visual for "${title}", ${content.substring(0, 60)}, ${topic}, modern design, vibrant colors, dramatic lighting, cinematic composition, 8k quality, premium photography`,
  };

  const promptGenerator = prompts[slideType.toLowerCase()] || prompts.default;
  return promptGenerator(title, content, topic);
}

/**
 * Enhance any prompt with Gamma-style characteristics
 */
export function addGammaStyleEnhancements(basePrompt: string): string {
  const enhancements = [
    "cinematic photography",
    "vibrant gradient overlay",
    "dramatic lighting",
    "modern minimalist composition",
    "ultra-wide 16:9 aspect ratio",
    "8k ultra HD resolution",
    "depth of field",
    "professional color grading",
    "visually stunning",
    "premium quality",
    "high-end commercial photography",
    "bold vibrant colors"
  ];

  // Check if already enhanced
  const hasEnhancements = enhancements.some(e => 
    basePrompt.toLowerCase().includes(e.toLowerCase())
  );

  if (hasEnhancements) {
    return basePrompt;
  }

  return `${basePrompt}, cinematic photography, vibrant gradient overlay, dramatic lighting, modern minimalist composition, ultra-wide 16:9, 8k resolution, depth of field, professional color grading, visually stunning, premium quality`;
}

/**
 * Specific prompts for Web3/Gaming presentations (like ChainArena example)
 */
export function generateWeb3GamingPrompt(
  slideType: string,
  title: string,
  content: string
): string {
  const web3Prompts: Record<string, string> = {
    title: `Epic futuristic gaming hero image, blockchain technology, NFT cards floating, vibrant neon colors, cyberpunk aesthetic, dramatic lighting, cinematic composition, 8k quality, professional game art`,

    gameplay: `Intense gaming battle scene, strategic card game, futuristic interface, vibrant colors, dramatic action, professional game photography, cinematic lighting, 8k resolution`,

    nft: `Glowing NFT cards showcase, blockchain visualization, vibrant holographic effects, futuristic aesthetic, dramatic lighting, professional product photography, 8k quality`,

    earn: `Cryptocurrency rewards visualization, golden coins, vibrant gradient, futuristic economy, dramatic lighting, professional photography, cinematic composition, 8k resolution`,

    marketplace: `Futuristic digital marketplace, NFT trading interface, vibrant neon colors, cyberpunk aesthetic, dramatic lighting, professional design, 8k quality`,

    roadmap: `Futuristic timeline visualization, blockchain technology, vibrant gradient, modern interface, dramatic lighting, professional design, 8k resolution`,

    team: `Professional tech team, modern office, diverse developers, vibrant lighting, cinematic photography, high-end quality, 8k resolution`,

    community: `Vibrant gaming community, diverse players, futuristic setting, energetic atmosphere, dramatic lighting, professional photography, 8k quality`,
  };

  const basePrompt = web3Prompts[slideType.toLowerCase()] || 
    `Professional gaming presentation visual for "${title}", ${content.substring(0, 60)}, futuristic aesthetic, vibrant colors, dramatic lighting, 8k quality`;

  return addGammaStyleEnhancements(basePrompt);
}

/**
 * Get slide type from content analysis
 */
export function detectSlideType(title: string, content: string): string {
  const titleLower = title.toLowerCase();
  const contentLower = content.toLowerCase();

  if (titleLower.includes('overview') || titleLower.includes('introduction')) return 'overview';
  if (titleLower.includes('feature') || titleLower.includes('gameplay')) return 'features';
  if (titleLower.includes('nft') || titleLower.includes('card')) return 'nft';
  if (titleLower.includes('earn') || titleLower.includes('reward')) return 'earn';
  if (titleLower.includes('marketplace') || titleLower.includes('trading')) return 'marketplace';
  if (titleLower.includes('roadmap') || titleLower.includes('development')) return 'roadmap';
  if (titleLower.includes('team') || titleLower.includes('partnership')) return 'team';
  if (titleLower.includes('community') || titleLower.includes('join')) return 'community';
  if (titleLower.includes('conclusion') || titleLower.includes('summary')) return 'conclusion';

  // Check content for statistics
  if (contentLower.match(/\d+[%$k+]/)) return 'statistics';

  return 'default';
}
