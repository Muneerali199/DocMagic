import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { calculateATSScore } from "@/lib/atsScorer";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: `Bearer ${token}` } },
      },
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text, targetRole } = await req.json();

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: "Please provide some information about yourself" },
        { status: 400 },
      );
    }

    // console.log('🚀 Generating smart resume from:', text.substring(0, 100) + '...');

    // Generate complete resume using AI
    const resume = await generateCompleteResume(text, targetRole);

    // Calculate ATS score
    const atsScore = calculateATSScore(resume);

    return NextResponse.json({
      success: true,
      resume,
      atsScore,
      message: "Resume generated successfully!",
    });
  } catch (error: any) {
    logger.error(
      { route: "app/api/resume/generate-smart/route.ts" },
      "Smart resume generation error:",
      error,
    );
    return NextResponse.json(
      { error: error.message || "Failed to generate resume" },
      { status: 500 },
    );
  }
}

async function generateCompleteResume(
  text: string,
  targetRole?: string,
): Promise<any> {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (!geminiApiKey && !openaiApiKey) {
    throw new Error("AI API key not configured");
  }

  const prompt = `You are an expert resume writer and career coach. Generate a COMPLETE, professional, ATS-optimized resume from the following information.

User Input:
${text}

${targetRole ? `Target Role: ${targetRole}` : ""}

IMPORTANT INSTRUCTIONS:
1. Create a COMPLETE resume even if the input is minimal (e.g., just a name or job title)
2. Infer reasonable professional details based on the role/industry mentioned
3. Make it ATS-friendly with clear sections and keywords
4. Include quantifiable achievements (use realistic numbers)
5. Make descriptions compelling and action-oriented
6. Ensure all sections are filled with professional content

Generate and return ONLY valid JSON with this structure (no markdown, no code blocks):
{
  "personalInfo": {
    "name": "Full Name (if provided, else 'Your Name')",
    "email": "professional.email@example.com (generate realistic one if not provided)",
    "phone": "+1 (555) 123-4567 (generate realistic format if not provided)",
    "location": "City, State (infer from context or use 'New York, NY')",
    "linkedin": "linkedin.com/in/profile (generate if not provided)",
    "portfolio": "Optional portfolio URL"
  },
  "professionalSummary": "Compelling 3-4 sentence professional summary highlighting key skills, experience, and value proposition. Make it specific to the role mentioned or inferred.",
  "experience": [
    {
      "position": "Job Title",
      "company": "Company Name",
      "location": "City, State",
      "startDate": "Jan 2020",
      "endDate": "Present",
      "current": true,
      "achievements": [
        "Led team of X professionals, achieving Y% improvement in Z",
        "Implemented A resulting in B outcome with C% increase",
        "Managed $X budget and delivered Y projects on time"
      ]
    },
    {
      "position": "Previous Role",
      "company": "Previous Company",
      "location": "City, State",
      "startDate": "Jan 2018",
      "endDate": "Dec 2019",
      "current": false,
      "achievements": [
        "Achievement with specific metrics",
        "Another quantifiable accomplishment",
        "Third measurable result"
      ]
    }
  ],
  "education": [
    {
      "degree": "Bachelor of Science in Computer Science",
      "school": "University Name",
      "location": "City, State",
      "graduationDate": "2018",
      "gpa": "3.8/4.0",
      "honors": "Cum Laude, Dean's List"
    }
  ],
  "skills": {
    "technical": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"],
    "soft": ["Leadership", "Communication", "Problem Solving", "Team Collaboration"],
    "tools": ["Tool 1", "Tool 2", "Tool 3"]
  },
  "certifications": [
    {
      "name": "Relevant Certification",
      "issuer": "Issuing Organization",
      "date": "2023",
      "credentialId": "ABC123"
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "Brief description of the project and your role",
      "technologies": ["Tech 1", "Tech 2"],
      "impact": "Quantifiable impact or outcome",
      "url": "github.com/project"
    }
  ],
  "languages": [
    {"name": "English", "proficiency": "Native"},
    {"name": "Spanish", "proficiency": "Professional"}
  ]
}

CRITICAL:
- If user provides minimal info (just name/role), CREATE complete professional content
- Use industry-standard keywords for ATS optimization
- Make achievements specific and quantifiable
- Ensure professional formatting and grammar
- Include at least 2 work experiences, 1 education, 5 skills, and 1 certification`;

  if (geminiApiKey) {
    return await generateWithGemini(geminiApiKey, prompt);
  }
  return await generateWithOpenAI(openaiApiKey!, prompt);
}

async function generateWithGemini(
  apiKey: string,
  prompt: string,
): Promise<any> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error("Gemini API failed");
  }

  const data = await response.json();
  let content = data.candidates[0]?.content?.parts[0]?.text || "";
  content = content
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  return JSON.parse(content);
}

async function generateWithOpenAI(
  apiKey: string,
  prompt: string,
): Promise<any> {
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
          content:
            "You are an expert resume writer. Generate complete, professional, ATS-optimized resumes. Always return valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error("OpenAI API failed");
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}
