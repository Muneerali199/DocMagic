import {
  buildBulletEnhancementPrompt,
  cleanEnhancedBullet,
  validateBulletInput,
} from '../bullet-enhancer';

describe('resume bullet enhancer helpers', () => {
  it('builds a scoped prompt that prevents fabricated metrics', () => {
    const prompt = buildBulletEnhancementPrompt({
      bullet: 'worked on dashboard bugs',
      title: 'Frontend Developer',
      company: 'Acme',
      skills: 'React, TypeScript',
    });

    expect(prompt).toContain('worked on dashboard bugs');
    expect(prompt).toContain('Frontend Developer');
    expect(prompt).toContain('React, TypeScript');
    expect(prompt).toContain('do not invent metrics');
    expect(prompt).toContain('Return only one improved bullet point');
  });

  it('cleans markdown bullets and quotes from AI output', () => {
    expect(cleanEnhancedBullet('• "Optimized React dashboards for clearer release tracking."')).toBe(
      'Optimized React dashboards for clearer release tracking.',
    );
  });

  it('rejects empty bullets', () => {
    expect(() => validateBulletInput('   ')).toThrow('cannot be empty');
  });

  it('rejects bullets longer than 600 characters', () => {
    expect(() => validateBulletInput('a'.repeat(601))).toThrow('600 characters');
  });
});
