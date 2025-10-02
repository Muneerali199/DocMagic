import { Mistral } from '@mistralai/mistralai';

const apiKey = process.env.MISTRAL_API_KEY;

if (!apiKey) {
  console.warn('MISTRAL_API_KEY is not set in environment variables');
}

const mistral = apiKey ? new Mistral({ apiKey }) : null;

export interface ImageDescription {
  slideNumber: number;
  description: string;
  searchQuery: string;
}

export interface ChartData {
  slideNumber: number;
  type: 'bar' | 'line' | 'pie' | 'doughnut';
  title: string;
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
  }>;
}

/**
 * Generate image descriptions for presentation slides using Mistral AI
 */
export async function generateImageDescriptions(
  slideOutlines: any[],
  topic: string
): Promise<ImageDescription[]> {
  if (!mistral) {
    console.error('Mistral client not initialized');
    return [];
  }

  try {
    const prompt = `You are a professional presentation designer. Generate HIGHLY SPECIFIC and CONTEXTUAL image search queries for a presentation about "${topic}".

Slide Outlines:
${slideOutlines.map((slide, idx) => `
Slide ${idx + 1}: ${slide.title}
Content: ${slide.content || slide.bulletPoints?.join(', ') || ''}
Context: ${slide.context || topic}
`).join('\n')}

IMPORTANT: Each search query MUST be:
1. HIGHLY SPECIFIC to both the MAIN TOPIC ("${topic}") AND the slide content
2. Include 3-5 relevant keywords that directly relate to the subject matter
3. Professional and suitable for stock photography
4. Different from other slides to ensure variety

Return ONLY a JSON array (no markdown, no explanations):
[
  {
    "slideNumber": 1,
    "description": "Detailed visual description",
    "searchQuery": "${topic.split(' ').slice(0, 2).join(' ')} [specific-keywords-from-slide-title]"
  }
]

Example for topic "Artificial Intelligence":
- Slide 1 (Introduction): "artificial intelligence technology futuristic network"
- Slide 2 (Benefits): "artificial intelligence benefits business automation"
- Slide 3 (Applications): "artificial intelligence healthcare medical diagnosis"

Make each query UNIQUE and HIGHLY RELEVANT to both the presentation topic AND the specific slide!`;

    const response = await mistral.chat.complete({
      model: 'mistral-large-latest',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      maxTokens: 2000,
    });

    const content = response.choices?.[0]?.message?.content || '[]';
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return [];
  } catch (error) {
    console.error('Error generating image descriptions with Mistral:', error);
    return [];
  }
}

/**
 * Generate chart data for presentation slides using Mistral AI
 */
export async function generateChartData(
  slideOutlines: any[],
  topic: string
): Promise<ChartData[]> {
  if (!mistral) {
    console.error('Mistral client not initialized');
    return [];
  }

  try {
    const prompt = `You are a data visualization expert. Given the following presentation outline about "${topic}", identify which slides would benefit from charts and generate appropriate data visualizations.

Slide Outlines:
${slideOutlines.map((slide, idx) => `
Slide ${idx + 1}: ${slide.title}
Content: ${slide.bulletPoints?.join(', ') || slide.content}
`).join('\n')}

For slides that would benefit from charts (skip title, conclusion, and purely text-based slides), provide chart data.

Return ONLY a JSON array with this structure:
[
  {
    "slideNumber": 3,
    "type": "bar",
    "title": "Market Growth Comparison",
    "labels": ["2021", "2022", "2023", "2024"],
    "datasets": [
      {
        "label": "Revenue",
        "data": [45, 59, 80, 91]
      }
    ]
  }
]

Chart types: "bar", "line", "pie", "doughnut"
Generate realistic, relevant data that supports the slide content.`;

    const response = await mistral.chat.complete({
      model: 'mistral-large-latest',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      maxTokens: 2000,
    });

    const content = response.choices?.[0]?.message?.content || '[]';
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return [];
  } catch (error) {
    console.error('Error generating chart data with Mistral:', error);
    return [];
  }
}

/**
 * Enhance slide content with visual suggestions using Mistral AI
 */
export async function enhanceSlideWithVisuals(
  slideTitle: string,
  slideContent: string,
  slideNumber: number
): Promise<{
  image?: ImageDescription;
  chart?: ChartData;
}> {
  if (!mistral) {
    console.error('Mistral client not initialized');
    return {};
  }

  try {
    const prompt = `You are a presentation design expert. For this slide, suggest appropriate visuals:

Slide ${slideNumber}: ${slideTitle}
Content: ${slideContent}

Provide:
1. An image description and search query
2. If data visualization would help, provide chart specifications

Return ONLY valid JSON:
{
  "image": {
    "slideNumber": ${slideNumber},
    "description": "...",
    "searchQuery": "..."
  },
  "chart": {
    "slideNumber": ${slideNumber},
    "type": "bar|line|pie|doughnut",
    "title": "...",
    "labels": ["..."],
    "datasets": [{"label": "...", "data": [numbers]}]
  }
}

Omit "chart" if not applicable.`;

    const response = await mistral.chat.complete({
      model: 'mistral-large-latest',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      maxTokens: 1000,
    });

    const content = response.choices?.[0]?.message?.content || '{}';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return {};
  } catch (error) {
    console.error('Error enhancing slide with Mistral:', error);
    return {};
  }
}

/**
 * Generate presentation text content using Mistral AI
 */
export async function generatePresentationText(
  topic: string,
  pageCount: number = 8
): Promise<any[]> {
  if (!mistral) {
    console.error('Mistral client not initialized');
    return [];
  }

  try {
    const prompt = `Create a professional presentation outline for: "${topic}"

Generate ${pageCount} slides with:
1. Cover slide with engaging title
2. Content slides with clear structure
3. Conclusion slide

Return ONLY a JSON array with this structure:
[
  {
    "title": "Engaging Title",
    "layout": "cover|split|list|chart|quote",
    "bulletPoints": ["Key point 1", "Key point 2", "Key point 3"],
    "content": "Optional paragraph content",
    "notes": "Speaker notes"
  }
]

Guidelines:
- Use professional, clear language
- Make bullet points concise and impactful
- Mix different layouts for visual variety
- Ensure logical flow between slides`;

    const response = await mistral.chat.complete({
      model: 'mistral-large-latest',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      maxTokens: 3000,
    });

    const content = response.choices?.[0]?.message?.content || '[]';
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return [];
  } catch (error) {
    console.error('Error generating presentation text with Mistral:', error);
    throw error;
  }
}

/**
 * Generate alternative image suggestions for a slide
 */
export async function generateAlternativeImages(
  slideTitle: string,
  slideContent: string,
  count: number = 5
): Promise<ImageDescription[]> {
  if (!mistral) {
    console.error('Mistral client not initialized');
    return [];
  }

  try {
    const prompt = `Generate ${count} diverse, professional image suggestions for this slide:

Title: ${slideTitle}
Content: ${slideContent}

Return ONLY a JSON array with ${count} different image options:
[
  {
    "slideNumber": 1,
    "description": "Detailed description of professional image",
    "searchQuery": "concise search query"
  }
]

Provide variety in:
- Perspectives (close-up, wide angle, aerial)
- Styles (photography, illustration, abstract)
- Subjects (people, objects, concepts)
- Moods (energetic, calm, professional)`;

    const response = await mistral.chat.complete({
      model: 'mistral-large-latest',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.9, // Higher temperature for more variety
      maxTokens: 1500,
    });

    const content = response.choices?.[0]?.message?.content || '[]';
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return [];
  } catch (error) {
    console.error('Error generating alternative images with Mistral:', error);
    return [];
  }
}
