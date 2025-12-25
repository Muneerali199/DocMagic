export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { generateLetter } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, fromName, fromAddress, toName, toAddress, letterType } = body;

    if (!prompt || !fromName || !toName || !letterType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const letter = await generateLetter({
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
      content: letter.content || "Letter content not available."
    };
    
    return NextResponse.json(formattedResponse);
  } catch (error) {
    console.error('Error generating letter:', error);
    return NextResponse.json(
      { error: 'Failed to generate letter' },
      { status: 500 }
    );
  }
}