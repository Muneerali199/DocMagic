import { parseInlineFormatting } from '@/lib/documents/export';

describe('Document Export Utilities', () => {
  describe('parseInlineFormatting', () => {
    it('should parse bold and italic text', () => {
      const runs = parseInlineFormatting('***bold italic***');
      expect(runs).toHaveLength(1);
      
      const runStr = JSON.stringify(runs[0]);
      expect(runStr).toContain('bold italic');
      expect(runStr).toContain('"rootKey":"w:b"'); // bold tag in docx
      expect(runStr).toContain('"rootKey":"w:i"'); // italic tag in docx
    });

    it('should parse bold text', () => {
      const runs = parseInlineFormatting('**bold**');
      expect(runs).toHaveLength(1);
      
      const runStr = JSON.stringify(runs[0]);
      expect(runStr).toContain('bold');
      expect(runStr).toContain('"rootKey":"w:b"');
      expect(runStr).not.toContain('"rootKey":"w:i"');
    });

    it('should parse italic text', () => {
      const runs = parseInlineFormatting('*italic*');
      expect(runs).toHaveLength(1);
      
      const runStr = JSON.stringify(runs[0]);
      expect(runStr).toContain('italic');
      expect(runStr).toContain('"rootKey":"w:i"');
      expect(runStr).not.toContain('"rootKey":"w:b"');
    });

    it('should parse plain text', () => {
      const runs = parseInlineFormatting('plain text');
      expect(runs).toHaveLength(1);
      
      const runStr = JSON.stringify(runs[0]);
      expect(runStr).toContain('plain text');
      expect(runStr).not.toContain('"rootKey":"w:b"');
      expect(runStr).not.toContain('"rootKey":"w:i"');
    });

    it('should parse mixed text', () => {
      const runs = parseInlineFormatting('Hello **world** with *italic* words.');
      
      // The regex creates 5 chunks: Hello(1), world(2), with(3), italic(4), words.(5)
      expect(runs).toHaveLength(5);
      
      expect(JSON.stringify(runs[0])).toContain('Hello ');
      
      const boldRun = JSON.stringify(runs[1]);
      expect(boldRun).toContain('world');
      expect(boldRun).toContain('"rootKey":"w:b"');
      
      expect(JSON.stringify(runs[2])).toContain(' with ');
      
      const italicRun = JSON.stringify(runs[3]);
      expect(italicRun).toContain('italic');
      expect(italicRun).toContain('"rootKey":"w:i"');
      
      expect(JSON.stringify(runs[4])).toContain(' words.');
    });
  });
});