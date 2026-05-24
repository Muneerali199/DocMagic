import { describe, it, expect, beforeEach } from 'vitest';
import { autoFixSlide } from '../autoFixSlide';

import { Slide } from '@/components/presentation/real-time-generator';
import { QualityIssue } from '../analyzeSlideQuality';

describe('autoFixSlide tests', () => {
  const baseSlide: Slide = {
    slideNumber: 1,
    type: 'content',
    title: 'Base Title',
    content: 'This is body content.',
    bullets: ['Bullet 1', 'Bullet 2'],
    design: {
      background: 'darkblue',
      layout: 'standard',
    },
  };

  it('returns original slide and empty fixes list if no autoFixable issues exist', () => {
    const issues: QualityIssue[] = [
      {
        ruleId: 'missing-title',
        severity: 'error',
        message: 'Slide title is missing or empty',
        autoFixable: false,
        suggestedFix: 'Add a title to the slide',
      },
      {
        ruleId: 'low-contrast',
        severity: 'warning',
        message: 'Background color may have low contrast',
        autoFixable: false,
        suggestedFix: 'Change background color manually',
      },
    ];

    const result = autoFixSlide(baseSlide, issues);
    expect(result.fixedSlides).toHaveLength(1);
    expect(result.fixedSlides[0]).toBe(baseSlide);
    expect(result.appliedFixes).toHaveLength(0);
  });

  it('correctly fixes title-too-long issue', () => {
    const slide = {
      ...baseSlide,
      title: 'One Two Three Four Five Six Seven Eight Nine Ten Eleven Twelve',
    };
    const issues: QualityIssue[] = [
      {
        ruleId: 'title-too-long',
        severity: 'warning',
        message: 'Title exceeds 10 words',
        autoFixable: true,
        suggestedFix: 'Trim title to first 10 words',
      },
    ];

    const result = autoFixSlide(slide, issues);
    expect(result.fixedSlides).toHaveLength(1);
    expect(result.fixedSlides[0].title).toBe('One Two Three Four Five Six Seven Eight Nine Ten...');
    expect(result.appliedFixes).toHaveLength(1);
    expect(result.appliedFixes[0]).toEqual({
      ruleId: 'title-too-long',
      slideNumber: 1,
      originalValue: 'One Two Three Four Five Six Seven Eight Nine Ten Eleven Twelve',
      fixedValue: 'One Two Three Four Five Six Seven Eight Nine Ten...',
    });
  });

  it('correctly fixes content-overflow issue', () => {
    const words = Array(90).fill('word');
    const longContent = words.join(' ');
    const expectedContent = words.slice(0, 80).join(' ') + '...';

    const slide = {
      ...baseSlide,
      content: longContent,
    };
    const issues: QualityIssue[] = [
      {
        ruleId: 'content-overflow',
        severity: 'warning',
        message: 'Content word count exceeds 80 words',
        autoFixable: true,
        suggestedFix: 'Trim content to 80 words',
      },
    ];

    const result = autoFixSlide(slide, issues);
    expect(result.fixedSlides).toHaveLength(1);
    expect(result.fixedSlides[0].content).toBe(expectedContent);
    expect(result.appliedFixes).toHaveLength(1);
    expect(result.appliedFixes[0]).toEqual({
      ruleId: 'content-overflow',
      slideNumber: 1,
      originalValue: longContent,
      fixedValue: expectedContent,
    });
  });

  it('correctly fixes bullet-too-long issue', () => {
    const longBullet = Array(20).fill('bullet').join(' ');
    const expectedBullet = Array(15).fill('bullet').join(' ') + '...';

    const slide = {
      ...baseSlide,
      bullets: ['Short bullet', longBullet, 'Another short bullet'],
    };
    const issues: QualityIssue[] = [
      {
        ruleId: 'bullet-too-long',
        severity: 'warning',
        message: 'One or more bullet points are too long (over 15 words)',
        autoFixable: true,
        suggestedFix: 'Trim bullet to 15 words',
      },
    ];

    const result = autoFixSlide(slide, issues);
    expect(result.fixedSlides).toHaveLength(1);
    expect(result.fixedSlides[0].bullets).toEqual(['Short bullet', expectedBullet, 'Another short bullet']);
    expect(result.appliedFixes).toHaveLength(1);
    expect(result.appliedFixes[0]).toEqual({
      ruleId: 'bullet-too-long',
      slideNumber: 1,
      originalValue: longBullet,
      fixedValue: expectedBullet,
    });
  });

  it('correctly fixes too-many-bullets issue by splitting bullets into two equal halves', () => {
    const slide = {
      ...baseSlide,
      bullets: ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7'],
    };
    const issues: QualityIssue[] = [
      {
        ruleId: 'too-many-bullets',
        severity: 'warning',
        message: 'Slide has too many bullet points (more than 6)',
        autoFixable: true,
        suggestedFix: 'Split into two slides',
      },
    ];

    const result = autoFixSlide(slide, issues);
    expect(result.fixedSlides).toHaveLength(2);

    const [firstSlide, secondSlide] = result.fixedSlides;

    expect(firstSlide.slideNumber).toBe(1);
    expect(firstSlide.title).toBe('Base Title');
    expect(firstSlide.bullets).toEqual(['b1', 'b2', 'b3', 'b4']);

    expect(secondSlide.slideNumber).toBe(1.5);
    expect(secondSlide.title).toBe('Base Title (continued)');
    expect(secondSlide.bullets).toEqual(['b5', 'b6', 'b7']);

    expect(result.appliedFixes).toHaveLength(1);
    expect(result.appliedFixes[0]).toEqual({
      ruleId: 'too-many-bullets',
      slideNumber: 1,
      originalValue: '7 bullets',
      fixedValue: '4 bullets on main slide, 3 bullets on continued slide',
    });
  });

  it('correctly applies multiple fixes together in sequence', () => {
    const longBullet = Array(20).fill('bullet').join(' ');
    const expectedBullet = Array(15).fill('bullet').join(' ') + '...';

    const slide = {
      ...baseSlide,
      title: 'One Two Three Four Five Six Seven Eight Nine Ten Eleven Twelve',
      bullets: ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', longBullet],
    };

    const issues: QualityIssue[] = [
      {
        ruleId: 'title-too-long',
        severity: 'warning',
        message: 'Title exceeds 10 words',
        autoFixable: true,
        suggestedFix: 'Trim title to first 10 words',
      },
      {
        ruleId: 'bullet-too-long',
        severity: 'warning',
        message: 'One or more bullet points are too long',
        autoFixable: true,
        suggestedFix: 'Trim bullet to 15 words',
      },
      {
        ruleId: 'too-many-bullets',
        severity: 'warning',
        message: 'Slide has too many bullet points',
        autoFixable: true,
        suggestedFix: 'Split into two slides',
      },
    ];

    const result = autoFixSlide(slide, issues);
    expect(result.fixedSlides).toHaveLength(2);

    const [firstSlide, secondSlide] = result.fixedSlides;

    // Both slides should have the trimmed title (with (continued) added to the second slide)
    expect(firstSlide.title).toBe('One Two Three Four Five Six Seven Eight Nine Ten...');
    expect(secondSlide.title).toBe('One Two Three Four Five Six Seven Eight Nine Ten... (continued)');

    // The long bullet was the 8th bullet, so it ends up in the second slide and should be trimmed
    expect(firstSlide.bullets).toEqual(['b1', 'b2', 'b3', 'b4']);
    expect(secondSlide.bullets).toEqual(['b5', 'b6', 'b7', expectedBullet]);

    expect(result.appliedFixes).toHaveLength(3);
    expect(result.appliedFixes).toContainEqual({
      ruleId: 'title-too-long',
      slideNumber: 1,
      originalValue: 'One Two Three Four Five Six Seven Eight Nine Ten Eleven Twelve',
      fixedValue: 'One Two Three Four Five Six Seven Eight Nine Ten...',
    });
    expect(result.appliedFixes).toContainEqual({
      ruleId: 'bullet-too-long',
      slideNumber: 1,
      originalValue: longBullet,
      fixedValue: expectedBullet,
    });
    expect(result.appliedFixes).toContainEqual({
      ruleId: 'too-many-bullets',
      slideNumber: 1,
      originalValue: '8 bullets',
      fixedValue: '4 bullets on main slide, 4 bullets on continued slide',
    });
  });
});
