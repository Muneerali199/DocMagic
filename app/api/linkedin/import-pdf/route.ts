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

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a PDF file." },
        { status: 400 }
      );
    }

    // Read the PDF file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convert PDF to text using AI
    // We'll use OpenAI's GPT-4 Vision or a PDF parsing library
    const pdfText = await parsePdfToText(buffer);

    // Use AI to extract structured data from the PDF text
    const profile = await extractProfileFromText(pdfText);

    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error("LinkedIn PDF import error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to parse LinkedIn PDF" },
      { status: 500 }
    );
  }
}

// Helper function to parse PDF to text
async function parsePdfToText(buffer: Buffer): Promise<string> {
  // Using pdf-parse library
  try {
    const pdfParse = require("pdf-parse");
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error("PDF parsing error:", error);
    throw new Error("Failed to parse PDF file");
  }
}

// Helper function to extract structured profile data from text using AI
async function extractProfileFromText(text: string): Promise<any> {
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (!openaiApiKey) {
    throw new Error("OpenAI API key not configured");
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert at extracting structured information from LinkedIn profiles. 
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

Extract as much information as possible. If a field is not found, omit it or use null/empty array.`,
          },
          {
            role: "user",
            content: `Extract structured profile information from this LinkedIn profile text:\n\n${text}`,
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
