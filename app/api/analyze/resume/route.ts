import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

async function extractTextFromFile(file: File): Promise<string> {
  // Mock: Just read as text (you can extend with real parsers)
  return await file.text();
}

function calculateKeywordMatch(jobKeywords: string[], resumeWords: string[]) {
  const jobSet = new Set(jobKeywords);
  const resumeSet = new Set(resumeWords);

  const foundKeywords = Array.from(jobSet).filter(kw => resumeSet.has(kw));
  const missingKeywords = Array.from(jobSet).filter(kw => !resumeSet.has(kw));

  const score = jobSet.size > 0
    ? Math.min(100, Math.round((foundKeywords.length / jobSet.size) * 100))
    : 0;

  return { found: foundKeywords, missing: missingKeywords, score };
}

function calculateSectionPresence(resumeText: string) {
  const sections = [
    { name: 'experience', keywords: ['experience', 'work history', 'employment'] },
    { name: 'education', keywords: ['education', 'degree', 'university'] },
    { name: 'skills', keywords: ['skills', 'competencies', 'technologies'] },
    { name: 'summary', keywords: ['summary', 'profile', 'objective'] },
  ];
  const text = resumeText.toLowerCase();

  return sections.map(section => ({
    name: section.name,
    score: section.keywords.some(kw => text.includes(kw)) ? 100 : 0,
  }));
}

function calculateFormattingScore(resumeText: string) {
  const hasBulletPoints = /•|⦿|◦|‣|⁃|∙|○|▪|◾|⦾/.test(resumeText);
  const hasHeadings = /\n\s*[A-Z][A-Z ]+\s*\n/.test(resumeText);
  const hasDates = /(20\d{2}|19\d{2})/.test(resumeText);

  let score = 50;
  if (hasBulletPoints) score += 15;
  if (hasHeadings) score += 15;
  if (hasDates) score += 20;

  return Math.min(100, score);
}

function generateImprovements(analysis: any) {
  const critical: string[] = [];
  const recommended: string[] = [];
  const aiSuggestions: string[] = [];

  if (analysis.keywordMatch.score < 70) {
    critical.push(`Add ${Math.ceil(analysis.keywordMatch.missing.length * 0.7)} more keywords from the job description.`);
  }

  analysis.sectionScores.forEach((section: any) => {
    if (section.score === 0) {
      critical.push(`Add a dedicated ${section.name} section.`);
    }
  });

  if (analysis.formattingScore < 70) {
    recommended.push("Improve formatting with clear headings and bullet points.");
  }

  if (analysis.keywordMatch.score < 85) {
    aiSuggestions.push(`Consider adding these keywords: ${analysis.keywordMatch.missing.slice(0, 5).join(', ')}.`);
  }
  if (analysis.sectionScores.every((s: any) => s.score > 0)) {
    aiSuggestions.push("Good job including all key sections! Focus on quantifying achievements.");
  }

  return { critical, recommended, aiSuggestions };
}

export async function POST(request: Request) {
  const headers = {
    'Access-Control-Allow-Origin': 'https://draftdeckai.com',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { headers });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const jobDescription = formData.get('jobDescription') as string | null;

    if (!file || !jobDescription) {
      return NextResponse.json({ error: 'Resume file and job description are required' }, { status: 400, headers });
    }

    const resumeText = await extractTextFromFile(file);

    const jobKeywords = (jobDescription.toLowerCase().match(/\b[\w-]{3,}\b/g) || []);
    const resumeWords = (resumeText.toLowerCase().match(/\b[\w-]{3,}\b/g) || []);

    const keywordMatch = calculateKeywordMatch(jobKeywords, resumeWords);
    const sectionScores = calculateSectionPresence(resumeText);
    const formattingScore = calculateFormattingScore(resumeText);

    const overallScore = Math.max(20, Math.round(
      (keywordMatch.score * 0.6) +
      ((sectionScores.reduce((sum, s) => sum + s.score, 0) / sectionScores.length) * 0.3) +
      (formattingScore * 0.1)
    ));

    const improvements = generateImprovements({ keywordMatch, sectionScores, formattingScore });

    return NextResponse.json({
      success: true,
      score: overallScore,
      analysis: {
        keywordMatch,
        sectionScores: Object.fromEntries(sectionScores.map(s => [s.name, s.score])),
        formattingScore,
      },
      improvements,
    }, { headers });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers });
  }
}