import type { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Helper function to create responses
function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// System prompt to guide the AI's responses
const SYSTEM_PROMPT = `You are an expert resume reviewer and career coach. Your goal is to help users improve their resumes by providing specific, actionable feedback and suggestions. When reviewing a resume, consider the following aspects:

1. **Content Quality**: Is the content clear, concise, and achievement-oriented? Look for vague language and suggest stronger action verbs.
2. **ATS Optimization**: Does the resume contain relevant keywords for the target job? Suggest industry-specific terms that might be missing.
3. **Formatting**: Is the resume well-structured and easy to scan? Point out any formatting inconsistencies.
4. **Impact**: Do the bullet points demonstrate quantifiable achievements? Help strengthen weak bullet points.
5. **Customization**: Is the resume tailored for the target role? Suggest role-specific improvements.

When providing feedback:
- Be constructive and specific
- Give examples of how to improve each point
- Focus on the most important areas for improvement first
- Maintain a supportive and encouraging tone`;

export async function POST(req: Request) {
  try {
    const { message, resumeContent, conversationHistory } = await req.json();

    if (!message?.trim()) {
      return jsonResponse({ error: "Message is required" }, 400);
    }

    // Get the Gemini Pro model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Prepare the conversation history for the AI
    const chatHistory = [
      {
        role: "user",
        parts: [
          {
            text: `You are a helpful AI assistant that helps users improve their resumes. The user's current resume content is:
            
            ${resumeContent || 'No resume content provided.'}
            
            Please provide specific, actionable suggestions to improve this resume based on the user's message.`,
          },
        ],
      },
      {
        role: "model",
        parts: [{ text: "I understand. I'll help you improve your resume. What specific changes would you like to make?" }],
      },
      ...(conversationHistory || []).map((msg: any) => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      })),
    ];

    // Start a chat session
    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    // Send the user's message
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    // Return the AI's response
    return jsonResponse({ response: text });
  } catch (error) {
    console.error("Error in chat API:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
}

export const dynamic = 'force-dynamic';
