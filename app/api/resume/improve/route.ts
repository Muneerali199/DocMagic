import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { resumeData, userMessage, conversationHistory } = await req.json();

    if (!resumeData || !userMessage) {
      return NextResponse.json(
        { error: "Resume data and message are required" },
        { status: 400 }
      );
    }

    console.log('🤖 AI Improvement request:', userMessage);

    const geminiApiKey = process.env.GEMINI_API_KEY;
    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (!geminiApiKey && !openaiApiKey) {
      throw new Error("AI API key not configured");
    }

    const result = geminiApiKey 
      ? await improveWithGemini(geminiApiKey, resumeData, userMessage, conversationHistory)
      : await improveWithOpenAI(openaiApiKey!, resumeData, userMessage, conversationHistory);

    return NextResponse.json(result);

  } catch (error: any) {
    console.error("AI improvement error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate improvements" },
      { status: 500 }
    );
  }
}

async function improveWithGemini(
  apiKey: string, 
  resumeData: any, 
  userMessage: string,
  conversationHistory: any[]
): Promise<any> {
  const historyContext = conversationHistory?.length > 0
    ? `\n\nPrevious conversation:\n${conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}`
    : '';

  const prompt = `You are an expert resume writer, ATS optimization specialist, and career coach. 
Help improve this resume based on the user's request.

CURRENT RESUME:
${JSON.stringify(resumeData, null, 2)}

USER REQUEST: "${userMessage}"
${historyContext}

INSTRUCTIONS:
1. Provide specific, actionable advice
2. If the user asks for changes, generate updated resume data
3. Focus on ATS optimization, clarity, impact, and professional presentation
4. Use industry-standard keywords and action verbs
5. Ensure achievements are quantifiable and compelling
6. Be encouraging and constructive

Respond with JSON in this format (no markdown, no code blocks):
{
  "advice": "Your detailed, friendly advice here. Be specific and helpful.",
  "updatedResume": {
    // Include FULL updated resume data if making changes
    // Use null if no structural changes needed
  },
  "highlights": [
    "Key improvement 1",
    "Key improvement 2",
    "Key improvement 3"
  ],
  "atsImpact": "Brief note on how this improves ATS score (if applicable)"
}

Examples of good advice:
- "Great start! Let's make your professional summary more impactful by adding specific metrics..."
- "Your experience section is strong. Here's how to make it even better for ATS..."
- "I've enhanced your achievements to be more quantifiable and action-oriented..."`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
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

async function improveWithOpenAI(
  apiKey: string,
  resumeData: any,
  userMessage: string,
  conversationHistory: any[]
): Promise<any> {
  const messages = [
    {
      role: "system",
      content: "You are an expert resume writer and ATS optimization specialist. Provide specific, actionable advice and generate improved resume data when requested. Always return valid JSON."
    },
    ...(conversationHistory || []),
    {
      role: "user",
      content: `Current Resume:\n${JSON.stringify(resumeData, null, 2)}\n\nUser Request: ${userMessage}`
    }
  ];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      response_format: { type: "json_object" },
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    throw new Error("OpenAI API failed");
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}
