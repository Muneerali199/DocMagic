import { describe, it, expect } from 'vitest';
import { lintMermaid, autoFixMermaid } from '../lintMermaid';

describe('lintMermaid', () => {
  describe('Valid Diagrams (Zero Errors)', () => {
    it('should pass for a valid Flowchart diagram', () => {
      const source = `flowchart
  A[Start] --> B(Process)
  B --> C{Decision}
  C -->|Yes| D[Success]
  C -->|No| E[Fail]`;
      const errors = lintMermaid(source);
      expect(errors).toHaveLength(0);
    });

    it('should pass for a valid Sequence diagram', () => {
      const source = `sequenceDiagram
  Alice->>Bob: Hello Bob, how are you?
  Bob-->>Alice: Jolly good!`;
      const errors = lintMermaid(source);
      expect(errors).toHaveLength(0);
    });

    it('should pass for a valid State diagram', () => {
      const source = `stateDiagram-v2
  [*] --> Still
  Still --> [*]`;
      const errors = lintMermaid(source);
      expect(errors).toHaveLength(0);
    });

    it('should pass for a valid Gantt chart', () => {
      const source = `gantt
  title A Gantt Diagram
  dateFormat YYYY-MM-DD
  section Section
  A task :active, a1, 2026-05-20, 30d`;
      const errors = lintMermaid(source);
      expect(errors).toHaveLength(0);
    });

    it('should pass for a valid GitGraph diagram', () => {
      const source = `gitGraph
  commit id: "Init"
  branch develop
  checkout develop
  commit id: "Feature"
  checkout main
  merge develop`;
      const errors = lintMermaid(source);
      expect(errors).toHaveLength(0);
    });
  });

  describe('Known Error Patterns (One test per rule)', () => {
    it('should detect unquoted-parentheses rule', () => {
      const source = `flowchart
  A(B(C))`;
      const errors = lintMermaid(source);
      expect(errors).toContainEqual(
        expect.objectContaining({
          ruleId: 'unquoted-parentheses',
          severity: 'error',
          line: 2,
        })
      );
    });

    it('should detect reserved-keyword-node-id rule', () => {
      const source = `flowchart
  subgraph --> B`;
      const errors = lintMermaid(source);
      expect(errors).toContainEqual(
        expect.objectContaining({
          ruleId: 'reserved-keyword-node-id',
          severity: 'error',
          line: 2,
        })
      );
    });

    it('should detect invalid-flowchart-link rule', () => {
      const source = `flowchart
  A -> B`;
      const errors = lintMermaid(source);
      expect(errors).toContainEqual(
        expect.objectContaining({
          ruleId: 'invalid-flowchart-link',
          severity: 'error',
          line: 2,
          autoFixable: true,
        })
      );
    });

    it('should detect missing-subgraph-end rule', () => {
      const source = `flowchart
  subgraph MySubgraph
    A --> B`;
      const errors = lintMermaid(source);
      expect(errors).toContainEqual(
        expect.objectContaining({
          ruleId: 'missing-subgraph-end',
          severity: 'error',
          line: 2,
        })
      );
    });

    it('should detect semicolon-style-delimiter rule', () => {
      const source = `flowchart
  style A fill:#fff;stroke:#000;`;
      const errors = lintMermaid(source);
      expect(errors).toContainEqual(
        expect.objectContaining({
          ruleId: 'semicolon-style-delimiter',
          severity: 'error',
          line: 2,
          autoFixable: true,
        })
      );
    });

    it('should detect invalid-direction rule', () => {
      const source = `flowchart L2R
  A --> B`;
      const errors = lintMermaid(source);
      expect(errors).toContainEqual(
        expect.objectContaining({
          ruleId: 'invalid-direction',
          severity: 'error',
          line: 1,
          autoFixable: true,
        })
      );
    });

    it('should detect spaces-in-node-id rule', () => {
      const source = `flowchart
  Node One --> B`;
      const errors = lintMermaid(source);
      expect(errors).toContainEqual(
        expect.objectContaining({
          ruleId: 'spaces-in-node-id',
          severity: 'error',
          line: 2,
        })
      );
    });

    it('should not detect spaces-in-node-id on the diagram type declaration line', () => {
      const source = `flowchart TD
  A --> B`;
      const errors = lintMermaid(source);
      const spacesInNodeIdErrors = errors.filter(e => e.ruleId === 'spaces-in-node-id');
      expect(spacesInNodeIdErrors).toHaveLength(0);
    });

    it('should detect malformed-html-label rule', () => {
      const source = `flowchart
  A[<div>Label]`;
      const errors = lintMermaid(source);
      expect(errors).toContainEqual(
        expect.objectContaining({
          ruleId: 'malformed-html-label',
          severity: 'error',
          line: 2,
        })
      );
    });

    it('should detect invalid-sequence-arrow rule', () => {
      const source = `sequenceDiagram
  A ==> B`;
      const errors = lintMermaid(source);
      expect(errors).toContainEqual(
        expect.objectContaining({
          ruleId: 'invalid-sequence-arrow',
          severity: 'error',
          line: 2,
        })
      );
    });

    it('should detect special-chars-state-id rule', () => {
      const source = `stateDiagram-v2
  State-One --> State-Two`;
      const errors = lintMermaid(source);
      expect(errors).toContainEqual(
        expect.objectContaining({
          ruleId: 'special-chars-state-id',
          severity: 'error',
          line: 2,
        })
      );
    });

    it('should detect invalid-link-text-placement rule', () => {
      const source = `flowchart
  A --> text B`;
      const errors = lintMermaid(source);
      expect(errors).toContainEqual(
        expect.objectContaining({
          ruleId: 'invalid-link-text-placement',
          severity: 'warning',
          line: 2,
        })
      );
    });

    it('should detect mismatched-shape-brackets rule', () => {
      const source = `flowchart
  A[Label)`;
      const errors = lintMermaid(source);
      expect(errors).toContainEqual(
        expect.objectContaining({
          ruleId: 'mismatched-shape-brackets',
          severity: 'error',
          line: 2,
        })
      );
    });

    it('should detect semicolon-classdef rule', () => {
      const source = `flowchart
  classDef myClass fill:#fff;stroke:#000;`;
      const errors = lintMermaid(source);
      expect(errors).toContainEqual(
        expect.objectContaining({
          ruleId: 'semicolon-classdef',
          severity: 'error',
          line: 2,
          autoFixable: true,
        })
      );
    });

    it('should detect gantt-date-format-mismatch rule', () => {
      const source = `gantt
  dateFormat YYYY-MM-DD
  section Section
  Task : 2026/05/22, 10d`;
      const errors = lintMermaid(source);
      expect(errors).toContainEqual(
        expect.objectContaining({
          ruleId: 'gantt-date-format-mismatch',
          severity: 'error',
          line: 4,
        })
      );
    });

    it('should detect invalid-gitgraph-commit rule', () => {
      const source = `gitGraph
  commit "message"`;
      const errors = lintMermaid(source);
      expect(errors).toContainEqual(
        expect.objectContaining({
          ruleId: 'invalid-gitgraph-commit',
          severity: 'error',
          line: 2,
        })
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string without errors', () => {
      const errors = lintMermaid('');
      expect(errors).toHaveLength(0);
    });

    it('should handle only whitespace without errors', () => {
      const errors = lintMermaid('   \n  \n\t ');
      expect(errors).toHaveLength(0);
    });

    it('should throw TypeError if source is not a string', () => {
      expect(() => lintMermaid(null as any)).toThrow(TypeError);
    });

    it('should handle very large diagram (500+ nodes) efficiently', () => {
      let source = 'flowchart\n';
      for (let i = 0; i < 510; i++) {
        source += `  node${i} --> node${i + 1}\n`;
      }
      const startTime = performance.now();
      const errors = lintMermaid(source);
      const endTime = performance.now();

      expect(errors).toHaveLength(0);
      expect(endTime - startTime).toBeLessThan(100); // Should run in less than 100ms
    });
  });
});

describe('autoFixMermaid', () => {
  describe('Idempotency', () => {
    it('should ensure that applying autoFix twice gives the same result as once', () => {
      const source = `flowchart L2R
  A -> B;
  style A fill:#fff;stroke:#000;
  classDef c1 fill:#000;`;

      const errors1 = lintMermaid(source);
      const result1 = autoFixMermaid(source, errors1);

      // Note: Only the 4 auto-fixable errors are fixed.
      expect(result1.appliedFixes).toHaveLength(4);
      expect(result1.fixedSource).toContain('flowchart LR');
      expect(result1.fixedSource).toContain('A --> B;');
      expect(result1.fixedSource).toContain('style A fill:#fff,stroke:#000,');
      expect(result1.fixedSource).toContain('classDef c1 fill:#000,');

      const errors2 = lintMermaid(result1.fixedSource);
      const result2 = autoFixMermaid(result1.fixedSource, errors2);

      expect(result2.fixedSource).toBe(result1.fixedSource);
      expect(result2.appliedFixes).toHaveLength(0);
    });
  });

  describe('Conflict Handling', () => {
    it('should skip conflicting fixes on the same line', () => {
      const source = `flowchart TD
  style A->B fill:#fff;`;

      const errors = lintMermaid(source);
      const result = autoFixMermaid(source, errors);

      expect(result.skippedConflicts).toHaveLength(2);
      expect(result.appliedFixes).toHaveLength(0);
      expect(result.fixedSource).toBe(source);
    });
  });
});
