export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

function extractJsonFromMarkdown(text: string): string {
  // Remove markdown code blocks
  let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  
  // Try to find JSON object/array
  const jsonMatch = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (jsonMatch) {
    return jsonMatch[0];
  }
  
  return cleaned;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slides, instruction, template, originalPrompt } = body;

    console.log('Modify presentation request:', { 
      slideCount: slides?.length, 
      instruction, 
      template 
    });

    if (!slides || !instruction) {
      return NextResponse.json(
        { error: 'Missing slides or instruction' },
        { status: 400 }
      );
    }

    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: 'Google API key not configured' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      }
    });

    // Simplify slides for the prompt (remove base64 images to reduce token count)
    const simplifiedSlides = slides.map((slide: any) => ({
      ...slide,
      image: slide.image ? '[IMAGE_DATA]' : undefined
    }));

    const prompt = `You are an expert presentation editor. Modify the presentation based on the user's instruction.

CONTEXT:
- Original Topic: "${originalPrompt}"
- Template: ${template}
- User Request: "${instruction}"

CURRENT SLIDES (${slides.length} slides):
${JSON.stringify(simplifiedSlides, null, 2)}

TASK:
Modify the slides according to the user's instruction. Keep these rules:
1. Maintain slide structure (id, layout, slideNumber, template)
2. Keep images and charts UNLESS user explicitly asks to change them
3. Make targeted changes based on the instruction
4. Keep the same number of slides unless explicitly asked to add/remove
5. Maintain professional quality

OUTPUT FORMAT:
Return ONLY a valid JSON object (no markdown, no code blocks):
{
  "modifiedSlides": [array of complete modified slides],
  "explanation": "Brief explanation of what was changed"
}

IMPORTANT: Return ONLY the JSON object, nothing else.`;

    console.log('Sending request to Gemini...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    console.log('Raw response from Gemini:', text.substring(0, 200));

    // Extract and clean JSON
    text = extractJsonFromMarkdown(text);

    // Parse JSON
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Text that failed to parse:', text.substring(0, 500));
      throw new Error('Failed to parse AI response as JSON');
    }

    // Restore original images in modified slides
    if (data.modifiedSlides) {
      data.modifiedSlides = data.modifiedSlides.map((modifiedSlide: any, index: number) => {
        const originalSlide = slides[index];
        return {
          ...modifiedSlide,
          image: modifiedSlide.image === '[IMAGE_DATA]' && originalSlide 
            ? originalSlide.image 
            : modifiedSlide.image
        };
      });
    }

    console.log('Successfully modified presentation');
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error modifying presentation:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    
    console.error('Error details:', { errorMessage, errorStack });
    
    return NextResponse.json(
      { 
        error: 'Failed to modify presentation', 
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
