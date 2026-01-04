export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'Job URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Fetch the job listing page content with timeout
    let pageContent = '';
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Cache-Control': 'no-cache',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.status}`);
      }

      pageContent = await response.text();
    } catch (fetchError: any) {
      console.error('Error fetching job URL:', fetchError);
      
      // Provide more helpful error messages
      let errorMessage = 'Failed to fetch job listing.';
      if (fetchError.name === 'AbortError' || fetchError.code === 'UND_ERR_CONNECT_TIMEOUT') {
        errorMessage = 'The job site is taking too long to respond. Please try a different job listing URL (LinkedIn, Indeed, or direct company career pages work best).';
      } else if (fetchError.message?.includes('ENOTFOUND')) {
        errorMessage = 'Could not find the website. Please check the URL is correct.';
      } else {
        errorMessage = 'The job site may be blocking automated requests. Try pasting the job description text directly in the manual input instead.';
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    // Clean up HTML - remove scripts, styles, and extract text
    const cleanContent = pageContent
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 15000); // Limit content length

    // Use Mistral API to extract job information
    const prompt = `Analyze this job listing content and extract the following information in JSON format:

{
  "title": "Job title",
  "company": "Company name",
  "location": "Job location",
  "type": "Full-time/Part-time/Contract/etc",
  "experience": "Required years of experience",
  "salary": "Salary range if mentioned",
  "skills": ["Array of required skills/technologies"],
  "requirements": ["Array of key job requirements"],
  "responsibilities": ["Array of main job responsibilities"],
  "qualifications": ["Array of required qualifications"],
  "benefits": ["Array of benefits if mentioned"],
  "keywords": ["Important ATS keywords from the listing"]
}

Job listing content:
${cleanContent}

Return ONLY the JSON object, no markdown formatting or additional text.`;

    const mistralResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 2000,
      }),
    });

    if (!mistralResponse.ok) {
      const errorData = await mistralResponse.text();
      console.error('Mistral API error:', errorData);
      throw new Error(`Mistral API error: ${mistralResponse.status}`);
    }

    const mistralData = await mistralResponse.json();
    const text = mistralData.choices?.[0]?.message?.content || '';

    // Parse the JSON response
    let jobData;
    try {
      // Clean up the response if it has markdown code blocks
      const cleanedText = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      // Try to extract JSON from the response
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jobData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing job data:', parseError);
      // Return a basic structure if parsing fails
      jobData = {
        title: 'Unable to extract job title',
        company: 'Unknown',
        skills: [],
        requirements: [],
        keywords: [],
        rawContent: cleanContent.slice(0, 2000),
      };
    }

    return NextResponse.json(jobData);
  } catch (error) {
    console.error('Error extracting job data:', error);
    return NextResponse.json(
      { error: 'Failed to extract job data. Please try again.' },
      { status: 500 }
    );
  }
}
