const { NextResponse } = require('next/server');
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    // Get authorization header
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    // Create Supabase client with the access token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    );

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const { text } = await req.json();

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: "Text content is required" },
        { status: 400 }
      );
    }

    // Use AI to extract structured profile data from the text
    const profile = await extractProfileFromText(text);

    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error("Text parsing error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to parse profile data" },
      { status: 500 }
    );
  }
}

// Helper function to extract structured profile data from text using AI
async function extractProfileFromText(text: string): Promise<any> {
  // Try Gemini first, fallback to OpenAI
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (!geminiApiKey && !openaiApiKey) {
    throw new Error("AI API key not configured. Please add GEMINI_API_KEY or OPENAI_API_KEY to your .env file");
  }

  // Use Gemini if available
  if (geminiApiKey) {
    return await extractWithGemini(geminiApiKey, text);
  }

  // Fallback to OpenAI
  return await extractWithOpenAI(openaiApiKey!, text);
}

// Extract profile using Gemini AI
async function extractWithGemini(apiKey: string, text: string): Promise<any> {
  const prompt = `Extract structured profile data from this text and return it as JSON.

Text:
${text}

Extract and return ONLY valid JSON with this exact structure (no markdown, no explanations):
{
  "personalInfo": {
    "name": "Full Name",
    "email": "email@example.com",
    "phone": "phone number",
    "location": "City, State/Country",
    "linkedin": "LinkedIn URL if found",
    "website": "Personal website if found"
  },
  "summary": "Professional summary or bio",
  "experience": [
    {
      "position": "Job Title",
      "company": "Company Name",
      "location": "City, State",
      "startDate": "Month Year",
      "endDate": "Month Year or Present",
      "description": "Job responsibilities and achievements",
      "highlights": ["Achievement 1", "Achievement 2"]
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "field": "Field of Study",
      "school": "School Name",
      "location": "City, State",
      "year": "Graduation Year",
      "gpa": "GPA if mentioned"
    }
  ],
  "skills": ["Skill 1", "Skill 2", "Skill 3"],
  "certifications": [
    {
      "name": "Certification Name",
      "issuer": "Issuing Organization",
      "date": "Issue Date"
    }
  ],
  "languages": ["Language 1", "Language 2"],
  "projects": [
    {
      "name": "Project Name",
      "description": "Project description",
      "technologies": ["Tech 1", "Tech 2"],
      "url": "Project URL if available"
    }
  ]
}

If any section is not found in the text, use empty arrays [] or empty strings "". Be thorough and extract all available information.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.2,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          }
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Gemini API request failed");
    }

    const data = await response.json();
    let content = data.candidates[0]?.content?.parts[0]?.text || '';

    // Clean up Gemini response (remove markdown code blocks if present)
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parse JSON
    const profileData = JSON.parse(content);
    return profileData;
  } catch (error: any) {
    console.error("Gemini parsing error:", error);
    throw new Error(`Failed to parse profile with Gemini: ${error.message}`);
  }
}

// Extract profile using OpenAI (fallback)
async function extractWithOpenAI(apiKey: string, text: string): Promise<any> {
  const prompt = `Extract structured profile data from this text.

Text:
${text}

Extract all available information including: personal info, summary, experience, education, skills, certifications, languages, and projects.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert at extracting structured information from professional profiles, resumes, and LinkedIn data. 
Extract all relevant information and return it in a structured JSON format with the following schema:
{
  "name": "Full Name",
  "headline": "Professional headline/title",
  "summary": "Professional summary/about section",
  "email": "email@example.com",
  "phone": "phone number if available",
  "location": "City, State/Country",
  "website": "personal website if available",
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "location": "City, State",
      "startDate": "Month Year",
      "endDate": "Month Year or null if current",
      "description": "Job description and achievements",
      "current": true/false
    }
  ],
  "education": [
    {
      "school": "School Name",
      "degree": "Degree Type",
      "field": "Field of Study",
      "startDate": "Year",
      "endDate": "Year",
      "description": "Additional details if available"
    }
  ],
  "skills": ["skill1", "skill2", "skill3"],
  "certifications": [
    {
      "name": "Certification Name",
      "issuer": "Issuing Organization",
      "date": "Date if available"
    }
  ],
  "languages": [
    {
      "name": "Language Name",
      "proficiency": "Proficiency Level"
    }
  ]
}

Extract as much information as possible from the provided text. If a field is not found, omit it or use null/empty array.
Be intelligent about parsing different formats - the text might be from LinkedIn, a resume, or free-form text.
Infer missing information where reasonable (e.g., if someone says "currently working at X", mark current as true).`,
          },
          {
            role: "user",
            content: `Extract structured profile information from this text:\n\n${text}`,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "AI extraction failed");
    }

    const data = await response.json();
    const profileData = JSON.parse(data.choices[0].message.content);

    return profileData;
  } catch (error: any) {
    console.error("AI extraction error:", error);
    throw new Error("Failed to extract profile data: " + error.message);
  }
}
