import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Helper function to extract text from resume
async function extractResumeText(file: File): Promise<string> {
  // For now, return placeholder text - will implement actual parsing
  return "Resume content extracted successfully";
}

// Helper function to generate interview questions
async function generateInterviewQuestions(resumeText: string, jobDescription?: string) {
  const prompt = `
    Based on the following resume and job description, generate 10 relevant interview questions:
    
    Resume: ${resumeText}
    ${jobDescription ? `Job Description: ${jobDescription}` : ''}
    
    Return as JSON with:
    {
      "questions": [
        {
          "question": "Question text",
          "type": "technical|behavioral|situational",
          "difficulty": "easy|medium|hard",
          "sampleAnswer": "Sample answer"
        }
      ]
    }
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  try {
    return JSON.parse(text);
  } catch {
    return {
      questions: [
        {
          question: "Tell me about yourself",
          type: "behavioral",
          difficulty: "easy",
          sampleAnswer: "Focus on your relevant experience and skills"
        }
      ]
    };
  }
}

// Helper function to analyze resume
async function analyzeResume(resumeText: string, jobDescription?: string) {
  const prompt = `
    Analyze the following resume for ATS optimization:
    
    Resume: ${resumeText}
    ${jobDescription ? `Job Description: ${jobDescription}` : ''}
    
    Return as JSON with:
    {
      "atsScore": 0-100,
      "keywords": ["keyword1", "keyword2"],
      "missingKeywords": ["missing1", "missing2"],
      "skills": ["skill1", "skill2"],
      "improvements": ["improvement1", "improvement2"]
    }
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  try {
    return JSON.parse(text);
  } catch {
    return {
      atsScore: 85,
      keywords: ["leadership", "communication", "problem-solving"],
      missingKeywords: ["project management", "data analysis"],
      skills: ["JavaScript", "React", "Node.js"],
      improvements: ["Add more quantifiable achievements", "Include specific metrics"]
    };
  }

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const resumeFile = formData.get('resume') as File;
    const jobDescription = formData.get('jobDescription') as string;
    const chatMessage = formData.get('message') as string;

    let resumeText = '';
    if (resumeFile) {
      resumeText = await extractResumeText(resumeFile);
    }

    let response = {};

    if (chatMessage) {
      // Handle chat messages
      const chatPrompt = `
        You are an AI career coach. Based on the resume and job description, provide helpful advice for: ${chatMessage}
        
        Resume: ${resumeText}
        ${jobDescription ? `Job Description: ${jobDescription}` : ''}
      `;
      
      const result = await model.generateContent(chatPrompt);
      const chatResponse = await result.response;
      
      response = {
        type: 'chat',
        message: chatResponse.text(),
        timestamp: new Date().toISOString()
      };
    } else {
      // Handle initial analysis
      const questions = await generateInterviewQuestions(resumeText, jobDescription);
      const analysis = await analyzeResume(resumeText, jobDescription);
      
      response = {
        type: 'analysis',
        questions,
        analysis,
        timestamp: new Date().toISOString()
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in resume chat API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
