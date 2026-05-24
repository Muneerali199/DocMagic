interface Slide {
  slideNumber: number;
  title: string;
  subtitle?: string;
  content: string;
  bullets?: string[];
  stats?: { value: string; label: string }[];
  design?: { background: string; layout: string };
}

export interface QualityIssue {
  ruleId: string;
  severity: 'error' | 'warning';
  message: string;
  autoFixable: boolean;
  suggestedFix: string;
}

export interface SlideQualityReport {
  slideNumber: number;
  slideTitle: string;
  passed: boolean;
  issues: QualityIssue[];
}

function getWordCount(text: string | undefined): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function analyzeSlideQuality(slide: Slide): SlideQualityReport {
  const issues: QualityIssue[] = [];

  // 1. ruleId: 'missing-title'
  // error if title is empty or undefined
  if (!slide.title || slide.title.trim() === '') {
    issues.push({
      ruleId: 'missing-title',
      severity: 'error',
      message: 'Slide title is missing or empty',
      autoFixable: false,
      suggestedFix: 'Add a title to the slide',
    });
  }

  // 2. ruleId: 'title-too-long'
  // warning if title word count > 10
  if (slide.title && getWordCount(slide.title) > 10) {
    issues.push({
      ruleId: 'title-too-long',
      severity: 'warning',
      message: 'Title exceeds 10 words',
      autoFixable: true,
      suggestedFix: 'Trim title to first 10 words',
    });
  }

  // 3. ruleId: 'too-many-bullets'
  // warning if bullets.length > 6
  if (slide.bullets && slide.bullets.length > 6) {
    issues.push({
      ruleId: 'too-many-bullets',
      severity: 'warning',
      message: 'Slide has too many bullet points (more than 6)',
      autoFixable: true,
      suggestedFix: 'Split into two slides',
    });
  }

  // 4. ruleId: 'bullet-too-long'
  // warning if any single bullet > 15 words
  if (slide.bullets && slide.bullets.some(bullet => getWordCount(bullet) > 15)) {
    issues.push({
      ruleId: 'bullet-too-long',
      severity: 'warning',
      message: 'One or more bullet points are too long (over 15 words)',
      autoFixable: true,
      suggestedFix: 'Trim bullet to 15 words',
    });
  }

  // 5. ruleId: 'content-overflow'
  // warning if content word count > 80
  if (slide.content && getWordCount(slide.content) > 80) {
    issues.push({
      ruleId: 'content-overflow',
      severity: 'warning',
      message: 'Content word count exceeds 80 words',
      autoFixable: true,
      suggestedFix: 'Trim content to 80 words',
    });
  }

  // 6. ruleId: 'low-contrast'
  // warning if design?.background includes any of: 'white', '#fff', '#ffffff', 'light'
  if (slide.design?.background) {
    const bg = slide.design.background.toLowerCase();
    const lowContrastKeywords = ['white', '#fff', '#ffffff', 'light'];
    const hasLowContrast = lowContrastKeywords.some(keyword => bg.includes(keyword));
    if (hasLowContrast) {
      issues.push({
        ruleId: 'low-contrast',
        severity: 'warning',
        message: 'Background color may have low contrast',
        autoFixable: false,
        suggestedFix: 'Change background color manually',
      });
    }
  }

  return {
    slideNumber: slide.slideNumber,
    slideTitle: slide.title || '',
    passed: issues.length === 0,
    issues,
  };
}
