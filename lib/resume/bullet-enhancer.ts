export interface BulletEnhancementContext {
  bullet: string;
  title?: string;
  company?: string;
  skills?: string;
}

export function validateBulletInput(bullet: unknown): string {
  if (typeof bullet !== 'string') {
    throw new Error('Bullet point is required');
  }

  const trimmed = bullet.trim();
  if (!trimmed) {
    throw new Error('Bullet point cannot be empty');
  }

  if (trimmed.length > 600) {
    throw new Error('Bullet point must be 600 characters or less');
  }

  return trimmed;
}

export function buildBulletEnhancementPrompt(context: BulletEnhancementContext): string {
  const bullet = validateBulletInput(context.bullet);
  const title = context.title?.trim() || 'Not provided';
  const company = context.company?.trim() || 'Not provided';
  const skills = context.skills?.trim() || 'Not provided';

  return `You are an expert resume writer and ATS optimization specialist.

Rewrite exactly one resume experience bullet so it is stronger, action-oriented, concise, and ATS-friendly.

Original bullet:
"${bullet}"

Role context:
- Job title: ${title}
- Company: ${company}
- Relevant skills/keywords: ${skills}

Rules:
- Return only one improved bullet point.
- Start with a strong action verb.
- Preserve the user's meaning and do not invent metrics, tools, employers, dates, or outcomes.
- If the original includes metrics, keep or sharpen them.
- Prefer 18-32 words.
- Do not include markdown, explanations, quotation marks, or multiple alternatives.`;
}

export function cleanEnhancedBullet(value: string): string {
  return value
    .trim()
    .replace(/^[-*•]\s*/, '')
    .replace(/^["'`]+|["'`]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
