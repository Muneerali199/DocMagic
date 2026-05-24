import { describe, it, expect, beforeEach } from 'vitest';
import { analyzeSlideQuality } from '../analyzeSlideQuality';

describe('analyzeSlideQuality tests', () => {
  const validSlide = {
    slideNumber: 1,
    title: 'Valid Slide Title',
    content: 'This is a valid body content with less than eighty words in total.',
    bullets: ['First good bullet', 'Second good bullet'],
    design: {
      background: 'darkblue',
      layout: 'standard',
    },
  };

  it('passes a completely valid slide', () => {
    const report = analyzeSlideQuality(validSlide);
    expect(report.passed).toBe(true);
    expect(report.issues).toHaveLength(0);
    expect(report.slideNumber).toBe(1);
    expect(report.slideTitle).toBe('Valid Slide Title');
  });

  // Check 1: missing-title
  it('detects missing or empty title', () => {
    const slideWithEmptyTitle = { ...validSlide, title: '' };
    const reportEmpty = analyzeSlideQuality(slideWithEmptyTitle);
    expect(reportEmpty.passed).toBe(false);
    const issueEmpty = reportEmpty.issues.find((i) => i.ruleId === 'missing-title');
    expect(issueEmpty).toBeDefined();
    expect(issueEmpty?.severity).toBe('error');
    expect(issueEmpty?.autoFixable).toBe(false);

    const slideWithNullTitle = { ...validSlide, title: undefined as any };
    const reportNull = analyzeSlideQuality(slideWithNullTitle);
    expect(reportNull.passed).toBe(false);
    const issueNull = reportNull.issues.find((i) => i.ruleId === 'missing-title');
    expect(issueNull).toBeDefined();
    expect(issueNull?.severity).toBe('error');
  });

  // Check 2: title-too-long
  it('detects title that is too long (> 10 words)', () => {
    const slideWithLongTitle = {
      ...validSlide,
      title: 'This Title Is Extremely Long And It Has More Than Ten Words In It',
    };
    const report = analyzeSlideQuality(slideWithLongTitle);
    expect(report.passed).toBe(false);
    const issue = report.issues.find((i) => i.ruleId === 'title-too-long');
    expect(issue).toBeDefined();
    expect(issue?.severity).toBe('warning');
    expect(issue?.autoFixable).toBe(true);
    expect(issue?.suggestedFix).toBe('Trim title to first 10 words');
  });

  // Check 3: too-many-bullets
  it('detects slide with too many bullets (> 6)', () => {
    const slideWithTooManyBullets = {
      ...validSlide,
      bullets: ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7'],
    };
    const report = analyzeSlideQuality(slideWithTooManyBullets);
    expect(report.passed).toBe(false);
    const issue = report.issues.find((i) => i.ruleId === 'too-many-bullets');
    expect(issue).toBeDefined();
    expect(issue?.severity).toBe('warning');
    expect(issue?.autoFixable).toBe(true);
    expect(issue?.suggestedFix).toBe('Split into two slides');
  });

  // Check 4: bullet-too-long
  it('detects slide where any single bullet > 15 words', () => {
    const slideWithLongBullet = {
      ...validSlide,
      bullets: [
        'Short bullet',
        'This is a bullet point that is exceptionally long and contains far more than fifteen words in order to trigger the lint warning properly.',
      ],
    };
    const report = analyzeSlideQuality(slideWithLongBullet);
    expect(report.passed).toBe(false);
    const issue = report.issues.find((i) => i.ruleId === 'bullet-too-long');
    expect(issue).toBeDefined();
    expect(issue?.severity).toBe('warning');
    expect(issue?.autoFixable).toBe(true);
    expect(issue?.suggestedFix).toBe('Trim bullet to 15 words');
  });

  // Check 5: content-overflow
  it('detects slide where content word count > 80', () => {
    const longContent = Array(90).fill('word').join(' ');
    const slideWithLongContent = {
      ...validSlide,
      content: longContent,
    };
    const report = analyzeSlideQuality(slideWithLongContent);
    expect(report.passed).toBe(false);
    const issue = report.issues.find((i) => i.ruleId === 'content-overflow');
    expect(issue).toBeDefined();
    expect(issue?.severity).toBe('warning');
    expect(issue?.autoFixable).toBe(true);
    expect(issue?.suggestedFix).toBe('Trim content to 80 words');
  });

  // Check 6: low-contrast
  it('detects low-contrast background colors', () => {
    const lowContrastBackgrounds = ['white', '#fff', '#ffffff', 'light-gray', 'light', 'LIGHTBLUE', '#FFFFFF'];
    for (const bg of lowContrastBackgrounds) {
      const slide = {
        ...validSlide,
        design: {
          background: bg,
          layout: 'centered',
        },
      };
      const report = analyzeSlideQuality(slide);
      expect(report.passed).toBe(false);
      const issue = report.issues.find((i) => i.ruleId === 'low-contrast');
      expect(issue).toBeDefined();
      expect(issue?.severity).toBe('warning');
      expect(issue?.autoFixable).toBe(false);
      expect(issue?.suggestedFix).toBe('Change background color manually');
    }
  });

  it('does not trigger low-contrast warning for high-contrast background colors', () => {
    const highContrastBackgrounds = ['black', '#000', '#000000', 'dark-gray', 'darkblue', 'blue', 'green'];
    for (const bg of highContrastBackgrounds) {
      const slide = {
        ...validSlide,
        design: {
          background: bg,
          layout: 'centered',
        },
      };
      const report = analyzeSlideQuality(slide);
      const issue = report.issues.find((i) => i.ruleId === 'low-contrast');
      expect(issue).toBeUndefined();
    }
  });
});
