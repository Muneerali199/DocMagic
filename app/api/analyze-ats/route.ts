import { NextResponse } from 'next/server';

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY || 'uigxEfcnKHPP1wvBkiAjQC0yqSB6a1iQ';

export async function POST(request: Request) {
  try {
    const { resumeText, jobDescription } = await request.json();

    if (!resumeText || resumeText.trim().length < 20) {
      return NextResponse.json(
        { error: 'Resume text is required and must be at least 20 characters' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert ATS (Applicant Tracking System) analyzer. Analyze the provided resume text and return a detailed ATS compatibility score with actionable suggestions.

You MUST respond with a valid JSON object in this exact format:
{
  "score": <number 0-100>,
  "grade": "<A/B/C/D/F>",
  "summary": "<one sentence summary of the resume quality>",
  "categories": {
    "formatting": <number 0-100>,
    "keywords": <number 0-100>,
    "experience": <number 0-100>,
    "skills": <number 0-100>,
    "education": <number 0-100>,
    "contact_info": <number 0-100>
  },
  "suggestions": [
    "<suggestion 1>",
    "<suggestion 2>",
    "<suggestion 3>",
    "<suggestion 4>",
    "<suggestion 5>"
  ],
  "keywords_found": ["<keyword1>", "<keyword2>", ...],
  "keywords_missing": ["<keyword1>", "<keyword2>", ...]
}

Scoring Criteria:
- Formatting (20%): Clean structure, proper sections, no tables/graphics that confuse ATS
- Keywords (25%): Industry-specific terms, action verbs, skills matching
- Experience (20%): Clear job titles, quantifiable achievements, relevant experience
- Skills (15%): Technical and soft skills listed clearly
- Education (10%): Proper formatting of degrees and certifications
- Contact Info (10%): Complete and properly formatted contact details

Grade Scale:
- A: 85-100 (Excellent ATS compatibility)
- B: 70-84 (Good, minor improvements needed)
- C: 55-69 (Fair, several improvements recommended)
- D: 40-54 (Poor, significant changes needed)
- F: 0-39 (Very poor, major restructuring required)

IMPORTANT: Return ONLY the JSON object, no additional text or markdown.`;

    const userPrompt = jobDescription 
      ? `Analyze this resume for ATS compatibility, considering the target job description.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}`
      : `Analyze this resume for ATS compatibility:

RESUME:
${resumeText}`;

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Mistral API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to analyze resume. Please try again.' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: 'No analysis result received' },
        { status: 500 }
      );
    }

    // Parse the JSON response
    let analysisResult;
    try {
      // Try to extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse analysis result:', content);
      // Return a default analysis if parsing fails
      analysisResult = {
        score: 65,
        grade: 'C',
        summary: 'Resume analyzed but detailed parsing was limited.',
        categories: {
          formatting: 70,
          keywords: 60,
          experience: 65,
          skills: 65,
          education: 70,
          contact_info: 75
        },
        suggestions: [
          'Add more industry-specific keywords',
          'Include quantifiable achievements',
          'Ensure contact information is complete',
          'Use clear section headers',
          'Add relevant skills section'
        ],
        keywords_found: [],
        keywords_missing: ['action verbs', 'metrics', 'achievements']
      };
    }

    return NextResponse.json(analysisResult);

  } catch (error) {
    console.error('ATS analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze resume. Please try again.' },
      { status: 500 }
    );
  }
}
