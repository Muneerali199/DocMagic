import { parseInlineFormatting, sanitizeFilename, formatContentForHtml } from '../documents/export';

describe('Document Export Utilities', () => {
  describe('parseInlineFormatting', () => {
    it('should parse bold and italic text', () => {
      const text = '***bold italic***';
      const runs = parseInlineFormatting(text);
      expect(runs).toHaveLength(1);
      expect(runs[0].bold).toBe(true);
      expect(runs[0].italics).toBe(true);
      expect(runs[0].text).toBe('bold italic');
    });

    it('should parse bold text', () => {
      const text = '**bold**';
      const runs = parseInlineFormatting(text);
      expect(runs).toHaveLength(1);
      expect(runs[0].bold).toBe(true);
      expect(runs[0].italics).toBeUndefined();
      expect(runs[0].text).toBe('bold');
    });

    it('should parse italic text', () => {
      const text = '*italic*';
      const runs = parseInlineFormatting(text);
      expect(runs).toHaveLength(1);
      expect(runs[0].bold).toBeUndefined();
      expect(runs[0].italics).toBe(true);
      expect(runs[0].text).toBe('italic');
    });

    it('should parse plain text', () => {
      const text = 'plain text';
      const runs = parseInlineFormatting(text);
      expect(runs).toHaveLength(1);
      expect(runs[0].bold).toBeUndefined();
      expect(runs[0].italics).toBeUndefined();
      expect(runs[0].text).toBe('plain text');
    });

    it('should parse mixed text', () => {
      const text = 'Hello **world** with *italic* words.';
      const runs = parseInlineFormatting(text);
      expect(runs).toHaveLength(4);
      expect(runs[0].text).toBe('Hello ');
      expect(runs[1].text).toBe('world');
      expect(runs[1].bold).toBe(true);
      expect(runs[2].text).toBe(' with ');
      expect(runs[3].text).toBe('italic');
      expect(runs[3].italics).toBe(true);
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
