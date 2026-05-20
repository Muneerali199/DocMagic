import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

async function extractTextFromFile(file: File): Promise<string> {
  return await file.text();
}

function calculateKeywordMatch(jobKeywords: string[], resumeWords: string[]) {
  const jobSet = new Set(jobKeywords);
  const resumeSet = new Set(resumeWords);

  const foundKeywords = Array.from(jobSet).filter((kw) =>
    resumeSet.has(kw)
  );

  const missingKeywords = Array.from(jobSet).filter(
    (kw) => !resumeSet.has(kw)
  );

  const score =
    jobSet.size > 0
      ? Math.min(
          100,
          Math.round((foundKeywords.length / jobSet.size) * 100)
        )
      : 0;

  return {
    found: foundKeywords,
    missing: missingKeywords,
    score,
  };
}

function calculateSectionPresence(
  resumeText: string,
  resumeWords: string[],
  jobKeywords: string[]
) {
  const sections = [
    {
      name: 'experience',
      keywords: ['experience', 'work history', 'employment'],
      relatedKeywords: ['developer', 'engineer', 'intern', 'project'],
    },
    {
      name: 'education',
      keywords: ['education', 'degree', 'university'],
      relatedKeywords: ['btech', 'college', 'cgpa'],
    },
    {
      name: 'skills',
      keywords: ['skills', 'technologies', 'competencies'],
      relatedKeywords: ['react', 'typescript', 'node', 'python'],
    },
    {
      name: 'summary',
      keywords: ['summary', 'profile', 'objective'],
      relatedKeywords: ['developer', 'software', 'frontend'],
    },
    {
      name: 'projects',
      keywords: ['projects', 'personal projects'],
      relatedKeywords: ['github', 'api', 'application'],
    },
  ];

  const text = resumeText.toLowerCase();

  return sections.map((section) => {
    const hasSection = section.keywords.some((kw) =>
      text.includes(kw)
    );

    const matchedKeywords = section.relatedKeywords.filter((kw) =>
      resumeWords.includes(kw)
    );

    const relevantJobKeywords = jobKeywords.filter((kw) =>
      section.relatedKeywords.includes(kw)
    );

    const keywordScore =
      relevantJobKeywords.length > 0
        ? Math.round(
            (matchedKeywords.length / relevantJobKeywords.length) * 100
          )
        : 70;

    const sectionScore = hasSection
      ? Math.min(100, 50 + keywordScore / 2)
      : 0;

    return {
      name: section.name,
      score: sectionScore,
      foundKeywords: matchedKeywords,
      missingKeywords: relevantJobKeywords.filter(
        (kw) => !matchedKeywords.includes(kw)
      ),
      suggestions:
        sectionScore < 70
          ? [
              `Improve ${section.name} section`,
              `Add more relevant keywords`,
            ]
          : [`Good ${section.name} section`],
    };
  });
}

function calculateFormattingScore(resumeText: string) {
  const hasBulletPoints = /•|⦿|◦|‣|⁃|∙|○|▪|◾|⦾/.test(resumeText);

  const hasHeadings = /\n\s*[A-Z][A-Z ]+\s*\n/.test(resumeText);

  const hasDates = /(20\d{2}|19\d{2})/.test(resumeText);

  const hasGoodLength = resumeText.length > 500;

  let score = 40;

  if (hasBulletPoints) score += 20;
  if (hasHeadings) score += 20;
  if (hasDates) score += 10;
  if (hasGoodLength) score += 10;

  return {
    score: Math.min(100, score),
    checks: {
      bulletPoints: hasBulletPoints,
      headings: hasHeadings,
      dates: hasDates,
      contentLength: hasGoodLength,
    },
  };
}

function generateImprovements(analysis: any) {
  const critical: string[] = [];
  const recommended: string[] = [];
  const aiSuggestions: string[] = [];

  if (analysis.keywordMatch.score < 70) {
    critical.push(
      `Add ${Math.ceil(
        analysis.keywordMatch.missing.length * 0.7
      )} more keywords from the job description.`
    );
  }

  analysis.sectionScores.forEach((section: any) => {
    if (section.score < 60) {
      critical.push(
        `Improve ${section.name} section by adding stronger content and keywords.`
      );
    }

    if (section.missingKeywords.length > 0) {
      recommended.push(
        `Add keywords in ${section.name}: ${section.missingKeywords
          .slice(0, 5)
          .join(', ')}`
      );
    }
  });

  if (analysis.formatting.score < 70) {
    recommended.push(
      'Improve formatting using headings, dates, and bullet points.'
    );
  }

  aiSuggestions.push(
    'Use measurable achievements like “Improved performance by 30%”.'
  );

  aiSuggestions.push(
    'Tailor your resume for every job application.'
  );

  return {
    critical,
    recommended,
    aiSuggestions,
  };
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

    const jobDescription = formData.get(
      'jobDescription'
    ) as string | null;

    if (!file || !jobDescription) {
      return NextResponse.json(
        {
          error: 'Resume file and job description are required',
        },
        { status: 400, headers }
      );
    }

    const resumeText = await extractTextFromFile(file);

    const jobKeywords =
      jobDescription
        .toLowerCase()
        .match(/\b[\w-]{3,}\b/g) || [];

    const resumeWords =
      resumeText.toLowerCase().match(/\b[\w-]{3,}\b/g) || [];

    const keywordMatch = calculateKeywordMatch(
      jobKeywords,
      resumeWords
    );

    const sectionScores = calculateSectionPresence(
      resumeText,
      resumeWords,
      jobKeywords
    );

    const formatting = calculateFormattingScore(resumeText);

    const sectionAverage =
      sectionScores.reduce((sum, section) => {
        return sum + section.score;
      }, 0) / sectionScores.length;

    const overallScore = Math.max(
      20,
      Math.round(
        keywordMatch.score * 0.5 +
          sectionAverage * 0.35 +
          formatting.score * 0.15
      )
    );

    const improvements = generateImprovements({
      keywordMatch,
      sectionScores,
      formatting,
    });

    return NextResponse.json(
      {
        success: true,

        score: overallScore,

        analysis: {
          keywordMatch,

          sectionScores,

          formatting,
        },

        insights: {
          strongestSection: [...sectionScores].sort(
            (a, b) => b.score - a.score
          )[0],

          weakestSection: [...sectionScores].sort(
            (a, b) => a.score - b.score
          )[0],

          matchedKeywordCount: keywordMatch.found.length,

          missingKeywordCount: keywordMatch.missing.length,
        },

        improvements,
      },
      { headers }
    );
  } catch (error) {
    console.error('Server error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      {
        status: 500,
        headers,
      }
    );
  }
}