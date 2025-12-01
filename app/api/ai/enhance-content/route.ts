import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, documentType, canvasData, context } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Build context-aware prompt
    const systemPrompt = `You are an expert design and content enhancement assistant. You help users improve their ${documentType} documents.

Current document context:
- Document type: ${documentType}
- Number of elements: ${context?.objectCount || 0}
- Has text: ${context?.hasText ? 'Yes' : 'No'}
- Has images: ${context?.hasImages ? 'Yes' : 'No'}

Provide specific, actionable suggestions based on the user's request. If they ask for:
- Text improvements: Suggest better wording, structure, and formatting
- Color schemes: Provide hex color codes with explanations
- Layout suggestions: Give specific positioning and spacing advice
- Design elements: Suggest what to add and where

Keep responses concise, practical, and easy to implement. Use bullet points for clarity.`;

    const fullPrompt = `${systemPrompt}\n\nUser request: ${prompt}`;

    // Generate AI response
    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();

    // Parse response for actionable enhancements
    const enhancements = parseEnhancements(text, prompt);

    return NextResponse.json({
      response: text,
      enhancements,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error in AI enhancement:', error);
    
    // Return fallback response
    // Return fallback response
    return NextResponse.json({
      response: generateFallbackResponse(''),
      enhancements: null,
      timestamp: new Date().toISOString()
    });
  }
}

function parseEnhancements(text: string, prompt: string): any {
  const enhancements: any = {};
  const lower = prompt.toLowerCase();

  // Extract color codes if mentioned
  const colorRegex = /#[0-9A-Fa-f]{6}/g;
  const colors = text.match(colorRegex);
  if (colors && colors.length > 0) {
    enhancements.colors = {
      primary: colors[0],
      secondary: colors[1] || colors[0],
      accent: colors[2] || colors[0]
    };
  }

  // Extract text suggestions
  if (lower.includes('text') || lower.includes('content')) {
    enhancements.textSuggestions = extractBulletPoints(text);
  }

  // Extract layout suggestions
  if (lower.includes('layout') || lower.includes('position')) {
    enhancements.layoutSuggestions = extractBulletPoints(text);
  }

  return Object.keys(enhancements).length > 0 ? enhancements : null;
}

function extractBulletPoints(text: string): string[] {
  const lines = text.split('\n');
  const bulletPoints: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
      bulletPoints.push(trimmed.substring(1).trim());
    }
  }
  
  return bulletPoints;
}

function generateFallbackResponse(prompt: string): string {
  const lower = prompt.toLowerCase();
  
  if (lower.includes('text') || lower.includes('content') || lower.includes('improve')) {
    return `✨ **Text Enhancement Suggestions:**

• **Use Strong Action Verbs**: Replace passive language with active, dynamic verbs
• **Be Concise**: Remove unnecessary words and get straight to the point
• **Add Specifics**: Include numbers, metrics, or concrete examples
• **Create Hierarchy**: Use headings, subheadings, and bullet points
• **Maintain Consistency**: Keep tone and style uniform throughout

**Quick Wins:**
- Replace "responsible for" with specific action verbs
- Break long paragraphs into shorter, scannable sections
- Add quantifiable achievements where possible
- Use parallel structure in lists`;
  }
  
  if (lower.includes('color') || lower.includes('scheme') || lower.includes('palette')) {
    return `🎨 **Modern Color Scheme Suggestions:**

**Professional Blue Theme:**
• Primary: #3B82F6 (Vibrant Blue)
• Secondary: #1E40AF (Deep Blue)
• Accent: #10B981 (Emerald Green)
• Background: #F9FAFB (Light Gray)
• Text: #1F2937 (Charcoal)

**Creative Purple Theme:**
• Primary: #8B5CF6 (Purple)
• Secondary: #6366F1 (Indigo)
• Accent: #EC4899 (Pink)
• Background: #FAFAFA (Off White)
• Text: #18181B (Near Black)

**Tips:**
- Use 60-30-10 rule: 60% primary, 30% secondary, 10% accent
- Ensure text has sufficient contrast (WCAG AA: 4.5:1 minimum)
- Test colors in both light and dark modes`;
  }
  
  if (lower.includes('layout') || lower.includes('design') || lower.includes('arrange')) {
    return `📐 **Layout Enhancement Tips:**

**Visual Hierarchy:**
• Make the most important element 2-3x larger than others
• Use whitespace to separate different sections
• Align elements to a consistent grid (8px or 12px base)
• Group related items together with proximity

**Spacing Guidelines:**
• Margins: 24-48px from edges
• Between sections: 32-64px
• Between related items: 12-24px
• Line height: 1.5-1.8 for body text

**Best Practices:**
- Follow the F-pattern or Z-pattern for eye flow
- Keep important content above the fold
- Use the rule of thirds for focal points
- Maintain consistent alignment (left, center, or right)`;
  }
  
  if (lower.includes('element') || lower.includes('add') || lower.includes('creative')) {
    return `💡 **Creative Element Suggestions:**

**Visual Enhancements:**
• **Icons**: Add relevant icons to illustrate key points (use Lucide or Heroicons)
• **Shapes**: Use circles, rectangles, or custom shapes as backgrounds
• **Lines & Dividers**: Separate sections with subtle lines or gradients
• **Images**: Include high-quality, relevant images or illustrations
• **Gradients**: Apply modern gradient overlays for depth

**Interactive Elements:**
• Hover effects on important elements
• Subtle animations for engagement
• Progress indicators or badges
• Call-to-action buttons with contrast

**Pro Tips:**
- Less is more - don't overcrowd the design
- Maintain visual balance and symmetry
- Use consistent styling across all elements
- Ensure all additions serve a purpose`;
  }
  
  return `✨ **AI Enhancement Assistant**

I can help you improve your ${prompt.includes('resume') ? 'resume' : prompt.includes('presentation') ? 'presentation' : 'document'} in several ways:

**Content Improvements:**
• Enhance text clarity and impact
• Suggest better wording and structure
• Optimize for readability

**Design Enhancements:**
• Recommend modern color schemes
• Improve layout and spacing
• Suggest visual elements to add

**Best Practices:**
• Industry-standard formatting
• Professional design principles
• Accessibility considerations

**Try asking:**
- "Improve my text content"
- "Suggest a modern color scheme"
- "How can I improve the layout?"
- "What elements should I add?"`;
}
