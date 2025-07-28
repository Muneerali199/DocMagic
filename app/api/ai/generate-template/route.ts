import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { prompt, type } = await request.json();

    if (!prompt || !type) {
      return NextResponse.json(
        { error: 'Prompt and type are required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Create type-specific prompts
    const systemPrompts = {
      resume: `You are an expert resume template creator. Create a professional resume template based on the user's description. Return a JSON object with:
- title: A descriptive title for the template
- description: A brief description of the template
- content: A structured object with resume sections like personalInfo, summary, experience, education, skills, etc.

Make the template modern, ATS-friendly, and professional.`,

      cv: `You are an expert CV template creator. Create an academic CV template based on the user's description. Return a JSON object with:
- title: A descriptive title for the template
- description: A brief description of the template  
- content: A structured object with CV sections like personalInfo, summary, education, research, publications, awards, etc.

Make the template suitable for academic and research positions.`,

      letter: `You are an expert cover letter template creator. Create a professional cover letter template based on the user's description. Return a JSON object with:
- title: A descriptive title for the template
- description: A brief description of the template
- content: A structured object with letter sections like header, salutation, introduction, body, conclusion, closing, etc.

Make the template professional and persuasive.`,

      presentation: `You are an expert presentation template creator. Create a professional presentation template based on the user's description. Return a JSON object with:
- title: A descriptive title for the template
- description: A brief description of the template
- content: A structured object with presentation elements like title, slides array with content, themes, layouts, etc.

Make the template engaging and visually appealing.`
    };

    const systemPrompt = systemPrompts[type as keyof typeof systemPrompts];
    const fullPrompt = `${systemPrompt}

User request: ${prompt}

Please return only valid JSON without any markdown formatting or additional text.`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse the JSON response
    let generatedTemplate;
    try {
      // Remove any markdown formatting if present
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      generatedTemplate = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', text);
      return NextResponse.json(
        { error: 'Failed to generate valid template structure' },
        { status: 500 }
      );
    }

    // Validate the response structure
    if (!generatedTemplate.title || !generatedTemplate.content) {
      return NextResponse.json(
        { error: 'Invalid template structure generated' },
        { status: 500 }
      );
    }

    return NextResponse.json(generatedTemplate);

  } catch (error) {
    console.error('Error generating AI template:', error);
    return NextResponse.json(
      { error: 'Failed to generate template' },
      { status: 500 }
    );
  }
}
