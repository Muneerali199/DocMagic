import { NextRequest } from 'next/server';
const { NextResponse } = require('next/server');
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

interface CampaignIdea {
  title: string;
  summary: string;
  hook: string;
}

export async function POST(req: NextRequest) {
  try {
    const { brandDNA, goal, platforms } = await req.json();

    if (!brandDNA || !goal) {
      return NextResponse.json({ 
        error: 'Brand DNA and campaign goal are required' 
      }, { status: 400 });
    }

    const selectedPlatforms = platforms || ['instagram', 'linkedin', 'twitter', 'facebook'];

    // Generate campaign ideas
    const campaignIdeas = await generateCampaignIdeas(brandDNA, goal);

    // Generate posts for each campaign and platform
    const campaigns = await Promise.all(
      campaignIdeas.map(async (idea: CampaignIdea) => {
        const posts: any = {};
        
        for (const platform of selectedPlatforms) {
          posts[platform] = await generatePlatformPost(idea, platform, brandDNA);
        }

        return {
          ...idea,
          posts,
          imagePrompt: generateImagePrompt(idea, brandDNA),
        };
      })
    );

    return NextResponse.json({ 
      success: true,
      brandDNA,
      campaigns 
    });

  } catch (error: any) {
    console.error('Error generating campaign:', error);
    return NextResponse.json({ 
      error: 'Failed to generate campaign',
      details: error.message 
    }, { status: 500 });
  }
}

async function generateCampaignIdeas(brandDNA: any, goal: string) {
  const prompt = `You are an expert marketing strategist. Generate 5 creative campaign ideas for the following brand:

Brand Name: ${brandDNA.brandName}
Tagline: ${brandDNA.tagline}
Tone: ${brandDNA.tone}
Description: ${brandDNA.description}
Keywords: ${brandDNA.keywords?.join(', ')}

Campaign Goal: ${goal}

Generate 5 unique, creative campaign ideas. Each should have:
1. A catchy title (max 50 characters)
2. A brief summary (max 100 characters)
3. A unique angle or hook

Return ONLY a JSON array with this structure:
[
  {
    "title": "Campaign Title",
    "summary": "Brief summary",
    "hook": "Unique angle"
  }
]`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'mixtral-8x7b-32768',
      temperature: 0.8,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content || '[]';
    
    // Extract JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return [];
  } catch (error) {
    console.error('Error generating ideas:', error);
    return [];
  }
}

async function generatePlatformPost(idea: any, platform: string, brandDNA: any) {
  const platformSpecs: Record<string, any> = {
    instagram: { maxChars: 2200, style: 'visual, emoji-rich, casual', hashtagCount: '8-10' },
    linkedin: { maxChars: 3000, style: 'professional, value-driven', hashtagCount: '3-5' },
    twitter: { maxChars: 280, style: 'concise, punchy', hashtagCount: '2-3' },
    facebook: { maxChars: 1000, style: 'engaging, conversational', hashtagCount: '3-5' },
  };

  const spec = platformSpecs[platform] || platformSpecs.instagram;

  const prompt = `Create a ${platform} post for this marketing campaign:

Campaign: ${idea.title}
Summary: ${idea.summary}
Hook: ${idea.hook}

Brand Info:
- Name: ${brandDNA.brandName}
- Tone: ${brandDNA.tone}
- Tagline: ${brandDNA.tagline}

Platform: ${platform}
Style: ${spec.style}
Max Characters: ${spec.maxChars}
Hashtags: ${spec.hashtagCount}

Generate:
1. Engaging caption (within character limit)
2. ${spec.hashtagCount} relevant hashtags
3. A strong CTA (call-to-action)

Return ONLY a JSON object:
{
  "caption": "Your post caption here",
  "hashtags": ["#tag1", "#tag2"],
  "cta": "Your CTA here"
}`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'mixtral-8x7b-32768',
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = completion.choices[0]?.message?.content || '{}';
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return {
      caption: idea.summary,
      hashtags: [],
      cta: 'Learn more',
    };
  } catch (error) {
    console.error(`Error generating ${platform} post:`, error);
    return {
      caption: idea.summary,
      hashtags: [],
      cta: 'Learn more',
    };
  }
}

function generateImagePrompt(idea: any, brandDNA: any): string {
  const colors = brandDNA.colors?.slice(0, 3).join(', ') || 'vibrant colors';
  const tone = brandDNA.tone || 'professional';
  
  return `Create a modern marketing poster for "${idea.title}". 
Style: ${tone}, clean, minimal, ${colors} color scheme. 
Theme: ${idea.hook}. 
Include: subtle branding elements, engaging visual metaphor.
No text overlay needed.`;
}
