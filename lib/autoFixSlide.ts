import { Slide } from '@/components/presentation/real-time-generator';
import { QualityIssue } from './analyzeSlideQuality';

export interface FixRecord {
  ruleId: string;
  slideNumber: number;
  originalValue: string;
  fixedValue: string;
}

export function autoFixSlide(
  slide: Slide,
  issues: QualityIssue[]
): { fixedSlides: Slide[]; appliedFixes: FixRecord[] } {
  // Filter for autoFixable issues only
  const autoFixableIssues = issues.filter((issue) => issue.autoFixable === true);

  // Skip missing-title and low-contrast silently by filtering them out just in case
  const fixableIssues = autoFixableIssues.filter(
    (issue) => issue.ruleId !== 'missing-title' && issue.ruleId !== 'low-contrast'
  );

  // If no autoFixable issues exist, return early with the original slide reference
  if (fixableIssues.length === 0) {
    return { fixedSlides: [slide], appliedFixes: [] };
  }

  // Clone slide to avoid mutating the original slide directly
  const clonedSlide: Slide = {
    ...slide,
    bullets: slide.bullets ? [...slide.bullets] : undefined,
  };

  const appliedFixes: FixRecord[] = [];

  // 1. title-too-long: trim title to first 10 words + '...'
  const hasTitleTooLong = fixableIssues.some((i) => i.ruleId === 'title-too-long');
  if (hasTitleTooLong && clonedSlide.title) {
    const words = clonedSlide.title.trim().split(/\s+/).filter(Boolean);
    if (words.length > 10) {
      const trimmed = words.slice(0, 10).join(' ') + '...';
      appliedFixes.push({
        ruleId: 'title-too-long',
        slideNumber: slide.slideNumber,
        originalValue: slide.title,
        fixedValue: trimmed,
      });
      clonedSlide.title = trimmed;
    }
  }

  // 2. content-overflow: trim content to first 80 words + '...'
  const hasContentOverflow = fixableIssues.some((i) => i.ruleId === 'content-overflow');
  if (hasContentOverflow && clonedSlide.content) {
    const words = clonedSlide.content.trim().split(/\s+/).filter(Boolean);
    if (words.length > 80) {
      const trimmed = words.slice(0, 80).join(' ') + '...';
      appliedFixes.push({
        ruleId: 'content-overflow',
        slideNumber: slide.slideNumber,
        originalValue: slide.content,
        fixedValue: trimmed,
      });
      clonedSlide.content = trimmed;
    }
  }

  // 3. bullet-too-long: trim each bullet to first 15 words + '...'
  const hasBulletTooLong = fixableIssues.some((i) => i.ruleId === 'bullet-too-long');
  if (hasBulletTooLong && clonedSlide.bullets) {
    let bulletChanged = false;
    const fixedBullets = clonedSlide.bullets.map((bullet) => {
      const words = bullet.trim().split(/\s+/).filter(Boolean);
      if (words.length > 15) {
        const trimmed = words.slice(0, 15).join(' ') + '...';
        appliedFixes.push({
          ruleId: 'bullet-too-long',
          slideNumber: slide.slideNumber,
          originalValue: bullet,
          fixedValue: trimmed,
        });
        bulletChanged = true;
        return trimmed;
      }
      return bullet;
    });
    if (bulletChanged) {
      clonedSlide.bullets = fixedBullets;
    }
  }

  // 4. too-many-bullets: split bullets into two equal halves
  const hasTooManyBullets = fixableIssues.some((i) => i.ruleId === 'too-many-bullets');
  let resultSlides: Slide[] = [clonedSlide];

  if (hasTooManyBullets && clonedSlide.bullets && clonedSlide.bullets.length > 0) {
    const bullets = clonedSlide.bullets;
    const mid = Math.ceil(bullets.length / 2);
    const firstHalf = bullets.slice(0, mid);
    const secondHalf = bullets.slice(mid);

    appliedFixes.push({
      ruleId: 'too-many-bullets',
      slideNumber: slide.slideNumber,
      originalValue: `${bullets.length} bullets`,
      fixedValue: `${firstHalf.length} bullets on main slide, ${secondHalf.length} bullets on continued slide`,
    });

    clonedSlide.bullets = firstHalf;

    const continuedSlide: Slide = {
      ...clonedSlide,
      slideNumber: clonedSlide.slideNumber + 0.5,
      title: clonedSlide.title + ' (continued)',
      bullets: secondHalf,
    };

    resultSlides = [clonedSlide, continuedSlide];
  }

  // If no fixes were actually applied (e.g. issues were passed but criteria weren't met)
  if (appliedFixes.length === 0) {
    return { fixedSlides: [slide], appliedFixes: [] };
  }

  return {
    fixedSlides: resultSlides,
    appliedFixes,
  };
}
