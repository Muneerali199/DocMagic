export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { generateLetterWithMistral, generateCoverLetterFromJob } from '@/lib/mistral';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      prompt, 
      fromName, 
      fromAddress, 
      toName, 
      toAddress, 
      letterType,
      // For job-based cover letter generation
      jobDescription,
      jobUrl,
      fromEmail,
      skills,
      experience
    } = body;

    // Check if this is a job-based cover letter request
    if (jobDescription && fromName) {
      console.log('📝 Generating cover letter from job description with Mistral...');
      
      const coverLetter = await generateCoverLetterFromJob({
        jobDescription,
        jobUrl,
        fromName,
        fromEmail,
        fromAddress,
        skills,
        experience
      });
      
      return NextResponse.json(coverLetter);
    }

    // Standard letter generation
    if (!prompt || !fromName || !toName || !letterType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log(`📝 Generating ${letterType} letter with Mistral...`);

    const letter = await generateLetterWithMistral({
      prompt,
      fromName,
      fromAddress,
      toName,
      toAddress,
      letterType,
    });
    
    // Format the response to ensure it has the expected structure
    const formattedResponse = {
      from: {
        name: letter.from?.name || fromName,
        address: letter.from?.address || fromAddress || ""
      },
      to: {
        name: letter.to?.name || toName,
        address: letter.to?.address || toAddress || ""
      },
      date: letter.date || new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      subject: letter.subject || "Re: " + prompt.substring(0, 30) + "...",
      content: letter.content || letter.letter || "Letter content not available."
    };
    
    console.log('✅ Letter generated successfully with Mistral');
    return NextResponse.json(formattedResponse);
  } catch (error) {
    console.error('Error generating letter:', error);
    return NextResponse.json(
      { error: 'Failed to generate letter', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}