import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: `Bearer ${token}` } }
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text, targetRole } = await req.json();

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: "Please provide some information about yourself" },
        { status: 400 }
      );
    }

    console.log('🚀 Generating smart resume from:', text.substring(0, 100) + '...');

    // Generate complete resume using AI
    const resume = await generateCompleteResume(text, targetRole);
    
    // Calculate ATS score
    const atsScore = calculateATSScore(resume);

    return NextResponse.json({ 
      success: true,
      resume,
      atsScore,
      message: "Resume generated successfully!"
    });

  } catch (error: any) {
    console.error("Smart resume generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate resume" },
      { status: 500 }
    );
  }
}

async function generateCompleteResume(text: string, targetRole?: string): Promise<any> {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (!geminiApiKey && !openaiApiKey) {
    throw new Error("AI API key not configured");
  }

  const prompt = `You are an expert resume writer and career coach. Generate a COMPLETE, professional, ATS-optimized resume from the following information.

User Input:
${text}

${targetRole ? `Target Role: ${targetRole}` : ''}

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

async function generateWithGemini(apiKey: string, prompt: string): Promise<any> {
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
        }
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Gemini API failed");
  }

  const data = await response.json();
  let content = data.candidates[0]?.content?.parts[0]?.text || '';
  content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  return JSON.parse(content);
}

async function generateWithOpenAI(apiKey: string, prompt: string): Promise<any> {
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
          content: "You are an expert resume writer. Generate complete, professional, ATS-optimized resumes. Always return valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
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

function calculateATSScore(resume: any): any {
  let score = 0;
  const feedback: string[] = [];
  const improvements: string[] = [];

  // Check contact info (20 points)
  const contact = resume.personalInfo || {};
  if (contact.name && contact.name !== 'Your Name') {
    score += 5;
  } else {
    improvements.push("Add your full name");
  }
  
  if (contact.email && contact.email.includes('@')) {
    score += 5;
  } else {
    improvements.push("Add a professional email");
  }
  
  if (contact.phone) {
    score += 5;
  } else {
    improvements.push("Add phone number");
  }
  
  if (contact.location) {
    score += 5;
  } else {
    improvements.push("Add your location");
  }

  // Check professional summary (15 points)
  if (resume.professionalSummary && resume.professionalSummary.length > 100) {
    score += 15;
    feedback.push("✅ Strong professional summary");
  } else {
    score += 5;
    improvements.push("Expand professional summary to 3-4 sentences");
  }

  // Check experience (30 points)
  const exp = resume.experience || [];
  if (exp.length >= 2) {
    score += 10;
    feedback.push("✅ Multiple work experiences listed");
  } else if (exp.length === 1) {
    score += 5;
    improvements.push("Add more work experience");
  } else {
    improvements.push("Add work experience section");
  }

  // Check for quantifiable achievements
  const hasMetrics = exp.some((e: any) => 
    e.achievements?.some((a: string) => /\d+%|\$\d+|\d+\+/.test(a))
  );
  if (hasMetrics) {
    score += 10;
    feedback.push("✅ Includes quantifiable achievements");
  } else {
    improvements.push("Add numbers/metrics to achievements (e.g., 'increased sales by 25%')");
  }

  // Check achievement count
  const totalAchievements = exp.reduce((sum: number, e: any) => 
    sum + (e.achievements?.length || 0), 0
  );
  if (totalAchievements >= 6) {
    score += 10;
    feedback.push("✅ Detailed work achievements");
  } else {
    improvements.push("Add 3-5 achievements per role");
  }

  // Check education (15 points)
  const edu = resume.education || [];
  if (edu.length > 0) {
    score += 10;
    feedback.push("✅ Education included");
    if (edu[0].gpa) {
      score += 5;
      feedback.push("✅ GPA mentioned");
    }
  } else {
    improvements.push("Add education section");
  }

  // Check skills (15 points)
  const skills = resume.skills || {};
  const totalSkills = (skills.technical?.length || 0) + 
                      (skills.soft?.length || 0) + 
                      (skills.tools?.length || 0);
  
  if (totalSkills >= 10) {
    score += 15;
    feedback.push("✅ Comprehensive skills list");
  } else if (totalSkills >= 5) {
    score += 10;
    improvements.push("Add more relevant skills (aim for 10-15)");
  } else {
    score += 5;
    improvements.push("Add technical and soft skills");
  }

  // Check certifications (5 points)
  if (resume.certifications && resume.certifications.length > 0) {
    score += 5;
    feedback.push("✅ Certifications included");
  } else {
    improvements.push("Add relevant certifications if available");
  }

  // Determine grade
  let grade = 'F';
  let color = 'red';
  if (score >= 90) {
    grade = 'A';
    color = 'green';
    feedback.push("🎉 Excellent! Your resume is ATS-optimized");
  } else if (score >= 80) {
    grade = 'B';
    color = 'blue';
    feedback.push("👍 Good! A few tweaks will make it perfect");
  } else if (score >= 70) {
    grade = 'C';
    color = 'yellow';
    feedback.push("⚠️ Decent, but needs improvement");
  } else if (score >= 60) {
    grade = 'D';
    color = 'orange';
    feedback.push("⚠️ Needs significant improvement");
  } else {
    color = 'red';
    feedback.push("❌ Needs major improvements for ATS compatibility");
  }

  return {
    score,
    grade,
    color,
    feedback,
    improvements,
    breakdown: {
      contactInfo: Math.min(20, contact.name && contact.email ? 20 : 10),
      summary: resume.professionalSummary ? 15 : 5,
      experience: Math.min(30, totalAchievements >= 6 ? 30 : 15),
      education: edu.length > 0 ? 15 : 0,
      skills: Math.min(15, totalSkills >= 10 ? 15 : 8),
      certifications: resume.certifications?.length > 0 ? 5 : 0
    }
  };
}
