import { parseInlineFormatting, sanitizeFilename, formatContentForHtml } from '../documents/export';

// Helper functions to extract data from docx TextRun objects.
// TextRun stores text in root → w:t → root[1] and formatting in root → w:rPr → root entries.
function getTextFromRun(run: any): string | undefined {
  const textEl = run.root?.find?.((el: any) => el.rootKey === 'w:t');
  return textEl?.root?.[1];
}

function hasBold(run: any): boolean {
  const props = run.root?.find?.((el: any) => el.rootKey === 'w:rPr');
  return props?.root?.some?.((el: any) => el.rootKey === 'w:b') ?? false;
}

function hasItalics(run: any): boolean {
  const props = run.root?.find?.((el: any) => el.rootKey === 'w:rPr');
  return props?.root?.some?.((el: any) => el.rootKey === 'w:i') ?? false;
}

describe('Document Export Utilities', () => {
  describe('parseInlineFormatting', () => {
    it('should parse bold and italic text', () => {
      const text = '***bold italic***';
      const runs = parseInlineFormatting(text);
      expect(runs).toHaveLength(1);
      expect(hasBold(runs[0])).toBe(true);
      expect(hasItalics(runs[0])).toBe(true);
      expect(getTextFromRun(runs[0])).toBe('bold italic');
    });

    it('should parse bold text', () => {
      const text = '**bold**';
      const runs = parseInlineFormatting(text);
      expect(runs).toHaveLength(1);
      expect(hasBold(runs[0])).toBe(true);
      expect(hasItalics(runs[0])).toBe(false);
      expect(getTextFromRun(runs[0])).toBe('bold');
    });

    it('should parse italic text', () => {
      const text = '*italic*';
      const runs = parseInlineFormatting(text);
      expect(runs).toHaveLength(1);
      expect(hasBold(runs[0])).toBe(false);
      expect(hasItalics(runs[0])).toBe(true);
      expect(getTextFromRun(runs[0])).toBe('italic');
    });

    it('should parse plain text', () => {
      const text = 'plain text';
      const runs = parseInlineFormatting(text);
      expect(runs).toHaveLength(1);
      expect(hasBold(runs[0])).toBe(false);
      expect(hasItalics(runs[0])).toBe(false);
      expect(getTextFromRun(runs[0])).toBe('plain text');
    });

    it('should parse mixed text', () => {
      const text = 'Hello **world** with *italic* words.';
      const runs = parseInlineFormatting(text);
      // 5 runs: "Hello ", "world" (bold), " with ", "italic" (italic), " words."
      expect(runs).toHaveLength(5);
      expect(getTextFromRun(runs[0])).toBe('Hello ');
      expect(getTextFromRun(runs[1])).toBe('world');
      expect(hasBold(runs[1])).toBe(true);
      expect(getTextFromRun(runs[2])).toBe(' with ');
      expect(getTextFromRun(runs[3])).toBe('italic');
      expect(hasItalics(runs[3])).toBe(true);
      expect(getTextFromRun(runs[4])).toBe(' words.');
    });
  });

  describe('sanitizeFilename', () => {
    it('should remove invalid characters and replace spaces', () => {
      expect(sanitizeFilename('My Document: Title!')).toBe('my-document-title');
    });

    it('should truncate to 50 characters', () => {
      const longTitle = 'a'.repeat(60);
      expect(sanitizeFilename(longTitle).length).toBe(50);
    });

    it('should handle multiple spaces', () => {
      expect(sanitizeFilename('a   b')).toBe('a-b');
    });
  });

  describe('formatContentForHtml', () => {
    it('should format headings', () => {
      const content = '# Heading 1\n## Heading 2\n### Heading 3';
      const html = formatContentForHtml(content);
      expect(html).toContain('<h1>Heading 1</h1>');
      expect(html).toContain('<h2>Heading 2</h2>');
      expect(html).toContain('<h3>Heading 3</h3>');
    });

    it('should format bold and italic text', () => {
      const content = '**bold** and *italic*';
      const html = formatContentForHtml(content);
      expect(html).toContain('<strong>bold</strong>');
      expect(html).toContain('<em>italic</em>');
    });

    it('should format list items', () => {
      const content = '- Item 1\n1. Item 2';
      const html = formatContentForHtml(content);
      expect(html).toContain('<li>Item 1</li>');
      expect(html).toContain('<li>Item 2</li>');
    });
  });
});
