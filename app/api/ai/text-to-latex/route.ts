import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, documentType } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Convert the following resume text into professional LaTeX code. 
Use the article document class with appropriate packages for a modern resume.
Include proper formatting, sections, and styling.
Make it ATS-friendly and professional.

Resume text:
${text}

Generate complete LaTeX code that can be compiled directly.`;

    try {
      // Generate LaTeX with AI
      const result = await model.generateContent(prompt);
      const response = result.response;
      const latexCode = response.text();

      // Clean up the response (remove markdown code blocks if present)
      let cleanLatex = latexCode;
      if (cleanLatex.includes('```latex')) {
        cleanLatex = cleanLatex.split('```latex')[1].split('```')[0].trim();
      } else if (cleanLatex.includes('```')) {
        cleanLatex = cleanLatex.split('```')[1].split('```')[0].trim();
      }

      return NextResponse.json({
        latex: cleanLatex,
        timestamp: new Date().toISOString()
      });
    } catch (aiError) {
      console.error('AI generation failed, using fallback:', aiError);
      // Fallback: Generate basic LaTeX
      const fallbackLatex = generateFallbackLatex(text);
      return NextResponse.json({
        latex: fallbackLatex,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error: any) {
    console.error('Error in text-to-latex:', error);
    
    // Return fallback response
    const fallbackLatex = generateFallbackLatex(body?.text || '');
    return NextResponse.json({
      latex: fallbackLatex,
      timestamp: new Date().toISOString()
    });
  }
}

function generateFallbackLatex(text: string): string {
  const lines = text.split('\n');
  
  let latex = `\\documentclass[11pt,a4paper,sans]{moderncv}
\\moderncvstyle{banking}
\\moderncvcolor{blue}
\\usepackage[utf8]{inputenc}
\\usepackage[scale=0.85]{geometry}

\\name{Your}{Name}
\\title{Resume}
\\email{your.email@example.com}
\\phone{+1 234 567 8900}

\\begin{document}
\\makecvtitle

`;

  let currentSection = '';
  
  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) {
      latex += '\n';
    } else if (trimmed.startsWith('# ')) {
      // Main heading
      const heading = trimmed.substring(2);
      if (heading.toLowerCase().includes('name') || heading.toLowerCase().includes('contact')) {
        // Skip, handled in preamble
      } else {
        latex += `\\section{${heading}}\n`;
        currentSection = heading.toLowerCase();
      }
    } else if (trimmed.startsWith('## ')) {
      // Subsection
      latex += `\\subsection{${trimmed.substring(3)}}\n`;
    } else if (trimmed.startsWith('- ')) {
      // Bullet point
      latex += `\\cvitem{}{${trimmed.substring(2)}}\n`;
    } else if (trimmed.includes('@')) {
      // Email
      latex += `\\email{${trimmed}}\n`;
    } else if (trimmed.match(/\d{3}[-\s]?\d{3}[-\s]?\d{4}/)) {
      // Phone number
      latex += `\\phone{${trimmed}}\n`;
    } else {
      // Regular text
      latex += `${trimmed}\n\n`;
    }
  });

  latex += '\\end{document}';
  return latex;
}
